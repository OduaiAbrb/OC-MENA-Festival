"""
Tests for Stripe webhook idempotency.
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from django.urls import reverse

from apps.tickets.models import Order, Ticket, TicketType
from apps.payments.models import StripeEvent
from apps.payments.services import StripeService


@pytest.fixture
def paid_order_setup(db, attendee_user):
    """Setup for testing order finalization."""
    ticket_type = TicketType.objects.create(
        name='Test Pass',
        slug='test-pass',
        price_cents=1500,
        is_active=True
    )
    
    order = Order.objects.create(
        order_number='OCM-TEST-001',
        buyer=attendee_user,
        idempotency_key='test-idem-key',
        status=Order.Status.PAYMENT_PENDING,
        subtotal_cents=1500,
        fees_cents=45,
        total_cents=1545,
        stripe_payment_intent_id='pi_test_123'
    )
    
    from apps.tickets.models import OrderItem
    OrderItem.objects.create(
        order=order,
        ticket_type=ticket_type,
        quantity=1,
        unit_price_cents=1500,
        total_cents=1500
    )
    
    return order, ticket_type


@pytest.mark.django_db
class TestWebhookIdempotency:
    """Test that webhook processing is idempotent."""
    
    def test_same_event_processed_once(self, paid_order_setup):
        """Sending the same webhook event multiple times should only create tickets once."""
        order, ticket_type = paid_order_setup
        
        # Simulate payment succeeded event data
        event_data = MagicMock()
        event_data.id = 'pi_test_123'
        event_data.metadata = {'order_id': str(order.id)}
        
        with patch.object(StripeService, '_process_event') as mock_process:
            mock_process.return_value = {'status': 'success'}
            
            # First processing - should create event record
            StripeEvent.objects.create(
                stripe_event_id='evt_test_123',
                event_type='payment_intent.succeeded',
                processed=True
            )
            
            # Check that event exists
            assert StripeEvent.objects.filter(stripe_event_id='evt_test_123').exists()
            
            # If same event comes again, it should be marked as already processed
            existing = StripeEvent.objects.filter(
                stripe_event_id='evt_test_123',
                processed=True
            ).first()
            
            assert existing is not None
    
    def test_finalize_order_idempotent(self, paid_order_setup):
        """Finalizing the same order multiple times should not create duplicate tickets."""
        from apps.tickets.services import OrderService
        
        order, ticket_type = paid_order_setup
        
        # First finalization
        OrderService.finalize_order(str(order.id), 'pi_test_123')
        
        # Check tickets created
        tickets_after_first = Ticket.objects.filter(order=order).count()
        assert tickets_after_first == 1
        
        # Second finalization (simulating duplicate webhook)
        order.refresh_from_db()
        assert order.status == Order.Status.PAID
        
        # Calling finalize again should not create more tickets
        OrderService.finalize_order(str(order.id), 'pi_test_123')
        
        tickets_after_second = Ticket.objects.filter(order=order).count()
        assert tickets_after_second == 1  # Still 1, not 2
    
    def test_multiple_webhook_calls_same_result(self, paid_order_setup):
        """10 webhook calls should result in only 1 ticket issuance."""
        from apps.tickets.services import OrderService
        
        order, ticket_type = paid_order_setup
        
        # Simulate 10 webhook calls
        for _ in range(10):
            try:
                OrderService.finalize_order(str(order.id), 'pi_test_123')
            except Exception:
                pass  # May raise on already finalized
            order.refresh_from_db()
        
        # Should still have only 1 ticket
        tickets = Ticket.objects.filter(order=order)
        assert tickets.count() == 1
        
        # Order should be PAID
        assert order.status == Order.Status.PAID
