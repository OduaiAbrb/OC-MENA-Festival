"""
Vendor services.
"""
import logging
from django.db import transaction
from django.conf import settings
from django.core.mail import send_mail

from apps.accounts.models import User
from apps.tickets.services import QRCodeService
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
