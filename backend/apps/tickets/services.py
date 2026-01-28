"""
Ticket services for business logic with proper concurrency control.
"""
import secrets
import hashlib
import hmac
import json
import logging
from datetime import timedelta
from typing import Optional, Tuple
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail

from .models import (
    TicketType, Order, OrderItem, Ticket, 
    TicketTransfer, TicketUpgrade, Refund, Comp, Invoice
)
from apps.accounts.models import User, AuditLog
from apps.accounts.services import AuditService
from .email_service import TicketEmailService

logger = logging.getLogger(__name__)


class QRCodeService:
    """Service for generating and validating secure QR codes."""
    
    @staticmethod
    def generate_payload(ticket: Ticket, kind: str = 'ATTENDEE') -> dict:
        """Generate the QR code payload."""
        return {
            'ticket_code': ticket.ticket_code,
            'kind': kind,
            'issued_at': ticket.issued_at.isoformat(),
            'nonce': secrets.token_hex(8),
            'valid_days': ticket.ticket_type.valid_days,
            'version': ticket.qr_secret_version,
        }
    
    @staticmethod
    def sign_payload(payload: dict) -> str:
        """Sign the payload with HMAC."""
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            settings.QR_SIGNING_SECRET.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    @classmethod
    def generate_qr_data(cls, ticket: Ticket, kind: str = 'ATTENDEE') -> str:
        """Generate complete QR data string."""
        payload = cls.generate_payload(ticket, kind)
        signature = cls.sign_payload(payload)
        
        # Store hash for validation
        payload_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        ticket.qr_payload_hash = payload_hash
        ticket.save(update_fields=['qr_payload_hash'])
        
        return json.dumps({
            'payload': payload,
            'signature': signature
        })
    
    @classmethod
    def verify_qr_data(cls, qr_data: str) -> Tuple[bool, dict, str]:
        """
        Verify QR data signature and return validation result.
        Returns: (is_valid, payload, error_message)
        """
        try:
            data = json.loads(qr_data)
            payload = data.get('payload')
            signature = data.get('signature')
            
            if not payload or not signature:
                return False, {}, 'Invalid QR format'
            
            expected_signature = cls.sign_payload(payload)
            if not hmac.compare_digest(signature, expected_signature):
                return False, payload, 'Invalid signature'
            
            return True, payload, ''
            
        except json.JSONDecodeError:
            return False, {}, 'Invalid QR data'
        except Exception as e:
            logger.error(f"QR verification error: {e}")
            return False, {}, 'Verification error'


class OrderService:
    """Service for order management."""
    
    @staticmethod
    @transaction.atomic
    def create_order(
        buyer: User,
        items: list[dict],
        idempotency_key: str,
        payment_method: str = 'card'
    ) -> Order:
        """
        Create a new order with items.
        items: [{'ticket_type_id': uuid, 'quantity': int}, ...]
        payment_method: 'card' or 'cash'
        """
        # Check for existing order with same idempotency key
        existing = Order.objects.filter(idempotency_key=idempotency_key).first()
        if existing:
            return existing
        
        order = Order.objects.create(
            order_number=Order.generate_order_number(),
            buyer=buyer,
            idempotency_key=idempotency_key,
            payment_method=payment_method,
            status=Order.Status.CREATED
        )
        
        subtotal = 0
        for item in items:
            # Handle amphitheater tickets separately
            if item.get('type') == 'amphitheater':
                # For amphitheater tickets, create a placeholder order item
                # The actual amphitheater ticket will be created in finalize_order
                price_cents = item.get('price', 0) * 100  # Convert dollars to cents
                item_total = price_cents * item['quantity']
                
                # Create order item without ticket_type (will be handled by amphitheater service)
                # Note: We'll store amphitheater metadata in the order's metadata field
                OrderItem.objects.create(
                    order=order,
                    ticket_type=None,  # No ticket type for amphitheater
                    quantity=item['quantity'],
                    unit_price_cents=price_cents,
                    total_cents=item_total
                )
                
                # Store amphitheater metadata in order metadata
                if not hasattr(order, '_amphitheater_items'):
                    order._amphitheater_items = []
                order._amphitheater_items.append(item)
                
                subtotal += item_total
            else:
                # Regular ticket with ticket_type_id
                ticket_type = TicketType.objects.select_for_update().get(
                    id=item['ticket_type_id']
                )
                
                if not ticket_type.is_available:
                    raise ValueError(f"Ticket type {ticket_type.name} is not available")
                
                if ticket_type.capacity:
                    if ticket_type.remaining_capacity < item['quantity']:
                        raise ValueError(f"Not enough {ticket_type.name} tickets available")
                
                item_total = ticket_type.price_cents * item['quantity']
                
                OrderItem.objects.create(
                    order=order,
                    ticket_type=ticket_type,
                    quantity=item['quantity'],
                    unit_price_cents=ticket_type.price_cents,
                    total_cents=item_total
                )
                
                subtotal += item_total
        
        # Calculate fees (e.g., 3% processing fee)
        fees = int(subtotal * 0.03)
        
        order.subtotal_cents = subtotal
        order.fees_cents = fees
        order.total_cents = subtotal + fees
        
        # Save amphitheater items to order metadata for later retrieval
        if hasattr(order, '_amphitheater_items'):
            if not order.metadata:
                order.metadata = {}
            order.metadata['amphitheater_items'] = order._amphitheater_items
        
        order.save()
        
        return order
    
    @staticmethod
    @transaction.atomic
    def finalize_order(order_id: str, payment_intent_id: str) -> Order:
        """
        Finalize order after successful payment.
        Uses row locking to prevent duplicate processing.
        """
        order = Order.objects.select_for_update().get(id=order_id)
        
        # Idempotency: already processed
        if order.status == Order.Status.PAID:
            logger.info(f"Order {order.order_number} already finalized")
            return order
        
        if order.status not in [Order.Status.CREATED, Order.Status.PAYMENT_PENDING]:
            raise ValueError(f"Order in invalid state for finalization: {order.status}")
        
        # Set status based on payment method
        # Card payments: PAID (payment received via Stripe)
        # Cash payments: PAYMENT_PENDING (needs manual validation in admin)
        if order.payment_method == 'card':
            order.status = Order.Status.PAID
        else:  # cash
            order.status = Order.Status.PAYMENT_PENDING
        
        order.stripe_payment_intent_id = payment_intent_id
        order.paid_at = timezone.now()
        order.save()
        
        # Load amphitheater items from order metadata if they exist
        if order.metadata and 'amphitheater_items' in order.metadata:
            order._amphitheater_items = order.metadata['amphitheater_items']
        
        # Issue tickets
        TicketService.issue_tickets_for_order(order)
        
        # Update sold counts
        for item in order.items.all():
            TicketType.objects.filter(id=item.ticket_type_id).update(
                sold_count=F('sold_count') + item.quantity
            )
        
        # Create invoice record
        Invoice.objects.create(
            order=order,
            invoice_number=Invoice.generate_invoice_number(order)
        )
        
        # Send order confirmation email (non-blocking)
        try:
            from threading import Thread
            email_thread = Thread(target=TicketEmailService.send_order_confirmation, args=(order,))
            email_thread.start()
        except Exception as e:
            logger.error(f"Failed to queue confirmation email for order {order.order_number}: {e}")
        
        logger.info(f"Order {order.order_number} finalized successfully")
        
        return order


class TicketService:
    """Service for ticket management."""
    
    @staticmethod
    def issue_tickets_for_order(order: Order) -> list[Ticket]:
        """Issue tickets for a paid order."""
        tickets = []
        
        for item in order.items.select_related('ticket_type'):
            # Handle amphitheater tickets
            if item.ticket_type is None:
                # This is an amphitheater ticket - get metadata from order
                if hasattr(order, '_amphitheater_items'):
                    for amph_item in order._amphitheater_items:
                        for _ in range(amph_item['quantity']):
                            # Create main ticket for amphitheater
                            ticket = Ticket.objects.create(
                                ticket_code=Ticket.generate_ticket_code(),
                                owner=order.buyer,
                                ticket_type=None,
                                order=order,
                                status=Ticket.Status.ISSUED,
                                issued_at=timezone.now(),
                                metadata={
                                    'type': 'amphitheater',
                                    'section_name': amph_item.get('section', 'General'),
                                    'seats': amph_item.get('metadata', {}).get('seats', ''),
                                    'price_paid': amph_item.get('price', 0) * 100,
                                    'includes_festival_access': amph_item.get('metadata', {}).get('includes_festival_access', True),
                                    'ticket_name': amph_item.get('metadata', {}).get('ticket_name', 'Amphitheater Ticket')
                                }
                            )
                            tickets.append(ticket)
                            
                            # Auto-create festival access ticket
                            festival_ticket = TicketService._create_festival_access_ticket(order, ticket)
                            if festival_ticket:
                                tickets.append(festival_ticket)
            else:
                # Regular ticket with ticket_type
                for _ in range(item.quantity):
                    ticket = Ticket.objects.create(
                        ticket_code=Ticket.generate_ticket_code(),
                        owner=order.buyer,
                        ticket_type=item.ticket_type,
                        order=order,
                        status=Ticket.Status.ISSUED,
                        issued_at=timezone.now()
                    )
                    tickets.append(ticket)
        
        return tickets
    
    @staticmethod
    def _create_festival_access_ticket(order: Order, amphitheater_ticket: Ticket) -> Optional[Ticket]:
        """Create a complimentary festival access ticket for amphitheater ticket holder."""
        try:
            # Find or create a general festival access ticket type
            festival_ticket_type, created = TicketType.objects.get_or_create(
                slug='festival-access-comp-amphitheater',
                defaults={
                    'name': 'Festival Access (Complimentary with Amphitheater)',
                    'description': 'Complimentary festival access included with amphitheater ticket purchase',
                    'price_cents': 0,
                    'capacity': None,  # Unlimited
                    'is_active': True,
                }
            )
            
            # Create the festival access ticket
            festival_ticket = Ticket.objects.create(
                ticket_code=Ticket.generate_ticket_code(),
                owner=order.buyer,
                ticket_type=festival_ticket_type,
                order=order,
                status=Ticket.Status.ISSUED,
                is_comp=True,
                issued_at=timezone.now(),
                metadata={
                    'granted_by_amphitheater': str(amphitheater_ticket.id),
                    'complimentary': True,
                    'type': 'festival_access'
                }
            )
            
            logger.info(f"Created festival access ticket {festival_ticket.ticket_code} for amphitheater ticket {amphitheater_ticket.ticket_code}")
            return festival_ticket
            
        except Exception as e:
            logger.error(f"Failed to create festival access ticket: {e}")
            return None
    
    @staticmethod
    def issue_comp_tickets(
        to_user: User,
        ticket_type: TicketType,
        quantity: int,
        comp: Comp
    ) -> list[Ticket]:
        """Issue complimentary tickets."""
        tickets = []
        
        for _ in range(quantity):
            ticket = Ticket.objects.create(
                ticket_code=Ticket.generate_ticket_code(),
                owner=to_user,
                ticket_type=ticket_type,
                order=None,
                status=Ticket.Status.ISSUED,
                is_comp=True,
                comp=comp,
                issued_at=timezone.now()
            )
            tickets.append(ticket)
        
        return tickets


class TransferService:
    """Service for ticket transfers with concurrency control."""
    
    TRANSFER_EXPIRY_HOURS = 72
    
    @classmethod
    @transaction.atomic
    def create_transfer(
        cls,
        ticket: Ticket,
        from_user: User,
        to_email: str
    ) -> TicketTransfer:
        """Create a transfer request."""
        # Lock ticket row
        ticket = Ticket.objects.select_for_update().get(id=ticket.id)
        
        # Validate ticket state
        if ticket.owner != from_user:
            raise ValueError("You don't own this ticket")
        
        if ticket.status != Ticket.Status.ISSUED:
            raise ValueError(f"Ticket cannot be transferred (status: {ticket.status})")
        
        # Check for existing pending transfer
        existing = TicketTransfer.objects.filter(
            ticket=ticket,
            status=TicketTransfer.Status.PENDING
        ).exists()
        
        if existing:
            raise ValueError("This ticket already has a pending transfer")
        
        # Generate secure token
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        transfer = TicketTransfer.objects.create(
            ticket=ticket,
            from_user=from_user,
            to_email=to_email.lower(),
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=cls.TRANSFER_EXPIRY_HOURS)
        )
        
        # Update ticket status
        ticket.status = Ticket.Status.TRANSFER_PENDING
        ticket.save(update_fields=['status'])
        
        # Send transfer email
        cls._send_transfer_email(transfer, token)
        
        return transfer
    
    @classmethod
    @transaction.atomic
    def accept_transfer(cls, token: str, accepting_user: User) -> Ticket:
        """Accept a transfer and take ownership."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        try:
            transfer = TicketTransfer.objects.select_for_update().get(
                token_hash=token_hash,
                status=TicketTransfer.Status.PENDING
            )
        except TicketTransfer.DoesNotExist:
            raise ValueError("Invalid or expired transfer token")
        
        if transfer.is_expired:
            transfer.status = TicketTransfer.Status.EXPIRED
            transfer.save(update_fields=['status'])
            raise ValueError("Transfer has expired")
        
        # Lock and transfer ticket
        ticket = Ticket.objects.select_for_update().get(id=transfer.ticket_id)
        
        if ticket.status != Ticket.Status.TRANSFER_PENDING:
            raise ValueError("Ticket is no longer available for transfer")
        
        # Update ownership
        old_owner = ticket.owner
        ticket.owner = accepting_user
        ticket.status = Ticket.Status.ISSUED
        ticket.save(update_fields=['owner', 'status'])
        
        # Update transfer record
        transfer.to_user = accepting_user
        transfer.status = TicketTransfer.Status.ACCEPTED
        transfer.accepted_at = timezone.now()
        transfer.save()
        
        logger.info(f"Transfer accepted: {ticket.ticket_code} from {old_owner.email} to {accepting_user.email}")
        
        return ticket
    
    @classmethod
    @transaction.atomic
    def cancel_transfer(cls, transfer: TicketTransfer, user: User) -> None:
        """Cancel a pending transfer."""
        transfer = TicketTransfer.objects.select_for_update().get(id=transfer.id)
        
        if transfer.from_user != user:
            raise ValueError("You cannot cancel this transfer")
        
        if transfer.status != TicketTransfer.Status.PENDING:
            raise ValueError("Transfer is not pending")
        
        ticket = Ticket.objects.select_for_update().get(id=transfer.ticket_id)
        ticket.status = Ticket.Status.ISSUED
        ticket.save(update_fields=['status'])
        
        transfer.status = TicketTransfer.Status.CANCELLED
        transfer.save(update_fields=['status'])
    
    @staticmethod
    def _send_transfer_email(transfer: TicketTransfer, token: str) -> None:
        """Send transfer invitation email."""
        accept_url = f"{settings.FRONTEND_URL}/transfer/accept?token={token}"
        
        try:
            send_mail(
                subject="You've Been Sent an OC MENA Festival Ticket!",
                message=f"""
Hello!

{transfer.from_user.full_name} has sent you a ticket to OC MENA Festival!

Ticket: {transfer.ticket.ticket_type.name}

Click the link below to accept your ticket:
{accept_url}

This link will expire in 72 hours.

Best regards,
OC MENA Festival Team
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[transfer.to_email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send transfer email: {e}")


class UpgradeService:
    """Service for ticket upgrades."""
    
    @classmethod
    @transaction.atomic
    def create_upgrade(
        cls,
        ticket: Ticket,
        to_type: TicketType,
        user: User
    ) -> TicketUpgrade:
        """Create an upgrade request."""
        ticket = Ticket.objects.select_for_update().get(id=ticket.id)
        
        if ticket.owner != user:
            raise ValueError("You don't own this ticket")
        
        if ticket.status != Ticket.Status.ISSUED:
            raise ValueError("Ticket cannot be upgraded")
        
        if ticket.ticket_type.price_cents >= to_type.price_cents:
            raise ValueError("Can only upgrade to a higher tier ticket")
        
        # Check for existing upgrade
        existing = TicketUpgrade.objects.filter(
            ticket=ticket,
            status__in=[
                TicketUpgrade.Status.CREATED,
                TicketUpgrade.Status.PAYMENT_PENDING
            ]
        ).exists()
        
        if existing:
            raise ValueError("This ticket already has a pending upgrade")
        
        diff_cents = to_type.price_cents - ticket.ticket_type.price_cents
        
        upgrade = TicketUpgrade.objects.create(
            ticket=ticket,
            from_type=ticket.ticket_type,
            to_type=to_type,
            diff_cents=diff_cents,
            status=TicketUpgrade.Status.CREATED
        )
        
        return upgrade
    
    @classmethod
    @transaction.atomic
    def complete_upgrade(cls, upgrade: TicketUpgrade) -> Ticket:
        """Complete an upgrade after payment."""
        upgrade = TicketUpgrade.objects.select_for_update().get(id=upgrade.id)
        
        if upgrade.status == TicketUpgrade.Status.COMPLETED:
            return upgrade.ticket
        
        ticket = Ticket.objects.select_for_update().get(id=upgrade.ticket_id)
        ticket.ticket_type = upgrade.to_type
        ticket.save(update_fields=['ticket_type'])
        
        upgrade.status = TicketUpgrade.Status.COMPLETED
        upgrade.completed_at = timezone.now()
        upgrade.save()
        
        return ticket
    
    @classmethod
    @transaction.atomic
    def comp_upgrade(
        cls,
        ticket: Ticket,
        to_type: TicketType,
        staff_user: User
    ) -> TicketUpgrade:
        """Staff-initiated complimentary upgrade."""
        ticket = Ticket.objects.select_for_update().get(id=ticket.id)
        
        if ticket.status != Ticket.Status.ISSUED:
            raise ValueError("Ticket cannot be upgraded")
        
        diff_cents = to_type.price_cents - ticket.ticket_type.price_cents
        
        upgrade = TicketUpgrade.objects.create(
            ticket=ticket,
            from_type=ticket.ticket_type,
            to_type=to_type,
            diff_cents=diff_cents,
            status=TicketUpgrade.Status.COMPED,
            comped_by=staff_user,
            completed_at=timezone.now()
        )
        
        ticket.ticket_type = to_type
        ticket.save(update_fields=['ticket_type'])
        
        return upgrade


class RefundService:
    """Service for refunds."""
    
    @classmethod
    @transaction.atomic
    def create_refund(
        cls,
        order: Order,
        initiated_by: User,
        amount_cents: Optional[int],
        reason: str,
        notes: str = ''
    ) -> Refund:
        """Create a refund request."""
        order = Order.objects.select_for_update().get(id=order.id)
        
        if order.status not in [Order.Status.PAID, Order.Status.PARTIALLY_REFUNDED]:
            raise ValueError(f"Order cannot be refunded (status: {order.status})")
        
        max_refund = order.total_cents - order.refunded_cents
        
        if amount_cents is None:
            amount_cents = max_refund
        
        if amount_cents > max_refund:
            raise ValueError(f"Maximum refund amount is ${max_refund / 100:.2f}")
        
        refund = Refund.objects.create(
            order=order,
            initiated_by=initiated_by,
            amount_cents=amount_cents,
            reason=reason,
            notes=notes,
            status=Refund.Status.REQUESTED
        )
        
        return refund
    
    @classmethod
    @transaction.atomic
    def process_refund(cls, refund: Refund, stripe_refund_id: str) -> None:
        """Mark refund as processed after Stripe confirmation."""
        refund = Refund.objects.select_for_update().get(id=refund.id)
        order = Order.objects.select_for_update().get(id=refund.order_id)
        
        refund.status = Refund.Status.SUCCEEDED
        refund.stripe_refund_id = stripe_refund_id
        refund.processed_at = timezone.now()
        refund.save()
        
        order.refunded_cents += refund.amount_cents
        
        if order.refunded_cents >= order.total_cents:
            order.status = Order.Status.REFUNDED
            # Cancel all tickets
            order.tickets.update(status=Ticket.Status.REFUNDED)
        else:
            order.status = Order.Status.PARTIALLY_REFUNDED
        
        order.save()


class CompService:
    """Service for complimentary tickets."""
    
    @classmethod
    @transaction.atomic
    def issue_comp(
        cls,
        issued_by: User,
        to_user: User,
        ticket_type: TicketType,
        quantity: int,
        reason: str,
        notes: str = ''
    ) -> Tuple[Comp, list[Ticket]]:
        """Issue complimentary tickets."""
        comp = Comp.objects.create(
            issued_by=issued_by,
            to_user=to_user,
            ticket_type=ticket_type,
            quantity=quantity,
            reason=reason,
            notes=notes
        )
        
        tickets = TicketService.issue_comp_tickets(
            to_user=to_user,
            ticket_type=ticket_type,
            quantity=quantity,
            comp=comp
        )
        
        # Send notification email
        try:
            send_mail(
                subject="You've Received Complimentary OC MENA Festival Tickets!",
                message=f"""
Hello {to_user.full_name}!

You have been issued {quantity} complimentary {ticket_type.name} ticket(s) to OC MENA Festival!

Log in to your account to view your tickets:
{settings.FRONTEND_URL}/dashboard

Best regards,
OC MENA Festival Team
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send comp notification: {e}")
        
        return comp, tickets
