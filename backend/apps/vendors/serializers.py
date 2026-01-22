"""
Vendor serializers.
"""
from rest_framework import serializers
from .models import VendorProfile, Booth, BoothAssignment


class VendorPublicSerializer(serializers.ModelSerializer):
    """Serializer for public vendor listing."""
    
    class Meta:
        model = VendorProfile
        fields = ['id', 'business_name', 'business_description', 'category', 'website_url']


class VendorProfileSerializer(serializers.ModelSerializer):
    """Serializer for vendor profile."""
    user_email = serializers.CharField(source='user.email', read_only=True)
    booth_assignment = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorProfile
        fields = [
            'id', 'user_email', 'business_name', 'business_description',
            'category', 'website_url', 'contact_name', 'contact_phone',
            'contact_email', 'booth_status', 'included_tickets_count',
            'is_active', 'is_public', 'created_at', 'booth_assignment'
        ]
        read_only_fields = ['id', 'user_email', 'booth_status', 'created_at']
    
    def get_booth_assignment(self, obj):
        assignment = obj.booth_assignments.select_related('booth').first()
        if assignment:
            return BoothAssignmentSerializer(assignment).data
        return None


class VendorProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendor profile."""
    
    class Meta:
        model = VendorProfile
        fields = [
            'business_name', 'business_description', 'category',
            'website_url', 'contact_name', 'contact_phone', 'contact_email'
        ]


class BoothSerializer(serializers.ModelSerializer):
    """Serializer for booths."""
    full_location = serializers.CharField(read_only=True)
    is_assigned = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    
    class Meta:
        model = Booth
        fields = [
            'id', 'booth_code', 'area', 'zone', 'row', 'number',
            'full_location', 'size', 'price_cents', 'price',
            'has_electricity', 'has_water', 'is_active', 'is_assigned'
        ]
    
    def get_is_assigned(self, obj):
        return hasattr(obj, 'assignment')
    
    def get_price(self, obj):
        return obj.price_cents / 100


class BoothAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for booth assignments."""
    booth = BoothSerializer(read_only=True)
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    assigned_by_email = serializers.CharField(source='assigned_by.email', read_only=True)
    
    class Meta:
        model = BoothAssignment
        fields = [
            'id', 'booth', 'vendor_name', 'is_paid',
            'amount_paid_cents', 'assigned_by_email', 'assigned_at', 'notes'
        ]


class BoothAssignSerializer(serializers.Serializer):
    """Serializer for assigning a booth."""
    vendor_id = serializers.UUIDField()
    booth_id = serializers.UUIDField()
    notes = serializers.CharField(required=False, allow_blank=True)


class AdminVendorSerializer(serializers.ModelSerializer):
    """Admin serializer for vendors with all details."""
    user_email = serializers.CharField(source='user.email', read_only=True)
    booth_assignments = BoothAssignmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = VendorProfile
        fields = [
            'id', 'user_email', 'business_name', 'business_description',
            'category', 'website_url', 'contact_name', 'contact_phone',
            'contact_email', 'booth_status', 'included_tickets_count',
            'internal_notes', 'is_active', 'is_public', 'created_at',
            'updated_at', 'booth_assignments'
        ]
