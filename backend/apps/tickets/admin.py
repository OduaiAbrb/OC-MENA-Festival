from django.contrib import admin
from .models import TicketType, Order, OrderItem, Ticket, TicketTransfer, TicketUpgrade, Refund, Comp, Invoice

# Import amphitheater admin
from .amphitheater_admin import *


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_dollars', 'capacity', 'sold_count', 'is_available', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'buyer', 'status', 'total_dollars', 'created_at', 'paid_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'buyer__email', 'stripe_payment_intent_id')
    readonly_fields = ('id', 'order_number', 'idempotency_key', 'stripe_payment_intent_id', 'created_at', 'updated_at')
    raw_id_fields = ('buyer',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('ticket_type', 'quantity', 'unit_price_cents', 'total_cents')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'owner', 'ticket_type', 'status', 'is_comp', 'issued_at')
    list_filter = ('status', 'is_comp', 'ticket_type', 'issued_at')
    search_fields = ('ticket_code', 'owner__email')
    readonly_fields = ('id', 'ticket_code', 'qr_secret_version', 'qr_payload_hash', 'issued_at')
    raw_id_fields = ('owner', 'order', 'comp')


@admin.register(TicketTransfer)
class TicketTransferAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'from_user', 'to_email', 'status', 'expires_at', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('ticket__ticket_code', 'from_user__email', 'to_email')
    readonly_fields = ('id', 'token_hash', 'created_at')
    raw_id_fields = ('ticket', 'from_user', 'to_user')


@admin.register(TicketUpgrade)
class TicketUpgradeAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'from_type', 'to_type', 'diff_cents', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('ticket__ticket_code',)
    readonly_fields = ('id', 'stripe_payment_intent_id', 'created_at')
    raw_id_fields = ('ticket', 'from_type', 'to_type', 'comped_by')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount_cents', 'status', 'reason', 'initiated_by', 'created_at')
    list_filter = ('status', 'reason', 'created_at')
    search_fields = ('order__order_number', 'stripe_refund_id')
    readonly_fields = ('id', 'stripe_refund_id', 'created_at', 'processed_at')
    raw_id_fields = ('order', 'initiated_by')


@admin.register(Comp)
class CompAdmin(admin.ModelAdmin):
    list_display = ('to_user', 'ticket_type', 'quantity', 'reason', 'issued_by', 'created_at')
    list_filter = ('reason', 'ticket_type', 'created_at')
    search_fields = ('to_user__email', 'issued_by__email')
    readonly_fields = ('id', 'created_at')
    raw_id_fields = ('issued_by', 'to_user', 'ticket_type')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'order', 'generated_at')
    search_fields = ('invoice_number', 'order__order_number')
    readonly_fields = ('id', 'invoice_number', 'generated_at')
    raw_id_fields = ('order',)
