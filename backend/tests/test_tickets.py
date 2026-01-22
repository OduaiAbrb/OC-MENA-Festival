"""
Tests for tickets app.
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.tickets.models import TicketType, Order, Ticket, TicketTransfer
from apps.tickets.services import QRCodeService, TransferService, OrderService


@pytest.fixture
def ticket_type(db):
    """Create a test ticket type."""
    return TicketType.objects.create(
        name='3-Day Pass',
        slug='3day-pass',
        description='Full festival access',
        price_cents=3500,
        valid_days=['2026-09-04', '2026-09-05', '2026-09-06'],
        is_active=True
    )


@pytest.fixture
def ticket(db, attendee_user, ticket_type):
    """Create a test ticket."""
    return Ticket.objects.create(
        ticket_code=Ticket.generate_ticket_code(),
        owner=attendee_user,
        ticket_type=ticket_type,
        status=Ticket.Status.ISSUED
    )


@pytest.mark.django_db
class TestTicketTypes:
    """Test ticket type endpoints."""
    
    def test_list_ticket_types_sales_disabled(self, api_client):
        url = reverse('tickets:ticket-types')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data'] == []
    
    def test_list_ticket_types_sales_enabled(self, api_client, ticket_type):
        from apps.config.models import EventConfig
        config = EventConfig.get_active()
        config.ticket_sales_enabled = True
        config.save()
        
        url = reverse('tickets:ticket-types')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 1
        assert response.data['data'][0]['name'] == '3-Day Pass'


@pytest.mark.django_db
class TestQRCodeService:
    """Test QR code generation and validation."""
    
    def test_generate_qr_data(self, ticket):
        qr_data = QRCodeService.generate_qr_data(ticket)
        
        assert qr_data is not None
        data = json.loads(qr_data)
        assert 'payload' in data
        assert 'signature' in data
        assert data['payload']['ticket_code'] == ticket.ticket_code
    
    def test_verify_valid_qr(self, ticket):
        qr_data = QRCodeService.generate_qr_data(ticket)
        
        is_valid, payload, error = QRCodeService.verify_qr_data(qr_data)
        
        assert is_valid is True
        assert payload['ticket_code'] == ticket.ticket_code
        assert error == ''
    
    def test_verify_tampered_qr(self, ticket):
        qr_data = QRCodeService.generate_qr_data(ticket)
        data = json.loads(qr_data)
        data['payload']['ticket_code'] = 'TAMPERED'
        tampered_qr = json.dumps(data)
        
        is_valid, payload, error = QRCodeService.verify_qr_data(tampered_qr)
        
        assert is_valid is False
        assert 'Invalid signature' in error


@pytest.mark.django_db
class TestTransferService:
    """Test ticket transfer service."""
    
    def test_create_transfer(self, ticket, attendee_user):
        from apps.config.models import EventConfig
        config = EventConfig.get_active()
        config.transfer_enabled = True
        config.save()
        
        transfer = TransferService.create_transfer(
            ticket=ticket,
            from_user=attendee_user,
            to_email='recipient@example.com'
        )
        
        assert transfer is not None
        assert transfer.status == TicketTransfer.Status.PENDING
        assert ticket.status == Ticket.Status.TRANSFER_PENDING
    
    def test_cannot_transfer_used_ticket(self, ticket, attendee_user):
        ticket.status = Ticket.Status.USED
        ticket.save()
        
        with pytest.raises(ValueError) as exc_info:
            TransferService.create_transfer(
                ticket=ticket,
                from_user=attendee_user,
                to_email='recipient@example.com'
            )
        
        assert 'cannot be transferred' in str(exc_info.value)
    
    def test_cannot_have_duplicate_pending_transfer(self, ticket, attendee_user):
        TransferService.create_transfer(
            ticket=ticket,
            from_user=attendee_user,
            to_email='first@example.com'
        )
        
        # Refresh ticket from DB
        ticket.refresh_from_db()
        ticket.status = Ticket.Status.ISSUED  # Force status for test
        ticket.save()
        
        with pytest.raises(ValueError) as exc_info:
            TransferService.create_transfer(
                ticket=ticket,
                from_user=attendee_user,
                to_email='second@example.com'
            )
        
        assert 'pending transfer' in str(exc_info.value)


@pytest.mark.django_db
class TestMyTickets:
    """Test user ticket endpoints."""
    
    def test_list_my_tickets(self, authenticated_client, ticket):
        url = reverse('tickets:my-tickets')
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 1
    
    def test_get_ticket_qr(self, authenticated_client, ticket):
        url = reverse('tickets:ticket-qr', kwargs={'ticket_id': ticket.id})
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'qr_data' in response.data['data']


@pytest.mark.django_db
class TestOrderService:
    """Test order service."""
    
    def test_create_order(self, attendee_user, ticket_type):
        items = [{'ticket_type_id': ticket_type.id, 'quantity': 2}]
        
        order = OrderService.create_order(
            buyer=attendee_user,
            items=items,
            idempotency_key='test-key-123'
        )
        
        assert order is not None
        assert order.status == Order.Status.CREATED
        assert order.subtotal_cents == 7000  # 2 x $35
    
    def test_create_order_idempotent(self, attendee_user, ticket_type):
        items = [{'ticket_type_id': ticket_type.id, 'quantity': 1}]
        
        order1 = OrderService.create_order(
            buyer=attendee_user,
            items=items,
            idempotency_key='same-key'
        )
        order2 = OrderService.create_order(
            buyer=attendee_user,
            items=items,
            idempotency_key='same-key'
        )
        
        assert order1.id == order2.id
