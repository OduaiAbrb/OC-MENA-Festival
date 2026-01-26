"""
API views for amphitheater ticketing.
Production-ready endpoints with concurrency safety.
"""
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema
from django.core.cache import cache

from .amphitheater_models import Venue, Section, SeatBlock
from .amphitheater_services import AmphitheaterService
from .amphitheater_serializers import (
    VenueSerializer,
    SectionSerializer,
    CheckAvailabilitySerializer,
    CreateSeatHoldSerializer,
    SeatHoldSerializer,
    AmphitheaterTicketSerializer,
)

logger = logging.getLogger(__name__)


class VenueListView(APIView):
    """Get list of amphitheater venues."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Get amphitheater venues",
        responses={200: VenueSerializer(many=True)}
    )
    def get(self, request):
        venues = Venue.objects.filter(is_active=True)
        serializer = VenueSerializer(venues, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class VenueSectionsView(APIView):
    """Get sections with availability for a specific venue and date."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Get venue sections with availability",
        responses={200: SectionSerializer(many=True)}
    )
    def get(self, request, venue_id):
        event_date = request.query_params.get('event_date')
        
        if not event_date:
            return Response({
                'success': False,
                'error': 'event_date parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cache key for performance
        cache_key = f'venue_sections_{venue_id}_{event_date}'
        cached = cache.get(cache_key)
        
        if cached:
            return Response({
                'success': True,
                'data': cached,
                'cached': True
            })
        
        sections = AmphitheaterService.get_venue_sections(venue_id, event_date)
        
        # Cache for 30 seconds (short TTL due to real-time availability)
        cache.set(cache_key, sections, timeout=30)
        
        return Response({
            'success': True,
            'data': sections
        })


class CheckAvailabilityView(APIView):
    """Check seat availability for a section."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Check seat availability",
        request=CheckAvailabilitySerializer,
        responses={200: dict}
    )
    def post(self, request):
        serializer = CheckAvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = AmphitheaterService.check_availability(
            section_id=str(serializer.validated_data['section_id']),
            event_date=str(serializer.validated_data['event_date']),
            quantity=serializer.validated_data['quantity']
        )
        
        return Response({
            'success': result.get('available', False),
            'data': result
        })


class CreateSeatHoldView(APIView):
    """Create a seat hold (10-minute reservation)."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Create seat hold",
        request=CreateSeatHoldSerializer,
        responses={201: SeatHoldSerializer}
    )
    def post(self, request):
        serializer = CreateSeatHoldSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get user or session key
        user = request.user if request.user.is_authenticated else None
        session_key = serializer.validated_data.get('session_key') or request.session.session_key
        
        if not session_key and not user:
            # Create session if needed
            if not request.session.session_key:
                request.session.create()
            session_key = request.session.session_key
        
        result = AmphitheaterService.create_seat_hold(
            section_id=str(serializer.validated_data['section_id']),
            event_date=str(serializer.validated_data['event_date']),
            quantity=serializer.validated_data['quantity'],
            user=user,
            session_key=session_key
        )
        
        if not result.get('success'):
            return Response({
                'success': False,
                'error': result.get('error', 'Failed to create seat hold')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': result
        }, status=status.HTTP_201_CREATED)


class ReleaseSeatHoldView(APIView):
    """Release a seat hold."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Release seat hold",
        responses={200: dict}
    )
    def post(self, request, hold_id):
        success = AmphitheaterService.release_hold(hold_id)
        
        if success:
            return Response({
                'success': True,
                'message': 'Seat hold released'
            })
        else:
            return Response({
                'success': False,
                'error': 'Seat hold not found or already released'
            }, status=status.HTTP_404_NOT_FOUND)


class MyAmphitheaterTicketsView(APIView):
    """Get user's amphitheater tickets."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get my amphitheater tickets",
        responses={200: AmphitheaterTicketSerializer(many=True)}
    )
    def get(self, request):
        tickets = AmphitheaterService.get_user_amphitheater_tickets(request.user)
        
        return Response({
            'success': True,
            'data': tickets
        })


class EventDatesView(APIView):
    """Get available event dates for amphitheater."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Get available event dates",
        responses={200: dict}
    )
    def get(self, request):
        # Get unique event dates from seat blocks
        dates = SeatBlock.objects.filter(
            is_active=True,
            available_seats__gt=0
        ).values_list('event_date', flat=True).distinct().order_by('event_date')
        
        event_dates = []
        for date in dates:
            event_dates.append({
                'date': str(date),
                'day_name': date.strftime('%A'),
                'formatted': date.strftime('%B %d, %Y'),
            })
        
        return Response({
            'success': True,
            'data': event_dates
        })
