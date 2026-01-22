"""
Scanning serializers.
"""
from rest_framework import serializers
from .models import TicketScanLog


class ScanValidateSerializer(serializers.Serializer):
    """Serializer for scan validation request."""
    qr_data = serializers.CharField()
    gate = serializers.CharField(required=False, allow_blank=True)
    device_id = serializers.CharField(required=False, allow_blank=True)


class ScanCommitSerializer(serializers.Serializer):
    """Serializer for committing a scan (marking ticket as used)."""
    ticket_code = serializers.CharField()
    gate = serializers.CharField(required=False, allow_blank=True)
    device_id = serializers.CharField(required=False, allow_blank=True)


class TicketScanLogSerializer(serializers.ModelSerializer):
    """Serializer for scan logs."""
    ticket_code = serializers.CharField(source='ticket.ticket_code', read_only=True)
    scanner_email = serializers.CharField(source='scanner.email', read_only=True)
    
    class Meta:
        model = TicketScanLog
        fields = [
            'id', 'ticket_code', 'scanner_email', 'result',
            'gate', 'device_id', 'scanned_at'
        ]


class ScanValidationResultSerializer(serializers.Serializer):
    """Serializer for scan validation result."""
    valid = serializers.BooleanField()
    ticket_code = serializers.CharField(allow_null=True)
    ticket_type = serializers.CharField(allow_null=True)
    owner_name = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    message = serializers.CharField()
    can_enter = serializers.BooleanField()
