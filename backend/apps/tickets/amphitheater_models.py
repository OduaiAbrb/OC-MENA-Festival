"""
Amphitheater ticketing models for Pacific Amphitheatre.
Section-based seat allocation with concurrency safety.
"""
import uuid
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.accounts.models import User


class Venue(models.Model):
    """Pacific Amphitheatre venue configuration."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, default='Pacific Amphitheatre')
    address = models.TextField()
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'amphitheater_venues'
        verbose_name = 'Amphitheater Venue'
        verbose_name_plural = 'Amphitheater Venues'
    
    def __str__(self):
        return self.name


class Section(models.Model):
    """Venue sections (e.g., Orchestra, Mezzanine, Lawn)."""
    
    class SectionType(models.TextChoices):
        ORCHESTRA = 'ORCHESTRA', 'Orchestra'
        MEZZANINE = 'MEZZANINE', 'Mezzanine'
        TERRACE = 'TERRACE', 'Terrace'
        LAWN = 'LAWN', 'Lawn'
        VIP = 'VIP', 'VIP'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=100)  # e.g., "Section A", "Orchestra Left"
    section_type = models.CharField(max_length=20, choices=SectionType.choices)
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    base_price_cents = models.IntegerField(validators=[MinValueValidator(0)])
    display_order = models.IntegerField(default=0)
    color = models.CharField(max_length=7, default='#3b82f6', help_text='Hex color for map display')
    is_active = models.BooleanField(default=True)
    
    # Coordinates for interactive map (optional, frontend can use)
    map_coordinates = models.JSONField(default=dict, blank=True, help_text='SVG path or polygon coordinates')
    
    class Meta:
        db_table = 'amphitheater_sections'
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['venue', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.venue.name} - {self.name}"


class SeatBlock(models.Model):
    """
    Seat inventory blocks for a specific event date and section.
    Uses block-based allocation for performance (not individual seats).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='seat_blocks')
    event_date = models.DateField(db_index=True)
    
    # Seat range in this block
    row_start = models.CharField(max_length=10)  # e.g., "A"
    row_end = models.CharField(max_length=10)    # e.g., "Z"
    seat_start = models.IntegerField()           # e.g., 1
    seat_end = models.IntegerField()             # e.g., 50
    
    # Availability tracking
    total_seats = models.IntegerField(validators=[MinValueValidator(1)])
    available_seats = models.IntegerField(validators=[MinValueValidator(0)])
    held_seats = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    sold_seats = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Pricing for this specific event/section
    price_cents = models.IntegerField(validators=[MinValueValidator(0)])
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'amphitheater_seat_blocks'
        unique_together = [['section', 'event_date', 'row_start', 'row_end']]
        indexes = [
            models.Index(fields=['section', 'event_date', 'is_active']),
            models.Index(fields=['event_date', 'available_seats']),
        ]
    
    def __str__(self):
        return f"{self.section.name} - {self.event_date} - Rows {self.row_start}-{self.row_end}"


class SeatHold(models.Model):
    """
    Temporary seat holds during checkout (10-minute expiry).
    Prevents double-booking during payment process.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seat_block = models.ForeignKey(SeatBlock, on_delete=models.CASCADE, related_name='holds')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=255, db_index=True)  # For guest checkout
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Allocated seats (best available in block)
    allocated_seats = models.JSONField(default=list, help_text='List of {row, seat} objects')
    
    expires_at = models.DateTimeField(db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'amphitheater_seat_holds'
        indexes = [
            models.Index(fields=['session_key', 'is_active']),
            models.Index(fields=['expires_at', 'is_active']),
        ]
    
    def __str__(self):
        return f"Hold {self.id} - {self.quantity} seats - Expires {self.expires_at}"


class AmphitheaterTicket(models.Model):
    """
    Amphitheater tickets with seat assignments.
    Links to festival Ticket model for unified scanning.
    """
    
    class TicketStatus(models.TextChoices):
        ISSUED = 'ISSUED', 'Issued'
        USED = 'USED', 'Used'
        CANCELLED = 'CANCELLED', 'Cancelled'
        TRANSFERRED = 'TRANSFERRED', 'Transferred'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to main ticket system
    festival_ticket = models.OneToOneField(
        'tickets.Ticket',
        on_delete=models.CASCADE,
        related_name='amphitheater_ticket',
        help_text='Main ticket record for QR code and scanning'
    )
    
    # Seat assignment
    seat_block = models.ForeignKey(SeatBlock, on_delete=models.PROTECT, related_name='tickets')
    row = models.CharField(max_length=10)
    seat_number = models.IntegerField()
    
    # Event details
    event_date = models.DateField(db_index=True)
    event_name = models.CharField(max_length=255, default='OC MENA Festival Concert')
    
    # Pricing
    price_paid_cents = models.IntegerField(validators=[MinValueValidator(0)])
    
    # Status
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.ISSUED)
    
    # Festival access (auto-granted)
    includes_festival_access = models.BooleanField(default=True)
    festival_day_ticket = models.ForeignKey(
        'tickets.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_by_amphitheater',
        help_text='Auto-issued festival day pass'
    )
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'amphitheater_tickets'
        unique_together = [['seat_block', 'row', 'seat_number']]
        indexes = [
            models.Index(fields=['event_date', 'status']),
            models.Index(fields=['festival_ticket']),
        ]
    
    def __str__(self):
        return f"{self.event_name} - {self.event_date} - Row {self.row} Seat {self.seat_number}"
    
    @property
    def seat_location(self):
        """Human-readable seat location."""
        return f"Section {self.seat_block.section.name}, Row {self.row}, Seat {self.seat_number}"
