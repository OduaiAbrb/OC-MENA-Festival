"""
Ticket models including orders, tickets, transfers, upgrades, refunds, and comps.
"""
import uuid
import secrets
from django.db import models
from django.utils import timezone
from django.conf import settings


class TicketType(models.Model):
    """
    Ticket types available for purchase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    # Pricing
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default='USD')
    
    # Valid days (stored as JSON list of date strings)
    valid_days = models.JSONField(default=list, help_text='List of valid dates in YYYY-MM-DD format')
    
    # Inventory
    capacity = models.PositiveIntegerField(null=True, blank=True, help_text='Null = unlimited')
    sold_count = models.PositiveIntegerField(default=0)
    
    # Availability
    sale_start = models.DateTimeField(null=True, blank=True)
    sale_end = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Display
    display_order = models.IntegerField(default=0)
    badge_text = models.CharField(max_length=50, blank=True, help_text='e.g., BEST VALUE, POPULAR')
    features = models.JSONField(default=list, help_text='List of feature strings')
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ticket_types'
        ordering = ['display_order', 'price_cents']
        indexes = [
            models.Index(fields=['is_active', 'sale_start', 'sale_end']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return f"{self.name} - ${self.price_cents / 100:.2f}"
    
    @property
    def price_dollars(self):
        return self.price_cents / 100
    
    @property
    def is_available(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if self.sale_start and now < self.sale_start:
            return False
        if self.sale_end and now > self.sale_end:
            return False
        if self.capacity and self.sold_count >= self.capacity:
            return False
        return True
    
    @property
    def remaining_capacity(self):
        if self.capacity is None:
            return None
        return max(0, self.capacity - self.sold_count)


class Order(models.Model):
    """
    Purchase orders for tickets.
    """
    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        PAYMENT_PENDING = 'PAYMENT_PENDING', 'Payment Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'
        PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', 'Partially Refunded'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, db_index=True)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
        db_index=True
    )
    
    # Pricing
    subtotal_cents = models.PositiveIntegerField(default=0)
    fees_cents = models.PositiveIntegerField(default=0)
    tax_cents = models.PositiveIntegerField(default=0)
    total_cents = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=3, default='USD')
    
    # Payment
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    idempotency_key = models.CharField(max_length=100, unique=True)
    
    # Refund tracking
    refunded_cents = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Order {self.order_number} - {self.buyer.email}"
    
    @property
    def total_dollars(self):
        return self.total_cents / 100
    
    @classmethod
    def generate_order_number(cls):
        """Generate a unique order number."""
        prefix = 'OCM'
        timestamp = timezone.now().strftime('%y%m%d')
        random_part = secrets.token_hex(3).upper()
        return f"{prefix}-{timestamp}-{random_part}"


class OrderItem(models.Model):
    """
    Individual items in an order.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price_cents = models.PositiveIntegerField()
    total_cents = models.PositiveIntegerField()
    
    class Meta:
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.quantity}x {self.ticket_type.name}"


class Ticket(models.Model):
    """
    Individual tickets issued to users.
    """
    class Status(models.TextChoices):
        ISSUED = 'ISSUED', 'Issued'
        TRANSFER_PENDING = 'TRANSFER_PENDING', 'Transfer Pending'
        USED = 'USED', 'Used'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_code = models.CharField(max_length=32, unique=True, db_index=True)
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='tickets'
    )
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT)
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ISSUED,
        db_index=True
    )
    
    # QR code data
    qr_secret_version = models.PositiveIntegerField(default=1)
    qr_payload_hash = models.CharField(max_length=64, blank=True)
    
    # Comp tracking
    is_comp = models.BooleanField(default=False)
    comp = models.ForeignKey(
        'Comp',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    
    # Timestamps
    issued_at = models.DateTimeField(default=timezone.now)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'tickets'
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['ticket_code']),
            models.Index(fields=['status', 'issued_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(status='USED', used_at__isnull=True),
                name='used_ticket_must_have_used_at'
            ),
        ]
    
    def __str__(self):
        return f"Ticket {self.ticket_code} - {self.owner.email}"
    
    @classmethod
    def generate_ticket_code(cls):
        """Generate a unique, non-guessable ticket code."""
        return secrets.token_urlsafe(16)[:24].upper()


class TicketTransfer(models.Model):
    """
    Ticket transfer requests.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        CANCELLED = 'CANCELLED', 'Cancelled'
        EXPIRED = 'EXPIRED', 'Expired'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='transfers')
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='transfers_sent'
    )
    to_email = models.EmailField()
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transfers_received'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    
    # Secure token for accepting transfer
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    
    created_at = models.DateTimeField(default=timezone.now)
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'ticket_transfers'
        indexes = [
            models.Index(fields=['ticket', 'status']),
            models.Index(fields=['to_email', 'status']),
            models.Index(fields=['expires_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['ticket'],
                condition=models.Q(status='PENDING'),
                name='one_pending_transfer_per_ticket'
            ),
        ]
    
    def __str__(self):
        return f"Transfer {self.ticket.ticket_code} to {self.to_email}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class TicketUpgrade(models.Model):
    """
    Ticket upgrade requests.
    """
    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        PAYMENT_PENDING = 'PAYMENT_PENDING', 'Payment Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPED = 'COMPED', 'Comped'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='upgrades')
    from_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name='upgrades_from'
    )
    to_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name='upgrades_to'
    )
    
    diff_cents = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
        db_index=True
    )
    
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    
    # Staff comp tracking
    comped_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='upgrades_comped'
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'ticket_upgrades'
        indexes = [
            models.Index(fields=['ticket', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['ticket'],
                condition=~models.Q(status__in=['COMPLETED', 'FAILED', 'CANCELLED', 'COMPED']),
                name='one_active_upgrade_per_ticket'
            ),
        ]
    
    def __str__(self):
        return f"Upgrade {self.ticket.ticket_code}: {self.from_type.name} → {self.to_type.name}"


class Refund(models.Model):
    """
    Refund records.
    """
    class Status(models.TextChoices):
        REQUESTED = 'REQUESTED', 'Requested'
        PROCESSING = 'PROCESSING', 'Processing'
        SUCCEEDED = 'SUCCEEDED', 'Succeeded'
        FAILED = 'FAILED', 'Failed'
    
    class Reason(models.TextChoices):
        CUSTOMER_REQUEST = 'CUSTOMER_REQUEST', 'Customer Request'
        EVENT_CANCELLED = 'EVENT_CANCELLED', 'Event Cancelled'
        DUPLICATE_PURCHASE = 'DUPLICATE_PURCHASE', 'Duplicate Purchase'
        OTHER = 'OTHER', 'Other'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refunds')
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='refunds_initiated'
    )
    
    amount_cents = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED,
        db_index=True
    )
    
    stripe_refund_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    reason = models.CharField(max_length=30, choices=Reason.choices)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'refunds'
        indexes = [
            models.Index(fields=['order', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Refund ${self.amount_cents / 100:.2f} for {self.order.order_number}"


class Comp(models.Model):
    """
    Complimentary ticket issuance records.
    """
    class Reason(models.TextChoices):
        VIP = 'VIP', 'VIP Guest'
        SPEAKER = 'SPEAKER', 'Speaker/Performer'
        SPONSOR = 'SPONSOR', 'Sponsor'
        MEDIA = 'MEDIA', 'Media/Press'
        STAFF = 'STAFF', 'Staff'
        VENDOR = 'VENDOR', 'Vendor Included'
        PROMOTION = 'PROMOTION', 'Promotion'
        CUSTOMER_SERVICE = 'CUSTOMER_SERVICE', 'Customer Service'
        OTHER = 'OTHER', 'Other'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='comps_issued'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='comps_received'
    )
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT)
    
    quantity = models.PositiveIntegerField(default=1)
    reason = models.CharField(max_length=30, choices=Reason.choices)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'comps'
        indexes = [
            models.Index(fields=['to_user', 'created_at']),
            models.Index(fields=['issued_by', 'created_at']),
        ]
    
    def __str__(self):
        return f"Comp {self.quantity}x {self.ticket_type.name} to {self.to_user.email}"


class Invoice(models.Model):
    """
    Invoice records for orders.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=30, unique=True)
    pdf_url = models.URLField(blank=True)
    pdf_file = models.FileField(upload_to='invoices/', blank=True)
    generated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'invoices'
        indexes = [
            models.Index(fields=['invoice_number']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"
    
    @classmethod
    def generate_invoice_number(cls, order):
        """Generate invoice number from order."""
        return f"INV-{order.order_number}"
