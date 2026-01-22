"""
Wallet serializers.
"""
from rest_framework import serializers
from .models import PassRecord


class PassRecordSerializer(serializers.ModelSerializer):
    """Serializer for wallet passes."""
    ticket_code = serializers.CharField(source='ticket.ticket_code', read_only=True)
    ticket_type = serializers.CharField(source='ticket.ticket_type.name', read_only=True)
    
    class Meta:
        model = PassRecord
        fields = [
            'id', 'ticket_code', 'ticket_type', 'pass_type',
            'status', 'pass_url', 'created_at', 'installed_at'
        ]


class CreatePassSerializer(serializers.Serializer):
    """Serializer for creating a wallet pass."""
    ticket_id = serializers.UUIDField()
