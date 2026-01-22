from django.contrib import admin
from .models import StripeEvent, PaymentAttempt


@admin.register(StripeEvent)
class StripeEventAdmin(admin.ModelAdmin):
    list_display = ('stripe_event_id', 'event_type', 'processed', 'received_at', 'processed_at')
    list_filter = ('event_type', 'processed', 'received_at')
    search_fields = ('stripe_event_id',)
    readonly_fields = ('id', 'stripe_event_id', 'event_type', 'processed', 'processing_error', 'payload', 'received_at', 'processed_at')
    
    def has_add_permission(self, request):
        return False


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ('order', 'stripe_payment_intent_id', 'amount_cents', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__order_number', 'stripe_payment_intent_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('order',)
