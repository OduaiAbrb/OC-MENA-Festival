"""
Payment serializers.
"""
from rest_framework import serializers


class CheckoutItemSerializer(serializers.Serializer):
    """Serializer for checkout items."""
    ticket_type_id = serializers.UUIDField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, max_value=10)
    type = serializers.CharField(required=False, allow_blank=True)
    section = serializers.CharField(required=False, allow_blank=True)
    price = serializers.IntegerField(required=False, allow_null=True)
    metadata = serializers.DictField(required=False, allow_null=True)


class CreatePaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating a payment intent."""
    items = CheckoutItemSerializer(many=True, min_length=1)
    idempotency_key = serializers.CharField(max_length=100)


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer for confirming payment."""
    payment_intent_id = serializers.CharField()
    order_id = serializers.UUIDField()


class GuestCheckoutSerializer(serializers.Serializer):
    """Serializer for guest checkout (no forced registration)."""
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    items = CheckoutItemSerializer(many=True, min_length=1)
    idempotency_key = serializers.CharField(max_length=100)
