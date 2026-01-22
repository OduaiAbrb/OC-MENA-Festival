"""
Vendor models including profiles, booths, and assignments.
"""
import uuid
import secrets
from django.db import models
from django.utils import timezone
from django.conf import settings


class VendorCategory(models.TextChoices):
    FOOD = 'FOOD', 'Food & Beverage'
    CRAFT = 'CRAFT', 'Arts & Crafts'
    RETAIL = 'RETAIL', 'Retail'
    SERVICE = 'SERVICE', 'Services'
    NONPROFIT = 'NONPROFIT', 'Non-Profit'
    ENTERTAINMENT = 'ENTERTAINMENT', 'Entertainment'
    OTHER = 'OTHER', 'Other'


class VendorProfile(models.Model):
    """
    Vendor business profile.
    """
    class BoothStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Application'
        APPROVED = 'APPROVED', 'Approved'
        AWAITING_ASSIGNMENT = 'AWAITING_ASSIGNMENT', 'Awaiting Assignment'
        ASSIGNED = 'ASSIGNED', 'Booth Assigned'
        REJECTED = 'REJECTED', 'Rejected'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_profile'
    )
    
    # Business info
    business_name = models.CharField(max_length=255)
    business_description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=VendorCategory.choices, db_index=True)
    website_url = models.URLField(blank=True)
    
    # Contact
    contact_name = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    
    # Status
    booth_status = models.CharField(
        max_length=20,
        choices=BoothStatus.choices,
        default=BoothStatus.PENDING,
        db_index=True
    )
    
    # Setup QR code for vendor check-in
    setup_qr_id = models.CharField(max_length=32, unique=True, blank=True)
    setup_qr_secret = models.CharField(max_length=64, blank=True)
    
    # Included tickets for booth purchase
    included_tickets_count = models.PositiveIntegerField(default=2)
    
    # Notes
    internal_notes = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False, help_text='Show on public vendors page')
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vendor_profiles'
        indexes = [
            models.Index(fields=['booth_status', 'is_active']),
            models.Index(fields=['category', 'is_public']),
        ]
    
    def __str__(self):
        return f"{self.business_name} ({self.user.email})"
    
    def save(self, *args, **kwargs):
        if not self.setup_qr_id:
            self.setup_qr_id = secrets.token_urlsafe(16)[:24].upper()
            self.setup_qr_secret = secrets.token_hex(32)
        super().save(*args, **kwargs)


class Booth(models.Model):
    """
    Physical booth locations at the festival.
    """
    class Size(models.TextChoices):
        SMALL = 'SMALL', 'Small (8x8)'
        MEDIUM = 'MEDIUM', 'Medium (10x10)'
        LARGE = 'LARGE', 'Large (12x12)'
        EXTRA_LARGE = 'EXTRA_LARGE', 'Extra Large (15x15)'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booth_code = models.CharField(max_length=20, unique=True)
    
    # Location
    area = models.CharField(max_length=100, help_text='e.g., Food Court, Main Hall')
    zone = models.CharField(max_length=50, blank=True, help_text='e.g., A, B, C')
    row = models.CharField(max_length=10, blank=True)
    number = models.CharField(max_length=10, blank=True)
    
    size = models.CharField(max_length=20, choices=Size.choices, default=Size.MEDIUM)
    
    # Pricing
    price_cents = models.PositiveIntegerField(default=0)
    
    # Amenities
    has_electricity = models.BooleanField(default=True)
    has_water = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'booths'
        ordering = ['area', 'zone', 'row', 'number']
        indexes = [
            models.Index(fields=['booth_code']),
            models.Index(fields=['area', 'zone']),
        ]
    
    def __str__(self):
        return f"Booth {self.booth_code} - {self.area}"
    
    @property
    def full_location(self):
        parts = [self.area]
        if self.zone:
            parts.append(f"Zone {self.zone}")
        if self.row:
            parts.append(f"Row {self.row}")
        if self.number:
            parts.append(f"#{self.number}")
        return ', '.join(parts)


class BoothAssignment(models.Model):
    """
    Assignment of booths to vendors.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='booth_assignments'
    )
    booth = models.OneToOneField(
        Booth,
        on_delete=models.CASCADE,
        related_name='assignment'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='booth_assignments_made'
    )
    
    # Payment tracking
    amount_paid_cents = models.PositiveIntegerField(default=0)
    is_paid = models.BooleanField(default=False)
    payment_order = models.ForeignKey(
        'tickets.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booth_assignments'
    )
    
    notes = models.TextField(blank=True)
    
    assigned_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'booth_assignments'
        indexes = [
            models.Index(fields=['vendor']),
            models.Index(fields=['assigned_at']),
        ]
    
    def __str__(self):
        return f"{self.vendor.business_name} → {self.booth.booth_code}"


class VendorSetupLog(models.Model):
    """
    Log of vendor setup check-ins.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='setup_logs'
    )
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='vendor_setups_scanned'
    )
    
    action = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    
    scanned_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'vendor_setup_logs'
        ordering = ['-scanned_at']
        indexes = [
            models.Index(fields=['vendor', 'scanned_at']),
        ]
    
    def __str__(self):
        return f"{self.vendor.business_name} - {self.action}"
