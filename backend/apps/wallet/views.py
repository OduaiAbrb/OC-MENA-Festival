"""
Wallet views for Apple Wallet and Google Wallet integration.
"""
import logging
import secrets
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.config.models import EventConfig
from apps.tickets.models import Ticket
from .models import PassRecord
from .serializers import PassRecordSerializer, CreatePassSerializer

logger = logging.getLogger(__name__)


class AppleWalletCreatePassView(APIView):
    """Create Apple Wallet pass for a ticket."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Create Apple Wallet pass", request=CreatePassSerializer)
    def post(self, request):
        config = EventConfig.get_active()
        
        if not config.apple_wallet_enabled:
            return Response({
                'success': False,
                'error': {
                    'message': 'Apple Wallet is not enabled yet. Please use your QR code for entry.',
                    'code': 'WALLET_NOT_ENABLED'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CreatePassSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ticket = get_object_or_404(
            Ticket,
            id=serializer.validated_data['ticket_id'],
            owner=request.user
        )
        
        if ticket.status != Ticket.Status.ISSUED:
            return Response({
                'success': False,
                'error': {'message': 'Ticket is not valid for wallet pass'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing pass
        existing = PassRecord.objects.filter(
            ticket=ticket,
            pass_type=PassRecord.PassType.APPLE
        ).first()
        
        if existing and existing.status in [PassRecord.Status.CREATED, PassRecord.Status.INSTALLED]:
            return Response({
                'success': True,
                'data': PassRecordSerializer(existing).data,
                'message': 'Pass already exists'
            })
        
        # Create pass record (actual pass generation would happen here or via Celery)
        pass_record = PassRecord.objects.create(
            user=request.user,
            ticket=ticket,
            pass_type=PassRecord.PassType.APPLE,
            status=PassRecord.Status.PENDING,
            pass_serial_number=f"OCMENA-{secrets.token_hex(8).upper()}"
        )
        
        # TODO: Generate actual Apple Wallet pass file via Celery task
        # This would involve:
        # 1. Creating the pass.json with ticket details
        # 2. Adding images (icon, logo, strip)
        # 3. Signing with Apple certificates
        # 4. Creating .pkpass file
        # 5. Uploading to storage
        # 6. Updating pass_url
        
        # For now, just mark as pending
        logger.info(f"Apple Wallet pass created for ticket {ticket.ticket_code}")
        
        return Response({
            'success': True,
            'data': PassRecordSerializer(pass_record).data,
            'message': 'Pass is being generated. Check back shortly.'
        }, status=status.HTTP_201_CREATED)


class GoogleWalletCreatePassView(APIView):
    """Create Google Wallet pass for a ticket."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Create Google Wallet pass", request=CreatePassSerializer)
    def post(self, request):
        config = EventConfig.get_active()
        
        if not config.google_wallet_enabled:
            return Response({
                'success': False,
                'error': {
                    'message': 'Google Wallet is not enabled yet. Please use your QR code for entry.',
                    'code': 'WALLET_NOT_ENABLED'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CreatePassSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ticket = get_object_or_404(
            Ticket,
            id=serializer.validated_data['ticket_id'],
            owner=request.user
        )
        
        if ticket.status != Ticket.Status.ISSUED:
            return Response({
                'success': False,
                'error': {'message': 'Ticket is not valid for wallet pass'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing pass
        existing = PassRecord.objects.filter(
            ticket=ticket,
            pass_type=PassRecord.PassType.GOOGLE
        ).first()
        
        if existing and existing.status in [PassRecord.Status.CREATED, PassRecord.Status.INSTALLED]:
            return Response({
                'success': True,
                'data': PassRecordSerializer(existing).data,
                'message': 'Pass already exists'
            })
        
        # Create pass record
        pass_record = PassRecord.objects.create(
            user=request.user,
            ticket=ticket,
            pass_type=PassRecord.PassType.GOOGLE,
            status=PassRecord.Status.PENDING,
            pass_serial_number=f"OCMENA-G-{secrets.token_hex(8).upper()}"
        )
        
        # TODO: Generate Google Wallet pass via Google Wallet API
        # This would involve:
        # 1. Creating pass class (if not exists)
        # 2. Creating pass object with ticket details
        # 3. Generating save link
        
        logger.info(f"Google Wallet pass created for ticket {ticket.ticket_code}")
        
        return Response({
            'success': True,
            'data': PassRecordSerializer(pass_record).data,
            'message': 'Pass is being generated. Check back shortly.'
        }, status=status.HTTP_201_CREATED)


class PassListView(APIView):
    """List user's wallet passes."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="List my wallet passes", responses={200: PassRecordSerializer(many=True)})
    def get(self, request):
        passes = PassRecord.objects.filter(
            user=request.user
        ).select_related('ticket', 'ticket__ticket_type').order_by('-created_at')
        
        return Response({
            'success': True,
            'data': PassRecordSerializer(passes, many=True).data
        })
