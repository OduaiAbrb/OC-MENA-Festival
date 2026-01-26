"""
Ticket serializers.
"""
from rest_framework import serializers
from .models import TicketType, Order, OrderItem, Ticket, TicketTransfer, TicketUpgrade, Refund, Comp


class TicketTypeSerializer(serializers.ModelSerializer):
    """Serializer for ticket types."""
    price = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)
    remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketType
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'price_cents',
            'currency', 'valid_days', 'capacity', 'is_available', 'remaining',
            'sale_start', 'sale_end', 'badge_text', 'features', 'display_order'
        ]
    
    def get_price(self, obj):
        return obj.price_dollars
    
    def get_remaining(self, obj):
        return obj.remaining_capacity


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)
    unit_price = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'ticket_type', 'ticket_type_name', 'quantity', 'unit_price_cents', 'unit_price', 'total_cents', 'total']
    
    def get_unit_price(self, obj):
        return obj.unit_price_cents / 100
    
    def get_total(self, obj):
        return obj.total_cents / 100


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    items = OrderItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    fees = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'buyer_email', 'status', 'items',
            'subtotal_cents', 'subtotal', 'fees_cents', 'fees',
            'tax_cents', 'total_cents', 'total', 'currency',
            'created_at', 'paid_at'
        ]
    
    def get_subtotal(self, obj):
        return obj.subtotal_cents / 100
    
    def get_fees(self, obj):
        return obj.fees_cents / 100
    
    def get_total(self, obj):
        return obj.total_cents / 100


class TicketSerializer(serializers.ModelSerializer):
    """Serializer for tickets."""
    ticket_type_name = serializers.SerializerMethodField()
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    valid_days = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()
    metadata = serializers.JSONField(read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_code', 'owner_email', 'owner_name',
            'ticket_type', 'ticket_type_name', 'valid_days',
            'status', 'is_comp', 'issued_at', 'used_at', 'qr_code', 'metadata'
        ]
    
    def get_ticket_type_name(self, obj):
        """Get ticket type name, handling amphitheater tickets without ticket_type."""
        if obj.ticket_type:
            return obj.ticket_type.name
        # For amphitheater tickets, get name from metadata
        if obj.metadata and obj.metadata.get('type') == 'amphitheater':
            return obj.metadata.get('ticket_name', 'Amphitheater Ticket')
        return 'Special Ticket'
    
    def get_valid_days(self, obj):
        """Get valid days, handling tickets without ticket_type."""
        if obj.ticket_type:
            return obj.ticket_type.valid_days
        return None
    
    def get_qr_code(self, obj):
        """Generate QR code data URL for the ticket with scannable validation URL."""
        import base64
        from io import BytesIO
        from django.conf import settings
        
        try:
            import qrcode
            
            # QR code contains URL that opens validation page when scanned
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://oc-mena-festival.pages.dev')
            validation_url = f"{frontend_url}/scan?code={obj.ticket_code}"
            
            # Generate QR code with validation URL
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(validation_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64 data URL
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
        except ImportError:
            # qrcode library not available - use Google Charts API as fallback
            import urllib.parse
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://oc-mena-festival.pages.dev')
            validation_url = f"{frontend_url}/scan?code={obj.ticket_code}"
            encoded_url = urllib.parse.quote(validation_url)
            return f"https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl={encoded_url}"
        except Exception as e:
            # Last resort - use Google Charts API
            import urllib.parse
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error generating QR code for ticket {obj.ticket_code}: {e}")
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://oc-mena-festival.pages.dev')
            validation_url = f"{frontend_url}/scan?code={obj.ticket_code}"
            encoded_url = urllib.parse.quote(validation_url)
            return f"https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl={encoded_url}"


class TicketDetailSerializer(TicketSerializer):
    """Detailed ticket serializer with order info."""
    order = OrderSerializer(read_only=True)
    
    class Meta(TicketSerializer.Meta):
        fields = TicketSerializer.Meta.fields + ['order']


class TicketTransferSerializer(serializers.ModelSerializer):
    """Serializer for ticket transfers."""
    ticket_code = serializers.CharField(source='ticket.ticket_code', read_only=True)
    ticket_type = serializers.CharField(source='ticket.ticket_type.name', read_only=True)
    from_user_email = serializers.CharField(source='from_user.email', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TicketTransfer
        fields = [
            'id', 'ticket_code', 'ticket_type', 'from_user_email',
            'to_email', 'status', 'expires_at', 'is_expired',
            'created_at', 'accepted_at'
        ]


class TransferCreateSerializer(serializers.Serializer):
    """Serializer for creating a transfer."""
    ticket_id = serializers.UUIDField()
    to_email = serializers.EmailField()
    
    def validate_to_email(self, value):
        return value.lower()


class TransferAcceptSerializer(serializers.Serializer):
    """Serializer for accepting a transfer."""
    token = serializers.CharField()


class TicketUpgradeSerializer(serializers.ModelSerializer):
    """Serializer for ticket upgrades."""
    ticket_code = serializers.CharField(source='ticket.ticket_code', read_only=True)
    from_type_name = serializers.CharField(source='from_type.name', read_only=True)
    to_type_name = serializers.CharField(source='to_type.name', read_only=True)
    diff = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketUpgrade
        fields = [
            'id', 'ticket_code', 'from_type', 'from_type_name',
            'to_type', 'to_type_name', 'diff_cents', 'diff',
            'status', 'created_at', 'completed_at'
        ]
    
    def get_diff(self, obj):
        return obj.diff_cents / 100


class UpgradeCreateSerializer(serializers.Serializer):
    """Serializer for creating an upgrade."""
    ticket_id = serializers.UUIDField()
    to_type_id = serializers.UUIDField()


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for refunds."""
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    initiated_by_email = serializers.CharField(source='initiated_by.email', read_only=True)
    amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Refund
        fields = [
            'id', 'order_number', 'amount_cents', 'amount',
            'status', 'reason', 'notes', 'initiated_by_email',
            'created_at', 'processed_at'
        ]
    
    def get_amount(self, obj):
        return obj.amount_cents / 100


class StaffRefundSerializer(serializers.Serializer):
    """Serializer for staff-initiated refund."""
    order_id = serializers.UUIDField()
    amount_cents = serializers.IntegerField(required=False)
    reason = serializers.ChoiceField(choices=Refund.Reason.choices)
    notes = serializers.CharField(required=False, allow_blank=True)


class CompSerializer(serializers.ModelSerializer):
    """Serializer for comps."""
    issued_by_email = serializers.CharField(source='issued_by.email', read_only=True)
    to_user_email = serializers.CharField(source='to_user.email', read_only=True)
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)
    
    class Meta:
        model = Comp
        fields = [
            'id', 'issued_by_email', 'to_user_email',
            'ticket_type', 'ticket_type_name', 'quantity',
            'reason', 'notes', 'created_at'
        ]


class StaffCompSerializer(serializers.Serializer):
    """Serializer for staff-initiated comp."""
    user_email = serializers.EmailField()
    ticket_type_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=10, default=1)
    reason = serializers.ChoiceField(choices=Comp.Reason.choices)
    notes = serializers.CharField(required=False, allow_blank=True)


class StaffUpgradeSerializer(serializers.Serializer):
    """Serializer for staff-initiated upgrade (comp upgrade)."""
    ticket_id = serializers.UUIDField()
    to_type_id = serializers.UUIDField()
    is_comped = serializers.BooleanField(default=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class ResendTicketsSerializer(serializers.Serializer):
    """Serializer for resending tickets."""
    order_id = serializers.UUIDField(required=False)
    ticket_id = serializers.UUIDField(required=False)
    
    def validate(self, data):
        if not data.get('order_id') and not data.get('ticket_id'):
            raise serializers.ValidationError("Either order_id or ticket_id is required")
        return data


class ResendInvoiceSerializer(serializers.Serializer):
    """Serializer for resending invoice."""
    order_id = serializers.UUIDField()
