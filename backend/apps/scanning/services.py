"""
Scanning services with atomic operations.
"""
import logging
from datetime import date
from typing import Tuple, Optional
from django.db import transaction
from django.utils import timezone

from apps.tickets.models import Ticket
from apps.tickets.services import QRCodeService
from .models import TicketScanLog

logger = logging.getLogger(__name__)


class ScanService:
    """Service for ticket scanning operations."""
    
    @classmethod
    def validate_qr(cls, qr_data: str) -> Tuple[bool, dict]:
        """
        Validate QR code data or plain ticket code without marking ticket as used.
        Returns: (is_valid, result_dict)
        """
        ticket_code = qr_data.strip()
        
        # If it looks like a URL, extract the code parameter
        if 'code=' in ticket_code:
            try:
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(ticket_code)
                params = parse_qs(parsed.query)
                if 'code' in params:
                    ticket_code = params['code'][0]
            except:
                pass
        
        # Try to find ticket by code directly
        try:
            ticket = Ticket.objects.select_related(
                'ticket_type', 'owner'
            ).get(ticket_code=ticket_code)
        except Ticket.DoesNotExist:
            # Try signed QR data as fallback
            is_valid, payload, error = QRCodeService.verify_qr_data(qr_data)
            if is_valid:
                ticket_code = payload.get('ticket_code')
                try:
                    ticket = Ticket.objects.select_related(
                        'ticket_type', 'owner'
                    ).get(ticket_code=ticket_code)
                except Ticket.DoesNotExist:
                    pass
                else:
                    result = cls._check_ticket_status(ticket, payload)
                    return result['can_enter'], result
            
            return False, {
                'is_valid': False,
                'valid': False,
                'ticket_code': ticket_code,
                'ticket_type': None,
                'owner_name': None,
                'status': 'NOT_FOUND',
                'message': 'Ticket not found',
                'can_enter': False
            }
        
        # Check ticket status
        result = cls._check_ticket_status(ticket, {})
        result['is_valid'] = result.get('can_enter', False) or result.get('status') == 'VALID'
        return result.get('can_enter', False), result
    
    @classmethod
    def _check_ticket_status(cls, ticket: Ticket, payload: dict) -> dict:
        """Check if ticket is valid for entry."""
        # Check if this is an amphitheater ticket
        is_amphitheater = hasattr(ticket, 'amphitheater_ticket')
        
        base_result = {
            'valid': True,
            'ticket_code': ticket.ticket_code,
            'ticket_type': ticket.ticket_type.name,
            'owner_name': ticket.owner.full_name,
            'is_amphitheater': is_amphitheater,
        }
        
        # If amphitheater ticket, add seat info
        if is_amphitheater:
            amph_ticket = ticket.amphitheater_ticket
            base_result.update({
                'section': amph_ticket.seat_block.section.name,
                'row': amph_ticket.row,
                'seat': amph_ticket.seat_number,
                'event_date': str(amph_ticket.event_date),
                'includes_festival_access': amph_ticket.includes_festival_access,
            })
            
            # Check if amphitheater ticket grants festival access for today
            if amph_ticket.includes_festival_access and amph_ticket.event_date == date.today():
                base_result['festival_access_granted'] = True
                base_result['message'] = f'Amphitheater ticket grants festival access for today'
        
        # Already used
        if ticket.status == Ticket.Status.USED:
            return {
                **base_result,
                'status': 'ALREADY_USED',
                'message': f'Ticket already used at {ticket.used_at.strftime("%H:%M")}',
                'can_enter': False
            }
        
        # Refunded
        if ticket.status == Ticket.Status.REFUNDED:
            return {
                **base_result,
                'status': 'REFUNDED',
                'message': 'Ticket has been refunded',
                'can_enter': False
            }
        
        # Cancelled
        if ticket.status == Ticket.Status.CANCELLED:
            return {
                **base_result,
                'status': 'CANCELLED',
                'message': 'Ticket has been cancelled',
                'can_enter': False
            }
        
        # Transfer pending
        if ticket.status == Ticket.Status.TRANSFER_PENDING:
            return {
                **base_result,
                'status': 'TRANSFER_PENDING',
                'message': 'Ticket has a pending transfer',
                'can_enter': False
            }
        
        # Check valid days
        today = date.today().isoformat()
        valid_days = ticket.ticket_type.valid_days
        
        if valid_days and today not in valid_days:
            return {
                **base_result,
                'status': 'WRONG_DAY',
                'message': f'Ticket not valid today. Valid on: {", ".join(valid_days)}',
                'can_enter': False
            }
        
        # All good!
        return {
            **base_result,
            'status': 'VALID',
            'message': 'Valid ticket - Entry allowed',
            'can_enter': True
        }
    
    @classmethod
    @transaction.atomic
    def commit_scan(
        cls,
        ticket_code: str,
        scanner_user,
        gate: str = '',
        device_id: str = ''
    ) -> Tuple[bool, dict]:
        """
        Atomically mark ticket as used.
        Uses SELECT FOR UPDATE to prevent race conditions.
        """
        try:
            # Lock ticket row
            ticket = Ticket.objects.select_for_update(nowait=True).get(
                ticket_code=ticket_code
            )
        except Ticket.DoesNotExist:
            cls._log_scan(None, scanner_user, TicketScanLog.Result.NOT_FOUND, gate, device_id)
            return False, {
                'success': False,
                'status': 'NOT_FOUND',
                'message': 'Ticket not found'
            }
        except Exception as e:
            # Could be locked by another transaction
            logger.warning(f"Scan contention for {ticket_code}: {e}")
            return False, {
                'success': False,
                'status': 'CONTENTION',
                'message': 'Ticket is being processed, please try again'
            }
        
        # Check status
        if ticket.status == Ticket.Status.USED:
            cls._log_scan(ticket, scanner_user, TicketScanLog.Result.ALREADY_USED, gate, device_id)
            return False, {
                'success': False,
                'status': 'ALREADY_USED',
                'message': f'Ticket already used at {ticket.used_at.strftime("%H:%M") if ticket.used_at else "unknown"}'
            }
        
        if ticket.status == Ticket.Status.REFUNDED:
            cls._log_scan(ticket, scanner_user, TicketScanLog.Result.REFUNDED, gate, device_id)
            return False, {
                'success': False,
                'status': 'REFUNDED',
                'message': 'Ticket has been refunded'
            }
        
        if ticket.status == Ticket.Status.CANCELLED:
            cls._log_scan(ticket, scanner_user, TicketScanLog.Result.CANCELLED, gate, device_id)
            return False, {
                'success': False,
                'status': 'CANCELLED',
                'message': 'Ticket has been cancelled'
            }
        
        if ticket.status == Ticket.Status.TRANSFER_PENDING:
            cls._log_scan(ticket, scanner_user, TicketScanLog.Result.TRANSFER_PENDING, gate, device_id)
            return False, {
                'success': False,
                'status': 'TRANSFER_PENDING',
                'message': 'Ticket has a pending transfer'
            }
        
        # Check valid day
        today = date.today().isoformat()
        valid_days = ticket.ticket_type.valid_days
        
        if valid_days and today not in valid_days:
            cls._log_scan(ticket, scanner_user, TicketScanLog.Result.WRONG_DAY, gate, device_id)
            return False, {
                'success': False,
                'status': 'WRONG_DAY',
                'message': f'Ticket not valid today'
            }
        
        # Mark as used
        ticket.status = Ticket.Status.USED
        ticket.used_at = timezone.now()
        ticket.save(update_fields=['status', 'used_at'])
        
        cls._log_scan(ticket, scanner_user, TicketScanLog.Result.SUCCESS, gate, device_id)
        
        logger.info(f"Ticket {ticket_code} scanned by {scanner_user.email}")
        
        return True, {
            'success': True,
            'status': 'SUCCESS',
            'message': 'Entry granted',
            'ticket_type': ticket.ticket_type.name,
            'owner_name': ticket.owner.full_name
        }
    
    @staticmethod
    def _log_scan(
        ticket: Optional[Ticket],
        scanner,
        result: str,
        gate: str,
        device_id: str,
        raw_qr_data: str = ''
    ):
        """Log a scan attempt."""
        TicketScanLog.objects.create(
            ticket=ticket,
            scanner=scanner,
            result=result,
            gate=gate,
            device_id=device_id,
            raw_qr_data=raw_qr_data
        )
