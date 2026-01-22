"""
Scanning views for ticket entry.
"""
import logging
from django.db.models import Count
from django.db.models.functions import TruncHour
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from apps.accounts.permissions import IsStaffOrAdmin
from apps.config.models import EventConfig
from .models import TicketScanLog
from .serializers import (
    ScanValidateSerializer, ScanCommitSerializer,
    TicketScanLogSerializer, ScanValidationResultSerializer
)
from .services import ScanService

logger = logging.getLogger(__name__)


class QuickScanView(APIView):
    """Quick scan endpoint for anyone to check ticket status (no auth required)."""
    permission_classes = []
    authentication_classes = []
    
    @extend_schema(
        summary="Quick scan ticket QR code",
        request=ScanValidateSerializer,
        responses={200: ScanValidationResultSerializer}
    )
    def post(self, request):
        serializer = ScanValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        is_valid, result = ScanService.validate_qr(
            serializer.validated_data['qr_data']
        )
        
        return Response({
            'success': True,
            'data': result
        })


class ScanValidateView(APIView):
    """Validate a ticket QR code without marking as used."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(
        summary="Validate ticket QR",
        request=ScanValidateSerializer,
        responses={200: ScanValidationResultSerializer}
    )
    def post(self, request):
        config = EventConfig.get_active()
        if not config.scanning_enabled:
            return Response({
                'success': False,
                'error': {'message': 'Scanning is not currently enabled'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ScanValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        is_valid, result = ScanService.validate_qr(
            serializer.validated_data['qr_data']
        )
        
        return Response({
            'success': True,
            'data': result
        })


class ScanCommitView(APIView):
    """Commit a scan and mark ticket as used."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(
        summary="Commit scan (mark ticket used)",
        request=ScanCommitSerializer
    )
    def post(self, request):
        config = EventConfig.get_active()
        if not config.scanning_enabled:
            return Response({
                'success': False,
                'error': {'message': 'Scanning is not currently enabled'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ScanCommitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        success, result = ScanService.commit_scan(
            ticket_code=data['ticket_code'],
            scanner_user=request.user,
            gate=data.get('gate', ''),
            device_id=data.get('device_id', '')
        )
        
        if success:
            return Response({
                'success': True,
                'data': result
            })
        else:
            return Response({
                'success': False,
                'data': result
            }, status=status.HTTP_400_BAD_REQUEST)


class ScanLogListView(APIView):
    """List scan logs for staff."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(
        summary="List scan logs",
        responses={200: TicketScanLogSerializer(many=True)}
    )
    def get(self, request):
        logs = TicketScanLog.objects.select_related(
            'ticket', 'scanner'
        ).order_by('-scanned_at')
        
        # Filters
        result_filter = request.query_params.get('result')
        gate = request.query_params.get('gate')
        
        if result_filter:
            logs = logs.filter(result=result_filter)
        if gate:
            logs = logs.filter(gate=gate)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 50))
        start = (page - 1) * per_page
        end = start + per_page
        
        total = logs.count()
        logs = logs[start:end]
        
        return Response({
            'success': True,
            'data': TicketScanLogSerializer(logs, many=True).data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total
            }
        })


class ScanStatsView(APIView):
    """Get scanning statistics for dashboard."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Get scan statistics")
    def get(self, request):
        today = timezone.now().date()
        
        # Today's stats
        today_logs = TicketScanLog.objects.filter(
            scanned_at__date=today
        )
        
        total_scans = today_logs.count()
        successful_scans = today_logs.filter(result='SUCCESS').count()
        failed_scans = total_scans - successful_scans
        
        # By result type
        by_result = today_logs.values('result').annotate(
            count=Count('id')
        ).order_by('result')
        
        # By gate
        by_gate = today_logs.filter(gate__isnull=False).exclude(gate='').values('gate').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Hourly breakdown
        by_hour = today_logs.annotate(
            hour=TruncHour('scanned_at')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        return Response({
            'success': True,
            'data': {
                'date': today.isoformat(),
                'total_scans': total_scans,
                'successful_scans': successful_scans,
                'failed_scans': failed_scans,
                'success_rate': round(successful_scans / total_scans * 100, 1) if total_scans > 0 else 0,
                'by_result': list(by_result),
                'by_gate': list(by_gate),
                'by_hour': [
                    {'hour': item['hour'].strftime('%H:00'), 'count': item['count']}
                    for item in by_hour
                ]
            }
        })
