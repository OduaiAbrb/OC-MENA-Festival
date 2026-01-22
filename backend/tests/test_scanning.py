"""
Tests for scanning app - including concurrency tests.
"""
import pytest
import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.urls import reverse
from django.db import connection
from rest_framework import status

from apps.tickets.models import Ticket, TicketType
from apps.tickets.services import QRCodeService
from apps.scanning.services import ScanService
from apps.scanning.models import TicketScanLog


@pytest.fixture
def enabled_scanning(db):
    """Enable scanning in config."""
    from apps.config.models import EventConfig
    config = EventConfig.get_active()
    config.scanning_enabled = True
    config.save()
    return config


@pytest.fixture
def scannable_ticket(db, attendee_user):
    """Create a scannable ticket with valid day."""
    from datetime import date
    today = date.today().isoformat()
    
    ticket_type = TicketType.objects.create(
        name='Test Pass',
        slug='test-pass',
        price_cents=1500,
        valid_days=[today],
        is_active=True
    )
    
    return Ticket.objects.create(
        ticket_code=Ticket.generate_ticket_code(),
        owner=attendee_user,
        ticket_type=ticket_type,
        status=Ticket.Status.ISSUED
    )


@pytest.mark.django_db
class TestScanValidation:
    """Test scan validation."""
    
    def test_validate_valid_ticket(self, scannable_ticket):
        qr_data = QRCodeService.generate_qr_data(scannable_ticket)
        
        is_valid, result = ScanService.validate_qr(qr_data)
        
        assert is_valid is True
        assert result['can_enter'] is True
        assert result['status'] == 'VALID'
    
    def test_validate_already_used_ticket(self, scannable_ticket):
        scannable_ticket.status = Ticket.Status.USED
        scannable_ticket.save()
        
        qr_data = QRCodeService.generate_qr_data(scannable_ticket)
        
        is_valid, result = ScanService.validate_qr(qr_data)
        
        assert is_valid is False
        assert result['can_enter'] is False
        assert result['status'] == 'ALREADY_USED'
    
    def test_validate_refunded_ticket(self, scannable_ticket):
        scannable_ticket.status = Ticket.Status.REFUNDED
        scannable_ticket.save()
        
        qr_data = QRCodeService.generate_qr_data(scannable_ticket)
        
        is_valid, result = ScanService.validate_qr(qr_data)
        
        assert is_valid is False
        assert result['status'] == 'REFUNDED'


@pytest.mark.django_db
class TestScanCommit:
    """Test scan commit (marking ticket as used)."""
    
    def test_commit_scan_success(self, scannable_ticket, staff_user):
        success, result = ScanService.commit_scan(
            ticket_code=scannable_ticket.ticket_code,
            scanner_user=staff_user,
            gate='Main Gate'
        )
        
        assert success is True
        assert result['status'] == 'SUCCESS'
        
        scannable_ticket.refresh_from_db()
        assert scannable_ticket.status == Ticket.Status.USED
        assert scannable_ticket.used_at is not None
    
    def test_commit_scan_already_used(self, scannable_ticket, staff_user):
        # First scan
        ScanService.commit_scan(
            ticket_code=scannable_ticket.ticket_code,
            scanner_user=staff_user
        )
        
        # Second scan attempt
        success, result = ScanService.commit_scan(
            ticket_code=scannable_ticket.ticket_code,
            scanner_user=staff_user
        )
        
        assert success is False
        assert result['status'] == 'ALREADY_USED'
    
    def test_commit_scan_not_found(self, staff_user):
        success, result = ScanService.commit_scan(
            ticket_code='NONEXISTENT',
            scanner_user=staff_user
        )
        
        assert success is False
        assert result['status'] == 'NOT_FOUND'


@pytest.mark.django_db(transaction=True)
class TestScanConcurrency:
    """Test concurrent scan operations - race condition prevention."""
    
    def test_concurrent_scans_only_one_succeeds(self, scannable_ticket, staff_user):
        """
        Test that when two scans happen simultaneously,
        only one succeeds and the ticket is not double-scanned.
        """
        results = []
        
        def scan_ticket():
            # Need to close connection for thread safety in tests
            connection.close()
            success, result = ScanService.commit_scan(
                ticket_code=scannable_ticket.ticket_code,
                scanner_user=staff_user
            )
            return success, result
        
        # Run concurrent scans
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(scan_ticket) for _ in range(5)]
            for future in as_completed(futures):
                results.append(future.result())
        
        # Exactly one should succeed
        success_count = sum(1 for success, _ in results if success)
        assert success_count == 1
        
        # Ticket should be used
        scannable_ticket.refresh_from_db()
        assert scannable_ticket.status == Ticket.Status.USED
        
        # Check scan logs
        logs = TicketScanLog.objects.filter(ticket=scannable_ticket)
        success_logs = logs.filter(result='SUCCESS')
        assert success_logs.count() == 1


@pytest.mark.django_db
class TestScanEndpoints:
    """Test scan API endpoints."""
    
    def test_validate_endpoint(self, staff_client, scannable_ticket, enabled_scanning):
        qr_data = QRCodeService.generate_qr_data(scannable_ticket)
        url = reverse('scanning:scan-validate')
        
        response = staff_client.post(url, {'qr_data': qr_data}, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['can_enter'] is True
    
    def test_commit_endpoint(self, staff_client, scannable_ticket, enabled_scanning):
        url = reverse('scanning:scan-commit')
        
        response = staff_client.post(url, {
            'ticket_code': scannable_ticket.ticket_code
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['status'] == 'SUCCESS'
    
    def test_scan_requires_staff(self, authenticated_client, scannable_ticket, enabled_scanning):
        url = reverse('scanning:scan-commit')
        
        response = authenticated_client.post(url, {
            'ticket_code': scannable_ticket.ticket_code
        }, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
