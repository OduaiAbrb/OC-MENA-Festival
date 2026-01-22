"""
Payment models - extends tickets models for payment-specific tracking.
Note: Main Order model is in tickets app.
"""
import uuid
from django.db import models
from django.utils import timezone


class StripeEvent(models.Model):
    """
    Track processed Stripe webhook events for idempotency.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stripe_event_id = models.CharField(max_length=100, unique=True)
    event_type = models.CharField(max_length=100, db_index=True)
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True)
    
    payload = models.JSONField(default=dict)
    
    received_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'stripe_events'
        indexes = [
            models.Index(fields=['stripe_event_id']),
            models.Index(fields=['event_type', 'processed']),
            models.Index(fields=['received_at']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id}"


class PaymentAttempt(models.Model):
    """
    Track payment attempts for debugging and analytics.
    """
    class Status(models.TextChoices):
        INITIATED = 'INITIATED', 'Initiated'
        PROCESSING = 'PROCESSING', 'Processing'
        SUCCEEDED = 'SUCCEEDED', 'Succeeded'
        FAILED = 'FAILED', 'Failed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'tickets.Order',
        on_delete=models.CASCADE,
        related_name='payment_attempts'
    )
    
    stripe_payment_intent_id = models.CharField(max_length=100, db_index=True)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default='USD')
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.INITIATED
    )
    
    failure_code = models.CharField(max_length=100, blank=True)
    failure_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_attempts'
        indexes = [
            models.Index(fields=['order', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]
    
    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.status}"
