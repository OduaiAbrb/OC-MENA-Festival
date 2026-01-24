"""
Vendor services.
"""
import logging
from django.db import transaction
from django.conf import settings
from django.core.mail import send_mail

from apps.accounts.models import User
from apps.tickets.services import QRCodeService, CompService
from apps.tickets.models import TicketType, Comp
from apps.tickets.email_service import TicketEmailService
from .models import VendorProfile, Booth, BoothAssignment

logger = logging.getLogger(__name__)


class VendorService:
    """Service for vendor operations."""
    
    @classmethod
    @transaction.atomic
    def assign_booth(
        cls,
        vendor: VendorProfile,
        booth: Booth,
        assigned_by: User,
        notes: str = ''
    ) -> BoothAssignment:
        """Assign a booth to a vendor."""
        # Check booth is not already assigned
        if hasattr(booth, 'assignment'):
            raise ValueError("Booth is already assigned")
        
        # Create assignment
        assignment = BoothAssignment.objects.create(
            vendor=vendor,
            booth=booth,
            assigned_by=assigned_by,
            notes=notes
        )
        
        # Update vendor status
        vendor.booth_status = VendorProfile.BoothStatus.ASSIGNED
        vendor.save(update_fields=['booth_status'])
        
        # Send notification email
        cls._send_assignment_email(vendor, booth)
        
        logger.info(f"Booth {booth.booth_code} assigned to {vendor.business_name}")
        
        return assignment
    
    @staticmethod
    def _send_assignment_email(vendor: VendorProfile, booth: Booth) -> None:
        """Send booth assignment notification."""
        try:
            send_mail(
                subject="Your OC MENA Festival Booth Assignment",
                message=f"""
Hello {vendor.contact_name},

Great news! Your booth for OC MENA Festival has been assigned!

Booth Details:
- Booth Code: {booth.booth_code}
- Location: {booth.full_location}
- Size: {booth.get_size_display()}

Please log in to your vendor dashboard for more details:
{settings.FRONTEND_URL}/dashboard

Best regards,
OC MENA Festival Team
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[vendor.contact_email],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send booth assignment email: {e}")
    
    @classmethod
    def generate_setup_qr(cls, vendor: VendorProfile) -> str:
        """Generate vendor setup QR code data."""
        payload = {
            'vendor_id': str(vendor.id),
            'kind': 'VENDOR_SETUP',
            'qr_id': vendor.setup_qr_id,
            'business_name': vendor.business_name
        }
        
        import json
        import hmac
        import hashlib
        
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            vendor.setup_qr_secret.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return json.dumps({
            'payload': payload,
            'signature': signature
        })
    
    @classmethod
    @transaction.atomic
    def issue_vendor_comp_tickets(
        cls,
        vendor: VendorProfile,
        issued_by: User,
        ticket_type: TicketType = None
    ) -> list:
        """
        Issue complimentary attendee tickets to vendor.
        Default is 2 tickets as per vendor.included_tickets_count.
        """
        if not ticket_type:
            # Get general admission ticket type
            ticket_type = TicketType.objects.filter(
                slug='general-admission',
                is_active=True
            ).first()
            
            if not ticket_type:
                # Fallback to any active ticket
                ticket_type = TicketType.objects.filter(is_active=True).first()
            
            if not ticket_type:
                raise ValueError("No active ticket types available")
        
        quantity = vendor.included_tickets_count
        
        if quantity == 0:
            logger.info(f"No comp tickets configured for vendor {vendor.business_name}")
            return []
        
        # Issue comp tickets
        comp, tickets = CompService.issue_comp(
            issued_by=issued_by,
            to_user=vendor.user,
            ticket_type=ticket_type,
            quantity=quantity,
            reason=Comp.Reason.VENDOR,
            notes=f"Vendor booth purchase - {vendor.business_name}"
        )
        
        logger.info(f"Issued {quantity} comp tickets to vendor {vendor.business_name}")
        return tickets
    
    @classmethod
    def send_vendor_confirmation_package(cls, vendor: VendorProfile, issued_by: User) -> None:
        """
        Send complete vendor confirmation package including:
        - Setup QR ticket for day-before check-in
        - Complimentary attendee tickets (if configured)
        """
        try:
            # Send vendor setup ticket email
            TicketEmailService.send_vendor_setup_ticket(vendor)
            
            # Issue comp attendee tickets if configured
            if vendor.included_tickets_count > 0:
                cls.issue_vendor_comp_tickets(vendor, issued_by)
            
            logger.info(f"Vendor confirmation package sent to {vendor.business_name}")
            
        except Exception as e:
            logger.error(f"Failed to send vendor confirmation package: {e}")
            raise
