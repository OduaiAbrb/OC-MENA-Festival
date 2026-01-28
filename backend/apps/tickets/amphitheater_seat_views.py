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
        """Create all amphitheater seats if they don't exist - ~8000 seats total."""
        try:
            # Pacific Amphitheatre configuration matching frontend
            sections_config = [
                # Pit - Standing room
                {'id': 'pit', 'name': 'Pit', 'price': 299, 'tier': 'pit', 'capacity': 200},
                
                # Circle - Premium seating
                {'id': 'circle', 'name': 'Circle', 'price': 249, 'tier': 'circle', 'rows': 8, 'seatsPerRow': 35},
                
                # Front sections - Enlarged
                {'id': 1, 'name': 'Section 1', 'price': 199, 'tier': 'front', 'rows': 25, 'seatsPerRow': 28},
                {'id': 2, 'name': 'Section 2', 'price': 229, 'tier': 'front', 'rows': 25, 'seatsPerRow': 32},
                {'id': 3, 'name': 'Section 3', 'price': 199, 'tier': 'front', 'rows': 25, 'seatsPerRow': 28},
                
                # Mid sections
                {'id': 4, 'name': 'Section 4', 'price': 149, 'tier': 'mid', 'rows': 30, 'seatsPerRow': 32},
                {'id': 5, 'name': 'Section 5', 'price': 139, 'tier': 'mid', 'rows': 30, 'seatsPerRow': 35},
                {'id': 7, 'name': 'Section 7', 'price': 139, 'tier': 'mid', 'rows': 30, 'seatsPerRow': 35},
                {'id': 8, 'name': 'Section 8', 'price': 149, 'tier': 'mid', 'rows': 30, 'seatsPerRow': 32},
                
                # Back section
                {'id': 6, 'name': 'Section 6', 'price': 99, 'tier': 'back', 'rows': 35, 'seatsPerRow': 45},
            ]
            
            created_count = 0
            
            for section in sections_config:
                # Handle Pit (standing room)
                if section['tier'] == 'pit':
                    for i in range(section['capacity']):
                        seat, created = AmphitheaterSeat.objects.get_or_create(
                            section_id=str(section['id']),
                            row='GA',
                            seat_number=i + 1,
                            defaults={
                                'section_name': section['name'],
                                'price_cents': section['price'] * 100,
                                'is_available': True
                            }
                        )
                        if created:
                            created_count += 1
                
                # Handle Circle and regular sections
                else:
                    for row in range(section['rows']):
                        row_letter = chr(65 + row)  # A, B, C, etc.
                        
                        # Calculate seats per row with gradual increase
                        if section['tier'] == 'circle':
                            seats_in_row = section['seatsPerRow'] + int(row * 0.5)
                        else:
                            seats_in_row = section['seatsPerRow'] + int(row * 0.4)
                        
                        for seat_num in range(1, seats_in_row + 1):
                            seat, created = AmphitheaterSeat.objects.get_or_create(
                                section_id=str(section['id']),
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
            
            total_seats = AmphitheaterSeat.objects.count()
            logger.info(f"Initialized {created_count} new seats. Total seats: {total_seats}")
            
            return Response({
                'success': True,
                'data': {
                    'message': f'Initialized {created_count} new seats',
                    'total_seats': total_seats
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
