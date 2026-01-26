"""
Serializers for amphitheater ticketing API.
"""
from rest_framework import serializers
from .amphitheater_models import Venue, Section, SeatBlock, SeatHold, AmphitheaterTicket


class VenueSerializer(serializers.ModelSerializer):
    """Serializer for venue information."""
    
    class Meta:
        model = Venue
        fields = ['id', 'name', 'address', 'capacity', 'is_active']


class SectionSerializer(serializers.ModelSerializer):
    """Serializer for section information with availability."""
    available = serializers.IntegerField(read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Section
        fields = [
            'id', 'name', 'section_type', 'capacity', 'available',
            'price', 'color', 'map_coordinates', 'display_order'
        ]


class SeatBlockSerializer(serializers.ModelSerializer):
    """Serializer for seat block information."""
    section_name = serializers.CharField(source='section.name', read_only=True)
    price = serializers.SerializerMethodField()
    
    class Meta:
        model = SeatBlock
        fields = [
            'id', 'section_name', 'event_date', 'row_start', 'row_end',
            'seat_start', 'seat_end', 'total_seats', 'available_seats',
            'price', 'is_active'
        ]
    
    def get_price(self, obj):
        return obj.price_cents / 100


class CheckAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking seat availability."""
    section_id = serializers.UUIDField()
    event_date = serializers.DateField()
    quantity = serializers.IntegerField(min_value=1, max_value=20)


class CreateSeatHoldSerializer(serializers.Serializer):
    """Serializer for creating a seat hold."""
    section_id = serializers.UUIDField()
    event_date = serializers.DateField()
    quantity = serializers.IntegerField(min_value=1, max_value=20)
    session_key = serializers.CharField(required=False, allow_blank=True)


class SeatHoldSerializer(serializers.ModelSerializer):
    """Serializer for seat hold information."""
    section_name = serializers.CharField(source='seat_block.section.name', read_only=True)
    price_per_ticket = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    event_date = serializers.DateField(source='seat_block.event_date', read_only=True)
    
    class Meta:
        model = SeatHold
        fields = [
            'id', 'section_name', 'quantity', 'allocated_seats',
            'price_per_ticket', 'total_price', 'event_date',
            'expires_at', 'is_active'
        ]
    
    def get_price_per_ticket(self, obj):
        return obj.seat_block.price_cents / 100
    
    def get_total_price(self, obj):
        return (obj.seat_block.price_cents * obj.quantity) / 100


class AmphitheaterTicketSerializer(serializers.ModelSerializer):
    """Serializer for amphitheater tickets."""
    ticket_code = serializers.CharField(source='festival_ticket.ticket_code', read_only=True)
    section_name = serializers.CharField(source='seat_block.section.name', read_only=True)
    price_paid = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()
    festival_day_ticket_code = serializers.CharField(
        source='festival_day_ticket.ticket_code',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = AmphitheaterTicket
        fields = [
            'id', 'ticket_code', 'event_name', 'event_date',
            'section_name', 'row', 'seat_number', 'seat_location',
            'price_paid', 'status', 'qr_code', 'includes_festival_access',
            'festival_day_ticket_code', 'metadata'
        ]
    
    def get_price_paid(self, obj):
        return obj.price_paid_cents / 100
    
    def get_qr_code(self, obj):
        # Return QR code from festival ticket
        if hasattr(obj.festival_ticket, 'qr_code'):
            return obj.festival_ticket.qr_code
        return None


class AmphitheaterCheckoutSerializer(serializers.Serializer):
    """Serializer for amphitheater checkout."""
    hold_id = serializers.UUIDField()
    billing_details = serializers.DictField(required=False)
    payment_method = serializers.CharField(default='stripe')
