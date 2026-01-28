"""
Stripe Checkout Session views for hosted checkout flow.
"""
import logging
import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from apps.tickets.models import Order
from apps.tickets.services import OrderService
from .guest_checkout import GuestCheckoutService

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    """Create Stripe Checkout Session for hosted checkout."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="Create Stripe Checkout Session")
    def post(self, request):
        try:
            data = request.data
            
            # Get or create user
            user, created = GuestCheckoutService.get_or_create_user(
                email=data['email'],
                full_name=f"{data['firstName']} {data['lastName']}",
                phone=data.get('phone', '')
            )
            
            # Create order
            order = OrderService.create_order(
                buyer=user,
                items=data['items'],
                payment_method='card',
                idempotency_key=data['idempotency_key']
            )
            
            # Build line items for Stripe
            line_items = []
            for item in data['items']:
                if item.get('type') == 'amphitheater':
                    line_items.append({
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': item.get('name', 'Amphitheater Ticket'),
                                'description': f"Section: {item.get('section', 'N/A')}",
                            },
                            'unit_amount': int(item['price'] * 100),
                        },
                        'quantity': item['quantity'],
                    })
                elif item.get('type') == 'vendor-booth':
                    line_items.append({
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': item.get('name', 'Vendor Booth'),
                            },
                            'unit_amount': int(item['price'] * 100),
                        },
                        'quantity': item.get('quantity', 1),
                    })
                else:
                    line_items.append({
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': item.get('name', 'Festival Ticket'),
                            },
                            'unit_amount': int(item['price'] * 100),
                        },
                        'quantity': item['quantity'],
                    })
            
            # Create Stripe Checkout Session
            success_url = f"{settings.FRONTEND_URL}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{settings.FRONTEND_URL}/checkout"
            
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=data['email'],
                client_reference_id=str(order.id),
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                },
            )
            
            # Store session ID in order
            order.stripe_payment_intent_id = session.id
            order.save(update_fields=['stripe_payment_intent_id'])
            
            return Response({
                'success': True,
                'data': {
                    'session_id': session.id,
                    'session_url': session.url,
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                }
            })
            
        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckoutSessionWebhookView(APIView):
    """Handle Stripe Checkout Session webhooks."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError:
            return Response({'error': 'Invalid signature'}, status=400)
        
        # Handle checkout.session.completed
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            order_id = session.get('client_reference_id')
            
            if order_id:
                try:
                    # Finalize order and issue tickets
                    OrderService.finalize_order(order_id, session.id)
                    logger.info(f"Order {order_id} finalized via Checkout Session webhook")
                except Exception as e:
                    logger.error(f"Error finalizing order {order_id}: {e}")
        
        return Response({'success': True})
