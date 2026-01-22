"""
Wallet integration models for Apple Wallet and Google Wallet.
"""
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings


class PassRecord(models.Model):
    """
    Record of wallet passes created for tickets.
    """
    class PassType(models.TextChoices):
        APPLE = 'APPLE', 'Apple Wallet'
        GOOGLE = 'GOOGLE', 'Google Wallet'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CREATED = 'CREATED', 'Created'
        INSTALLED = 'INSTALLED', 'Installed'
        UPDATED = 'UPDATED', 'Updated'
        REVOKED = 'REVOKED', 'Revoked'
        FAILED = 'FAILED', 'Failed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet_passes'
    )
    ticket = models.ForeignKey(
        'tickets.Ticket',
        on_delete=models.CASCADE,
        related_name='wallet_passes'
    )
    
    pass_type = models.CharField(max_length=10, choices=PassType.choices, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    
    # Pass identifiers
    pass_serial_number = models.CharField(max_length=100, unique=True, blank=True)
    pass_url = models.URLField(blank=True)
    
    # For Apple Wallet
    authentication_token = models.CharField(max_length=100, blank=True)
    last_updated_tag = models.CharField(max_length=100, blank=True)
    
    # For Google Wallet
    google_pass_class_id = models.CharField(max_length=100, blank=True)
    google_pass_object_id = models.CharField(max_length=100, blank=True)
    
    # Push notification tracking
    push_token = models.CharField(max_length=255, blank=True)
    
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    installed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'pass_records'
        indexes = [
            models.Index(fields=['user', 'pass_type']),
            models.Index(fields=['ticket', 'pass_type']),
            models.Index(fields=['status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['ticket', 'pass_type'],
                name='one_pass_per_ticket_per_type'
            ),
        ]
    
    def __str__(self):
        return f"{self.pass_type} pass for {self.ticket.ticket_code}"
