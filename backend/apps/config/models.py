"""
Event configuration, feature flags, sponsors, schedule, and contact submissions.
"""
import uuid
from django.db import models
from django.utils import timezone


class EventConfig(models.Model):
    """
    Singleton-like configuration for event settings and feature flags.
    Only one active config should exist at a time.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event info
    event_name = models.CharField(max_length=255, default='OC MENA Festival')
    event_tagline = models.CharField(max_length=500, blank=True)
    event_start_date = models.DateField(null=True, blank=True)
    event_end_date = models.DateField(null=True, blank=True)
    event_location = models.CharField(max_length=500, blank=True)
    event_address = models.TextField(blank=True)
    
    # Feature flags
    ticket_sales_enabled = models.BooleanField(default=False)
    transfer_enabled = models.BooleanField(default=False)
    upgrade_enabled = models.BooleanField(default=False)
    refunds_enabled = models.BooleanField(default=False)
    scanning_enabled = models.BooleanField(default=False)
    schedule_published = models.BooleanField(default=False)
    vendors_published = models.BooleanField(default=False)
    sponsors_published = models.BooleanField(default=False)
    apple_wallet_enabled = models.BooleanField(default=False)
    google_wallet_enabled = models.BooleanField(default=False)
    
    # Coming soon page
    coming_soon_mode = models.BooleanField(default=True)
    coming_soon_message = models.TextField(blank=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_config'
        verbose_name = 'Event Configuration'
        verbose_name_plural = 'Event Configurations'
    
    def __str__(self):
        return f"{self.event_name} Config"
    
    @classmethod
    def get_active(cls):
        """Get the active configuration or create default."""
        config, _ = cls.objects.get_or_create(is_active=True)
        return config


class Sponsor(models.Model):
    """
    Event sponsors.
    """
    class TierChoices(models.TextChoices):
        PLATINUM = 'PLATINUM', 'Platinum'
        GOLD = 'GOLD', 'Gold'
        SILVER = 'SILVER', 'Silver'
        BRONZE = 'BRONZE', 'Bronze'
        PARTNER = 'PARTNER', 'Partner'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    tier = models.CharField(max_length=20, choices=TierChoices.choices, db_index=True)
    logo_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sponsors'
        ordering = ['tier', 'display_order', 'name']
        indexes = [
            models.Index(fields=['tier', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.tier})"


class ScheduleItem(models.Model):
    """
    Event schedule items.
    """
    class CategoryChoices(models.TextChoices):
        PERFORMANCE = 'PERFORMANCE', 'Performance'
        WORKSHOP = 'WORKSHOP', 'Workshop'
        FOOD = 'FOOD', 'Food & Dining'
        ACTIVITY = 'ACTIVITY', 'Activity'
        CEREMONY = 'CEREMONY', 'Ceremony'
        OTHER = 'OTHER', 'Other'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CategoryChoices.choices, db_index=True)
    location = models.CharField(max_length=255, blank=True)
    day = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    performer_name = models.CharField(max_length=255, blank=True)
    image_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'schedule_items'
        ordering = ['day', 'start_time']
        indexes = [
            models.Index(fields=['day', 'start_time']),
            models.Index(fields=['category', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.day} {self.start_time}"


class ContactSubmission(models.Model):
    """
    Contact form submissions.
    """
    class SubjectChoices(models.TextChoices):
        SPONSOR_INQUIRY = 'SPONSOR_INQUIRY', 'Sponsor Inquiry'
        VENDOR_INQUIRY = 'VENDOR_INQUIRY', 'Vendor Inquiry'
        GENERAL_QUESTION = 'GENERAL_QUESTION', 'General Question'
        PRESS_INQUIRY = 'PRESS_INQUIRY', 'Press Inquiry'
        OTHER = 'OTHER', 'Other'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=30, choices=SubjectChoices.choices)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_responded = models.BooleanField(default=False)
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'contact_submissions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subject', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.subject}"


class NewsletterSubscriber(models.Model):
    """
    Newsletter email subscribers.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    source = models.CharField(max_length=50, default='website', help_text='Where they subscribed from')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    subscribed_at = models.DateTimeField(default=timezone.now)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'newsletter_subscribers'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active', 'subscribed_at']),
        ]
    
    def __str__(self):
        return self.email
