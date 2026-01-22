"""
Ticket scanning models.
"""
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings


class TicketScanLog(models.Model):
    """
    Log of all ticket scan attempts.
    """
    class Result(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        ALREADY_USED = 'ALREADY_USED', 'Already Used'
        INVALID = 'INVALID', 'Invalid QR'
        REFUNDED = 'REFUNDED', 'Ticket Refunded'
        CANCELLED = 'CANCELLED', 'Ticket Cancelled'
        WRONG_DAY = 'WRONG_DAY', 'Wrong Day'
        TRANSFER_PENDING = 'TRANSFER_PENDING', 'Transfer Pending'
        NOT_FOUND = 'NOT_FOUND', 'Ticket Not Found'
        SIGNATURE_INVALID = 'SIGNATURE_INVALID', 'Invalid Signature'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        'tickets.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scan_logs'
    )
    scanner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='scans_performed'
    )
    
    result = models.CharField(max_length=30, choices=Result.choices, db_index=True)
    
    # Scan context
    gate = models.CharField(max_length=50, blank=True)
    device_id = models.CharField(max_length=100, blank=True)
    
    # Raw data for debugging
    raw_qr_data = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    
    scanned_at = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'ticket_scan_logs'
        ordering = ['-scanned_at']
        indexes = [
            models.Index(fields=['ticket', 'scanned_at']),
            models.Index(fields=['result', 'scanned_at']),
            models.Index(fields=['scanner', 'scanned_at']),
        ]
    
    def __str__(self):
        ticket_code = self.ticket.ticket_code if self.ticket else 'Unknown'
        return f"Scan {ticket_code} - {self.result}"


class ScanSession(models.Model):
    """
    Scanner session for tracking device activity.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scanner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scan_sessions'
    )
    
    gate = models.CharField(max_length=50, blank=True)
    device_id = models.CharField(max_length=100)
    
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    total_scans = models.PositiveIntegerField(default=0)
    successful_scans = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'scan_sessions'
        indexes = [
            models.Index(fields=['scanner', 'is_active']),
            models.Index(fields=['started_at']),
        ]
    
    def __str__(self):
        return f"Session {self.scanner.email} - {self.gate or 'No Gate'}"
