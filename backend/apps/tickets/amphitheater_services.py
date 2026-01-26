"""
Amphitheater ticketing services with concurrency-safe seat allocation.
Section-based "best available" seat selection (SeatGeek-style).
"""
import logging
from datetime import timedelta
from django.db import transaction, models
from django.utils import timezone
from django.conf import settings
from typing import List, Dict, Optional, Tuple

from .amphitheater_models import (
    Venue, Section, SeatBlock, SeatHold, AmphitheaterTicket
)
from .models import Ticket, TicketType, Order
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class AmphitheaterService:
    """Service for amphitheater ticket operations."""
    
    HOLD_DURATION_MINUTES = 10
    
    @staticmethod
    def get_venue_sections(venue_id: str, event_date: str) -> List[Dict]:
        """
        Get all sections with availability for a specific event date.
        Returns section info + availability for interactive map.
        """
        try:
            venue = Venue.objects.get(id=venue_id, is_active=True)
        except Venue.DoesNotExist:
            return []
        
        sections = Section.objects.filter(venue=venue, is_active=True)
        result = []
        
        for section in sections:
            # Get total availability across all blocks for this section/date
            blocks = SeatBlock.objects.filter(
                section=section,
                event_date=event_date,
                is_active=True
            )
            
            total_available = sum(block.available_seats for block in blocks)
            total_capacity = sum(block.total_seats for block in blocks)
            min_price = min((block.price_cents for block in blocks), default=0)
            
            result.append({
                'id': str(section.id),
                'name': section.name,
                'section_type': section.section_type,
                'capacity': section.capacity,
                'available': total_available,
                'total_capacity': total_capacity,
                'price_cents': min_price,
                'price': min_price / 100,
                'color': section.color,
                'map_coordinates': section.map_coordinates,
                'is_available': total_available > 0,
            })
        
        return result
    
    @staticmethod
    def check_availability(section_id: str, event_date: str, quantity: int) -> Dict:
        """
        Check if requested quantity is available in section.
        Returns availability status and pricing.
        """
        try:
            section = Section.objects.get(id=section_id, is_active=True)
        except Section.DoesNotExist:
            return {
                'available': False,
                'message': 'Section not found',
            }
        
        # Clean up expired holds first
        AmphitheaterService._cleanup_expired_holds()
        
        # Get available blocks for this section/date
        blocks = SeatBlock.objects.filter(
            section=section,
            event_date=event_date,
            is_active=True,
            available_seats__gte=quantity
        ).order_by('row_start', 'seat_start')
        
        if not blocks.exists():
            return {
                'available': False,
                'message': f'Not enough adjacent seats available in {section.name}',
            }
        
        # Get best block (first one with enough seats)
        best_block = blocks.first()
        
        return {
            'available': True,
            'section_id': str(section.id),
            'section_name': section.name,
            'quantity': quantity,
            'price_cents': best_block.price_cents,
            'price_per_ticket': best_block.price_cents / 100,
            'total_price': (best_block.price_cents * quantity) / 100,
            'event_date': event_date,
        }
    
    @staticmethod
    @transaction.atomic
    def create_seat_hold(
        section_id: str,
        event_date: str,
        quantity: int,
        user: Optional[User] = None,
        session_key: str = None
    ) -> Dict:
        """
        Create a seat hold with best available seat allocation.
        Uses SELECT FOR UPDATE to prevent race conditions.
        """
        if not user and not session_key:
            raise ValueError("Either user or session_key must be provided")
        
        # Clean up expired holds
        AmphitheaterService._cleanup_expired_holds()
        
        try:
            section = Section.objects.select_for_update().get(id=section_id, is_active=True)
        except Section.DoesNotExist:
            return {
                'success': False,
                'error': 'Section not found',
            }
        
        # Find best available block with SELECT FOR UPDATE (concurrency safe)
        blocks = SeatBlock.objects.select_for_update().filter(
            section=section,
            event_date=event_date,
            is_active=True,
            available_seats__gte=quantity
        ).order_by('row_start', 'seat_start')
        
        if not blocks.exists():
            return {
                'success': False,
                'error': f'Not enough adjacent seats available in {section.name}',
            }
        
        best_block = blocks.first()
        
        # Allocate best available seats
        allocated_seats = AmphitheaterService._allocate_seats(best_block, quantity)
        
        if not allocated_seats:
            return {
                'success': False,
                'error': 'Failed to allocate seats',
            }
        
        # Update block availability
        best_block.available_seats -= quantity
        best_block.held_seats += quantity
        best_block.save(update_fields=['available_seats', 'held_seats', 'updated_at'])
        
        # Create hold
        expires_at = timezone.now() + timedelta(minutes=AmphitheaterService.HOLD_DURATION_MINUTES)
        hold = SeatHold.objects.create(
            seat_block=best_block,
            user=user,
            session_key=session_key or (user.email if user else 'unknown'),
            quantity=quantity,
            allocated_seats=allocated_seats,
            expires_at=expires_at,
            is_active=True,
        )
        
        logger.info(f"Created seat hold {hold.id} for {quantity} seats in {section.name}")
        
        return {
            'success': True,
            'hold_id': str(hold.id),
            'section_name': section.name,
            'quantity': quantity,
            'seats': allocated_seats,
            'price_cents': best_block.price_cents,
            'price_per_ticket': best_block.price_cents / 100,
            'total_price_cents': best_block.price_cents * quantity,
            'total_price': (best_block.price_cents * quantity) / 100,
            'expires_at': expires_at.isoformat(),
            'event_date': event_date,
        }
    
    @staticmethod
    def _allocate_seats(seat_block: SeatBlock, quantity: int) -> List[Dict]:
        """
        Allocate best available adjacent seats from a block.
        Returns list of {row, seat} assignments.
        """
        # Get already allocated seats in this block
        existing_tickets = AmphitheaterTicket.objects.filter(
            seat_block=seat_block,
            status__in=['ISSUED', 'USED']
        ).values_list('row', 'seat_number')
        
        existing_holds = SeatHold.objects.filter(
            seat_block=seat_block,
            is_active=True,
            expires_at__gt=timezone.now()
        )
        
        allocated_set = set(existing_tickets)
        for hold in existing_holds:
            for seat in hold.allocated_seats:
                allocated_set.add((seat['row'], seat['seat']))
        
        # Generate best available seats
        allocated_seats = []
        current_row = seat_block.row_start
        
        # Simple allocation: fill rows sequentially
        for seat_num in range(seat_block.seat_start, seat_block.seat_end + 1):
            if len(allocated_seats) >= quantity:
                break
            
            if (current_row, seat_num) not in allocated_set:
                allocated_seats.append({
                    'row': current_row,
                    'seat': seat_num,
                })
        
        return allocated_seats
    
    @staticmethod
    @transaction.atomic
    def convert_hold_to_tickets(
        hold_id: str,
        order: Order,
        ticket_type: TicketType
    ) -> List[AmphitheaterTicket]:
        """
        Convert a seat hold into actual tickets after payment.
        Called by payment webhook/confirmation.
        """
        try:
            hold = SeatHold.objects.select_for_update().get(id=hold_id, is_active=True)
        except SeatHold.DoesNotExist:
            logger.error(f"Seat hold {hold_id} not found or already converted")
            return []
        
        # Check if hold expired
        if hold.expires_at < timezone.now():
            logger.error(f"Seat hold {hold_id} expired")
            hold.is_active = False
            hold.save(update_fields=['is_active'])
            return []
        
        amphitheater_tickets = []
        
        # Create amphitheater ticket for each seat
        for seat_info in hold.allocated_seats:
            # Create main festival ticket (for QR code and scanning)
            festival_ticket = Ticket.objects.create(
                ticket_type=ticket_type,
                owner=order.buyer,
                order=order,
                status='ISSUED',
                metadata={
                    'amphitheater': True,
                    'section': hold.seat_block.section.name,
                    'row': seat_info['row'],
                    'seat': seat_info['seat'],
                    'event_date': str(hold.seat_block.event_date),
                }
            )
            
            # Create amphitheater-specific ticket
            amph_ticket = AmphitheaterTicket.objects.create(
                festival_ticket=festival_ticket,
                seat_block=hold.seat_block,
                row=seat_info['row'],
                seat_number=seat_info['seat'],
                event_date=hold.seat_block.event_date,
                price_paid_cents=hold.seat_block.price_cents,
                status='ISSUED',
                includes_festival_access=True,
            )
            
            amphitheater_tickets.append(amph_ticket)
        
        # Update seat block counts
        seat_block = hold.seat_block
        seat_block.held_seats -= hold.quantity
        seat_block.sold_seats += hold.quantity
        seat_block.save(update_fields=['held_seats', 'sold_seats', 'updated_at'])
        
        # Deactivate hold
        hold.is_active = False
        hold.save(update_fields=['is_active'])
        
        logger.info(f"Converted hold {hold_id} to {len(amphitheater_tickets)} amphitheater tickets")
        
        # Auto-grant festival access
        AmphitheaterService._grant_festival_access(amphitheater_tickets, order)
        
        return amphitheater_tickets
    
    @staticmethod
    @transaction.atomic
    def _grant_festival_access(
        amphitheater_tickets: List[AmphitheaterTicket],
        order: Order
    ):
        """
        Auto-grant festival day pass for each amphitheater ticket.
        Creates a free festival ticket for the same day.
        """
        for amph_ticket in amphitheater_tickets:
            event_date = amph_ticket.event_date
            
            # Find or create festival day pass ticket type
            day_name = event_date.strftime('%A')  # e.g., "Friday"
            ticket_type_name = f"Festival Day Pass - {day_name} (Complimentary with Amphitheater)"
            
            festival_ticket_type, created = TicketType.objects.get_or_create(
                slug=f'festival-day-{event_date.strftime("%Y-%m-%d")}-comp',
                defaults={
                    'name': ticket_type_name,
                    'description': f'Complimentary festival access included with amphitheater ticket',
                    'price_cents': 0,
                    'capacity': 100000,  # Unlimited
                    'is_active': True,
                    'valid_days': [day_name],
                }
            )
            
            # Create complimentary festival ticket
            festival_day_ticket = Ticket.objects.create(
                ticket_type=festival_ticket_type,
                owner=order.buyer,
                order=order,
                status='ISSUED',
                is_comp=True,
                metadata={
                    'granted_by_amphitheater': str(amph_ticket.id),
                    'event_date': str(event_date),
                    'complimentary': True,
                }
            )
            
            # Link to amphitheater ticket
            amph_ticket.festival_day_ticket = festival_day_ticket
            amph_ticket.save(update_fields=['festival_day_ticket'])
            
            logger.info(f"Granted festival access ticket {festival_day_ticket.id} for amphitheater ticket {amph_ticket.id}")
    
    @staticmethod
    def _cleanup_expired_holds():
        """Release seats from expired holds."""
        expired_holds = SeatHold.objects.filter(
            is_active=True,
            expires_at__lt=timezone.now()
        ).select_related('seat_block')
        
        for hold in expired_holds:
            with transaction.atomic():
                # Return seats to availability
                seat_block = SeatBlock.objects.select_for_update().get(id=hold.seat_block.id)
                seat_block.available_seats += hold.quantity
                seat_block.held_seats -= hold.quantity
                seat_block.save(update_fields=['available_seats', 'held_seats', 'updated_at'])
                
                # Deactivate hold
                hold.is_active = False
                hold.save(update_fields=['is_active'])
        
        if expired_holds.exists():
            logger.info(f"Cleaned up {expired_holds.count()} expired seat holds")
    
    @staticmethod
    @transaction.atomic
    def release_hold(hold_id: str) -> bool:
        """Manually release a seat hold (e.g., user cancels)."""
        try:
            hold = SeatHold.objects.select_for_update().get(id=hold_id, is_active=True)
        except SeatHold.DoesNotExist:
            return False
        
        # Return seats to availability
        seat_block = SeatBlock.objects.select_for_update().get(id=hold.seat_block.id)
        seat_block.available_seats += hold.quantity
        seat_block.held_seats -= hold.quantity
        seat_block.save(update_fields=['available_seats', 'held_seats', 'updated_at'])
        
        # Deactivate hold
        hold.is_active = False
        hold.save(update_fields=['is_active'])
        
        logger.info(f"Released seat hold {hold_id}")
        return True
    
    @staticmethod
    def get_user_amphitheater_tickets(user: User) -> List[Dict]:
        """Get all amphitheater tickets for a user."""
        tickets = AmphitheaterTicket.objects.filter(
            festival_ticket__owner=user,
            status__in=['ISSUED', 'USED']
        ).select_related(
            'festival_ticket',
            'seat_block__section',
            'festival_day_ticket'
        ).order_by('-event_date', 'seat_block__section__name', 'row', 'seat_number')
        
        result = []
        for ticket in tickets:
            result.append({
                'id': str(ticket.id),
                'ticket_code': ticket.festival_ticket.ticket_code,
                'event_name': ticket.event_name,
                'event_date': str(ticket.event_date),
                'section': ticket.seat_block.section.name,
                'row': ticket.row,
                'seat': ticket.seat_number,
                'seat_location': ticket.seat_location,
                'price_paid': ticket.price_paid_cents / 100,
                'status': ticket.status,
                'qr_code': ticket.festival_ticket.qr_code if hasattr(ticket.festival_ticket, 'qr_code') else None,
                'includes_festival_access': ticket.includes_festival_access,
                'festival_day_ticket_code': ticket.festival_day_ticket.ticket_code if ticket.festival_day_ticket else None,
            })
        
        return result
