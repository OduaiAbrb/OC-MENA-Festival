"""
Vendor views.
"""
import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.accounts.permissions import IsVendor, IsVendorOrAdmin, IsStaffOrAdmin, IsAdmin
from apps.accounts.services import AuditService
from apps.config.models import EventConfig

from rest_framework.throttling import AnonRateThrottle
from .models import VendorProfile, Booth, BoothAssignment
from .serializers import (
    VendorPublicSerializer, VendorProfileSerializer, VendorProfileUpdateSerializer,
    BoothSerializer, BoothAssignmentSerializer, BoothAssignSerializer,
    AdminVendorSerializer, BazaarVendorRegistrationSerializer, FoodVendorRegistrationSerializer
)
from .services import VendorService

logger = logging.getLogger(__name__)


class VendorPublicListView(APIView):
    """Public vendor listing."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="List public vendors", responses={200: VendorPublicSerializer(many=True)})
    def get(self, request):
        config = EventConfig.get_active()
        
        if not config.vendors_published:
            return Response({
                'success': True,
                'data': [],
                'message': 'Vendor list coming soon'
            })
        
        vendors = VendorProfile.objects.filter(
            is_active=True,
            is_public=True
        ).order_by('category', 'business_name')
        
        return Response({
            'success': True,
            'data': VendorPublicSerializer(vendors, many=True).data
        })


class VendorProfileView(APIView):
    """Vendor profile management."""
    permission_classes = [IsVendorOrAdmin]
    
    @extend_schema(summary="Get vendor profile", responses={200: VendorProfileSerializer})
    def get(self, request):
        try:
            profile = VendorProfile.objects.select_related('user').prefetch_related(
                'booth_assignments__booth'
            ).get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Vendor profile not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'data': VendorProfileSerializer(profile).data
        })
    
    @extend_schema(summary="Update vendor profile", request=VendorProfileUpdateSerializer)
    def patch(self, request):
        try:
            profile = VendorProfile.objects.get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Vendor profile not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VendorProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Profile updated',
            'data': VendorProfileSerializer(profile).data
        })


class VendorDashboardView(APIView):
    """Vendor dashboard data."""
    permission_classes = [IsVendorOrAdmin]
    
    @extend_schema(summary="Get vendor dashboard")
    def get(self, request):
        try:
            profile = VendorProfile.objects.select_related('user').prefetch_related(
                'booth_assignments__booth'
            ).get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Vendor profile not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get vendor's tickets
        tickets = request.user.tickets.select_related('ticket_type').filter(
            status__in=['ISSUED', 'USED']
        )
        
        return Response({
            'success': True,
            'data': {
                'profile': VendorProfileSerializer(profile).data,
                'tickets_count': tickets.count(),
                'included_tickets': profile.included_tickets_count
            }
        })


class VendorSetupQRView(APIView):
    """Get vendor setup QR code."""
    permission_classes = [IsVendorOrAdmin]
    
    @extend_schema(summary="Get vendor setup QR")
    def get(self, request):
        try:
            profile = VendorProfile.objects.get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'Vendor profile not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        if profile.booth_status != VendorProfile.BoothStatus.ASSIGNED:
            return Response({
                'success': False,
                'error': {'message': 'No booth assigned yet'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        qr_data = VendorService.generate_setup_qr(profile)
        
        return Response({
            'success': True,
            'data': {
                'qr_data': qr_data,
                'business_name': profile.business_name
            }
        })


# Admin endpoints

class BoothListView(APIView):
    """Admin: List all booths."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="List booths", responses={200: BoothSerializer(many=True)})
    def get(self, request):
        booths = Booth.objects.all().order_by('area', 'zone', 'row', 'number')
        
        # Filters
        area = request.query_params.get('area')
        available_only = request.query_params.get('available_only', '').lower() == 'true'
        
        if area:
            booths = booths.filter(area__icontains=area)
        
        if available_only:
            booths = booths.filter(is_active=True).exclude(
                id__in=BoothAssignment.objects.values_list('booth_id', flat=True)
            )
        
        return Response({
            'success': True,
            'data': BoothSerializer(booths, many=True).data
        })


class BoothAssignView(APIView):
    """Admin: Assign booth to vendor."""
    permission_classes = [IsAdmin]
    
    @extend_schema(summary="Assign booth", request=BoothAssignSerializer)
    def post(self, request):
        serializer = BoothAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        vendor = get_object_or_404(VendorProfile, id=data['vendor_id'])
        booth = get_object_or_404(Booth, id=data['booth_id'])
        
        try:
            assignment = VendorService.assign_booth(
                vendor=vendor,
                booth=booth,
                assigned_by=request.user,
                notes=data.get('notes', '')
            )
            
            AuditService.log(
                actor=request.user,
                action_type='BOOTH_ASSIGN',
                target_type='VendorProfile',
                target_id=str(vendor.id),
                metadata={
                    'booth_code': booth.booth_code,
                    'booth_id': str(booth.id)
                },
                request=request
            )
            
            return Response({
                'success': True,
                'message': f'Booth {booth.booth_code} assigned to {vendor.business_name}',
                'data': BoothAssignmentSerializer(assignment).data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminVendorListView(APIView):
    """Admin: List all vendors."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="List all vendors", responses={200: AdminVendorSerializer(many=True)})
    def get(self, request):
        vendors = VendorProfile.objects.select_related('user').prefetch_related(
            'booth_assignments__booth'
        ).order_by('-created_at')
        
        # Filters
        status_filter = request.query_params.get('status')
        category = request.query_params.get('category')
        
        if status_filter:
            vendors = vendors.filter(booth_status=status_filter)
        if category:
            vendors = vendors.filter(category=category)
        
        return Response({
            'success': True,
            'data': AdminVendorSerializer(vendors, many=True).data
        })


class BazaarVendorRegistrationView(APIView):
    """Public: Submit bazaar vendor registration."""
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    @extend_schema(
        summary="Submit bazaar vendor registration",
        request=BazaarVendorRegistrationSerializer,
        responses={201: BazaarVendorRegistrationSerializer}
    )
    def post(self, request):
        serializer = BazaarVendorRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': {'message': 'Invalid data', 'details': serializer.errors}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        registration = serializer.save()
        
        logger.info(f"Bazaar vendor registration submitted: {registration.booth_name} ({registration.contact_email})")
        
        return Response({
            'success': True,
            'message': 'Registration submitted successfully',
            'data': BazaarVendorRegistrationSerializer(registration).data
        }, status=status.HTTP_201_CREATED)


class FoodVendorRegistrationView(APIView):
    """Public: Submit food vendor registration."""
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    @extend_schema(
        summary="Submit food vendor registration",
        request=FoodVendorRegistrationSerializer,
        responses={201: FoodVendorRegistrationSerializer}
    )
    def post(self, request):
        serializer = FoodVendorRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': {'message': 'Invalid data', 'details': serializer.errors}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        registration = serializer.save()
        
        logger.info(f"Food vendor registration submitted: {registration.booth_name} ({registration.contact_email})")
        
        return Response({
            'success': True,
            'message': 'Registration submitted successfully',
            'data': FoodVendorRegistrationSerializer(registration).data
        }, status=status.HTTP_201_CREATED)


class AdminBazaarRegistrationsView(APIView):
    """Admin: List all bazaar vendor registrations."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(
        summary="List bazaar vendor registrations",
        responses={200: BazaarVendorRegistrationSerializer(many=True)}
    )
    def get(self, request):
        from .models import BazaarVendorRegistration
        registrations = BazaarVendorRegistration.objects.all().order_by('-created_at')
        
        return Response({
            'success': True,
            'data': BazaarVendorRegistrationSerializer(registrations, many=True).data
        })


class AdminFoodRegistrationsView(APIView):
    """Admin: List all food vendor registrations."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(
        summary="List food vendor registrations",
        responses={200: FoodVendorRegistrationSerializer(many=True)}
    )
    def get(self, request):
        from .models import FoodVendorRegistration
        registrations = FoodVendorRegistration.objects.all().order_by('-created_at')
        
        return Response({
            'success': True,
            'data': FoodVendorRegistrationSerializer(registrations, many=True).data
        })
