"""
User model with role-based access control.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserRole(models.TextChoices):
    ATTENDEE = 'ATTENDEE', 'Attendee'
    VENDOR = 'VENDOR', 'Vendor'
    STAFF_SCANNER = 'STAFF_SCANNER', 'Staff Scanner'
    ADMIN = 'ADMIN', 'Admin'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with email as the unique identifier and role-based access.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.ATTENDEE,
        db_index=True
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN
    
    @property
    def is_staff_scanner(self):
        return self.role in [UserRole.STAFF_SCANNER, UserRole.ADMIN]
    
    @property
    def is_vendor(self):
        return self.role == UserRole.VENDOR
    
    @property
    def can_manage_tickets(self):
        return self.role in [UserRole.STAFF_SCANNER, UserRole.ADMIN]


class AuditLog(models.Model):
    """
    Audit log for tracking all staff/admin actions.
    """
    class ActionType(models.TextChoices):
        REFUND = 'REFUND', 'Refund'
        UPGRADE = 'UPGRADE', 'Upgrade'
        COMP = 'COMP', 'Comp'
        RESEND_TICKET = 'RESEND_TICKET', 'Resend Ticket'
        RESEND_INVOICE = 'RESEND_INVOICE', 'Resend Invoice'
        BOOTH_ASSIGN = 'BOOTH_ASSIGN', 'Booth Assignment'
        SCAN_OVERRIDE = 'SCAN_OVERRIDE', 'Scan Override'
        USER_UPDATE = 'USER_UPDATE', 'User Update'
        ORDER_UPDATE = 'ORDER_UPDATE', 'Order Update'
        TICKET_CANCEL = 'TICKET_CANCEL', 'Ticket Cancel'
        TRANSFER_CANCEL = 'TRANSFER_CANCEL', 'Transfer Cancel'
        CONFIG_UPDATE = 'CONFIG_UPDATE', 'Config Update'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action_type = models.CharField(max_length=50, choices=ActionType.choices, db_index=True)
    target_type = models.CharField(max_length=50, db_index=True)
    target_id = models.CharField(max_length=50)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action_type', 'created_at']),
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['actor', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.actor} - {self.action_type} - {self.target_type}:{self.target_id}"


class UserAddress(models.Model):
    """
    User shipping/billing addresses for merchandise and future orders.
    """
    class AddressType(models.TextChoices):
        SHIPPING = 'SHIPPING', 'Shipping'
        BILLING = 'BILLING', 'Billing'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    
    label = models.CharField(max_length=50, blank=True, help_text='e.g., Home, Work')
    address_type = models.CharField(max_length=20, choices=AddressType.choices, default=AddressType.SHIPPING)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    street_address = models.CharField(max_length=255)
    street_address_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='United States')
    phone = models.CharField(max_length=20, blank=True)
    
    is_default = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_addresses'
        ordering = ['-is_default', '-created_at']
        indexes = [
            models.Index(fields=['user', 'address_type']),
            models.Index(fields=['user', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.label or self.address_type}"
    
    def save(self, *args, **kwargs):
        # If setting as default, unset other defaults for same type
        if self.is_default:
            UserAddress.objects.filter(
                user=self.user,
                address_type=self.address_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
