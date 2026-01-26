"""
Amphitheater checkout integration with existing payment system.
Handles seat hold conversion to tickets after payment.
"""
import logging
from django.db import transaction
from django.conf import settings

from apps.tickets.models import Order, TicketType
from apps.tickets.amphitheater_models import SeatHold
from apps.tickets.amphitheater_services import AmphitheaterService
from .services import StripeService

logger = logging.getLogger(__name__)


class AmphitheaterCheckoutService:
    """Service for amphitheater checkout and payment processing."""
    
    @staticmethod
    @transaction.atomic
    def create_amphitheater_order(hold_id: str, user, billing_details: dict = None) -> dict:
        """
        Create order for amphitheater tickets from a seat hold.
        Returns order and payment intent for checkout.
        """
        try:
            hold = SeatHold.objects.select_for_update().get(id=hold_id, is_active=True)
        except SeatHold.DoesNotExist:
            return {
                'success': False,
                'error': 'Seat hold not found or expired'
            }
        
        # Get or create amphitheater ticket type for this event
        event_date = hold.seat_block.event_date
        section_name = hold.seat_block.section.name
        
        ticket_type_name = f"Pacific Amphitheatre - {event_date.strftime('%B %d, %Y')} - {section_name}"
        ticket_type_slug = f"amphitheater-{event_date.strftime('%Y-%m-%d')}-{section_name.lower().replace(' ', '-')}"
        
        ticket_type, created = TicketType.objects.get_or_create(
            slug=ticket_type_slug,
            defaults={
                'name': ticket_type_name,
                'description': f'Pacific Amphitheatre concert ticket with same-day festival access',
                'price_cents': hold.seat_block.price_cents,
                'capacity': 100000,  # Managed by seat blocks
                'is_active': True,
                'valid_days': [event_date.strftime('%A')],
            }
        )
        
        # Create order
        from apps.tickets.services import OrderService
        
        order_data = {
            'buyer': user,
            'items': [
                {
                    'ticket_type_id': str(ticket_type.id),
                    'quantity': hold.quantity,
                }
            ],
            'billing_details': billing_details or {},
            'metadata': {
                'amphitheater': True,
                'seat_hold_id': str(hold.id),
                'event_date': str(event_date),
                'section': section_name,
            }
        }
        
        order = OrderService.create_order(
            buyer=user,
            items=order_data['items'],
            idempotency_key=f"amph-hold-{hold.id}",
            metadata=order_data['metadata']
        )
        
        # Create payment intent
        if settings.STRIPE_SECRET_KEY:
            payment_result = StripeService.create_payment_intent(
                order=order,
                metadata={
                    'amphitheater': 'true',
                    'seat_hold_id': str(hold.id),
                    'event_date': str(event_date),
                }
            )
        else:
            # Demo mode
            payment_result = {
                'client_secret': f'demo_secret_{order.id}',
                'payment_intent_id': f'demo_pi_{order.id}',
            }
        
        return {
            'success': True,
            'order_id': str(order.id),
            'order_number': order.order_number,
            'total_cents': order.total_cents,
            'total': order.total_cents / 100,
            'client_secret': payment_result.get('client_secret'),
            'payment_intent_id': payment_result.get('payment_intent_id'),
            'hold_id': str(hold.id),
            'expires_at': hold.expires_at.isoformat(),
        }
    
    @staticmethod
    @transaction.atomic
    def finalize_amphitheater_order(order_id: str, payment_intent_id: str = None):
        """
        Finalize amphitheater order after payment success.
        Converts seat hold to actual tickets.
        Called by payment webhook or demo mode confirmation.
        """
        from apps.tickets.services import OrderService
        
        # Get order
        order = Order.objects.select_for_update().get(id=order_id)
        
        # Check if already finalized
        if order.status == Order.Status.COMPLETED:
            logger.info(f"Order {order.order_number} already finalized")
            return order
        
        # Get seat hold from metadata
        hold_id = order.metadata.get('seat_hold_id')
        
        if not hold_id:
            # Regular order finalization (no amphitheater)
            return OrderService.finalize_order(order_id, payment_intent_id)
        
        # Get ticket type from order items
        order_item = order.items.first()
        if not order_item:
            raise ValueError("Order has no items")
        
        ticket_type = order_item.ticket_type
        
        # Convert seat hold to amphitheater tickets
        amphitheater_tickets = AmphitheaterService.convert_hold_to_tickets(
            hold_id=hold_id,
            order=order,
            ticket_type=ticket_type
        )
        
        if not amphitheater_tickets:
            raise ValueError("Failed to convert seat hold to tickets")
        
        # Update order status
        order.status = Order.Status.COMPLETED
        if payment_intent_id:
            order.stripe_payment_intent_id = payment_intent_id
        order.save(update_fields=['status', 'stripe_payment_intent_id'])
        
        # Send confirmation email (includes amphitheater tickets)
        from apps.tickets.email_service import TicketEmailService
        from threading import Thread
        
        try:
            email_thread = Thread(
                target=TicketEmailService.send_order_confirmation,
                args=(order,)
            )
            email_thread.start()
        except Exception as e:
            logger.error(f"Failed to queue confirmation email: {e}")
        
        logger.info(f"Finalized amphitheater order {order.order_number} with {len(amphitheater_tickets)} tickets")
        
        return order
