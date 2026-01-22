"""
Payment services for Stripe integration.
"""
import logging
import stripe
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.tickets.models import Order, TicketType
from apps.tickets.services import OrderService
from .models import StripeEvent, PaymentAttempt

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service for Stripe payment operations."""
    
    @classmethod
    def create_payment_intent(
        cls,
        order: Order,
        idempotency_key: str
    ) -> dict:
        """Create a Stripe PaymentIntent for an order."""
        try:
            intent = stripe.PaymentIntent.create(
                amount=order.total_cents,
                currency=order.currency.lower(),
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'buyer_email': order.buyer.email
                },
                idempotency_key=f"pi_{idempotency_key}",
                automatic_payment_methods={'enabled': True}
            )
            
            # Track payment attempt
            PaymentAttempt.objects.create(
                order=order,
                stripe_payment_intent_id=intent.id,
                amount_cents=order.total_cents,
                currency=order.currency,
                status=PaymentAttempt.Status.INITIATED
            )
            
            # Update order with payment intent
            order.stripe_payment_intent_id = intent.id
            order.status = Order.Status.PAYMENT_PENDING
            order.save(update_fields=['stripe_payment_intent_id', 'status'])
            
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {e}")
            raise ValueError(str(e))
    
    @classmethod
    def process_refund(
        cls,
        order: Order,
        amount_cents: int,
        reason: str = ''
    ) -> str:
        """Process a refund via Stripe."""
        if not order.stripe_payment_intent_id:
            raise ValueError("Order has no payment intent")
        
        try:
            refund = stripe.Refund.create(
                payment_intent=order.stripe_payment_intent_id,
                amount=amount_cents,
                reason='requested_by_customer',
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'internal_reason': reason
                }
            )
            
            return refund.id
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund error: {e}")
            raise ValueError(str(e))
    
    @classmethod
    @transaction.atomic
    def handle_webhook_event(cls, payload: bytes, sig_header: str) -> dict:
        """
        Handle Stripe webhook events idempotently.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {e}")
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {e}")
            raise ValueError("Invalid signature")
        
        # Check if already processed (idempotency)
        stripe_event_id = event.id
        existing = StripeEvent.objects.filter(stripe_event_id=stripe_event_id).first()
        
        if existing and existing.processed:
            logger.info(f"Event {stripe_event_id} already processed")
            return {'status': 'already_processed'}
        
        # Create or get event record
        stripe_event, created = StripeEvent.objects.get_or_create(
            stripe_event_id=stripe_event_id,
            defaults={
                'event_type': event.type,
                'payload': event.data.object
            }
        )
        
        try:
            result = cls._process_event(event)
            
            stripe_event.processed = True
            stripe_event.processed_at = timezone.now()
            stripe_event.save()
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing webhook {stripe_event_id}: {e}")
            stripe_event.processing_error = str(e)
            stripe_event.save()
            raise
    
    @classmethod
    def _process_event(cls, event) -> dict:
        """Process specific event types."""
        event_type = event.type
        data = event.data.object
        
        if event_type == 'payment_intent.succeeded':
            return cls._handle_payment_succeeded(data)
        
        elif event_type == 'payment_intent.payment_failed':
            return cls._handle_payment_failed(data)
        
        elif event_type == 'charge.refunded':
            return cls._handle_refund(data)
        
        else:
            logger.info(f"Unhandled event type: {event_type}")
            return {'status': 'ignored', 'event_type': event_type}
    
    @classmethod
    @transaction.atomic
    def _handle_payment_succeeded(cls, data) -> dict:
        """Handle successful payment - finalize order and issue tickets."""
        payment_intent_id = data.id
        order_id = data.metadata.get('order_id')
        
        if not order_id:
            logger.error(f"Payment intent {payment_intent_id} missing order_id")
            return {'status': 'error', 'message': 'Missing order_id'}
        
        try:
            order = OrderService.finalize_order(order_id, payment_intent_id)
            
            # Update payment attempt
            PaymentAttempt.objects.filter(
                stripe_payment_intent_id=payment_intent_id
            ).update(status=PaymentAttempt.Status.SUCCEEDED)
            
            logger.info(f"Payment succeeded for order {order.order_number}")
            
            return {'status': 'success', 'order_number': order.order_number}
            
        except Exception as e:
            logger.error(f"Error finalizing order {order_id}: {e}")
            raise
    
    @classmethod
    def _handle_payment_failed(cls, data) -> dict:
        """Handle failed payment."""
        payment_intent_id = data.id
        
        PaymentAttempt.objects.filter(
            stripe_payment_intent_id=payment_intent_id
        ).update(
            status=PaymentAttempt.Status.FAILED,
            failure_code=data.last_payment_error.get('code', '') if data.last_payment_error else '',
            failure_message=data.last_payment_error.get('message', '') if data.last_payment_error else ''
        )
        
        # Update order status
        Order.objects.filter(
            stripe_payment_intent_id=payment_intent_id
        ).update(status=Order.Status.FAILED)
        
        return {'status': 'failed_recorded'}
    
    @classmethod
    def _handle_refund(cls, data) -> dict:
        """Handle refund event."""
        # Refunds are handled via our RefundService
        # This is for logging/verification
        logger.info(f"Refund event received: {data.id}")
        return {'status': 'refund_logged'}
