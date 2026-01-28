"""
Views for amphitheater seat management.
"""
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import AmphitheaterSeat, Ticket
from apps.accounts.permissions import IsStaffOrAdmin

logger = logging.getLogger(__name__)


class AmphitheaterSeatAvailabilityView(APIView):
    """Get seat availability for amphitheater."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="Get amphitheater seat availability")
    def get(self, request):
        """Return all seats with their availability status."""
        try:
            # Clear expired reservations
            AmphitheaterSeat.objects.filter(
                reserved_until__lt=timezone.now(),
                is_available=False,
                ticket__isnull=True
            ).update(is_available=True, reserved_until=None)
            
            # Get all seats
            seats = AmphitheaterSeat.objects.all().values(
                'section_id', 'section_name', 'row', 'seat_number', 
                'is_available', 'price_cents'
            )
            
            return Response({
                'success': True,
                'data': list(seats)
            })
        except Exception as e:
            logger.error(f"Error fetching seat availability: {e}")
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InitializeSeatsView(APIView):
    """Initialize amphitheater seats (staff only)."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Initialize amphitheater seats")
    def post(self, request):
        """Create all amphitheater seats if they don't exist."""
        try:
            # Section configuration matching frontend
            sections_config = [
                {'id': 1, 'name': 'Section 1', 'price': 179, 'rows': 5, 'seatsPerRow': 6},
                {'id': 2, 'name': 'Section 2', 'price': 199, 'rows': 5, 'seatsPerRow': 7},
                {'id': 3, 'name': 'Section 3', 'price': 179, 'rows': 5, 'seatsPerRow': 6},
                {'id': 4, 'name': 'Section 4', 'price': 129, 'rows': 6, 'seatsPerRow': 7},
                {'id': 5, 'name': 'Section 5', 'price': 119, 'rows': 6, 'seatsPerRow': 8},
                {'id': 6, 'name': 'Section 6', 'price': 99, 'rows': 7, 'seatsPerRow': 10},
                {'id': 7, 'name': 'Section 7', 'price': 119, 'rows': 6, 'seatsPerRow': 8},
                {'id': 8, 'name': 'Section 8', 'price': 129, 'rows': 6, 'seatsPerRow': 7},
            ]
            
            created_count = 0
            for section in sections_config:
                for row in range(section['rows']):
                    row_letter = chr(65 + row)  # A, B, C, etc.
                    seats_in_row = section['seatsPerRow'] + int(row * 0.3)
                    
                    for seat_num in range(1, seats_in_row + 1):
                        seat, created = AmphitheaterSeat.objects.get_or_create(
                            section_id=section['id'],
                            row=row_letter,
                            seat_number=seat_num,
                            defaults={
                                'section_name': section['name'],
                                'price_cents': section['price'] * 100,
                                'is_available': True
                            }
                        )
                        if created:
                            created_count += 1
            
            return Response({
                'success': True,
                'data': {
                    'message': f'Initialized {created_count} new seats',
                    'total_seats': AmphitheaterSeat.objects.count()
                }
            })
        except Exception as e:
            logger.error(f"Error initializing seats: {e}")
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReserveSeatView(APIView):
    """Reserve seats temporarily (5 minutes)."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Reserve seats temporarily")
    def post(self, request):
        """Reserve seats for checkout."""
        seat_ids = request.data.get('seat_ids', [])
        
        if not seat_ids:
            return Response({
                'success': False,
                'error': {'message': 'No seats provided'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Reserve seats for 5 minutes
            reserved_until = timezone.now() + timezone.timedelta(minutes=5)
            
            updated = AmphitheaterSeat.objects.filter(
                id__in=seat_ids,
                is_available=True
            ).update(
                is_available=False,
                reserved_until=reserved_until
            )
            
            return Response({
                'success': True,
                'data': {
                    'reserved_count': updated,
                    'reserved_until': reserved_until.isoformat()
                }
            })
        except Exception as e:
            logger.error(f"Error reserving seats: {e}")
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
