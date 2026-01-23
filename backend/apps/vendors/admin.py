from django.contrib import admin
from .models import VendorProfile, Booth, BoothAssignment, VendorSetupLog, BazaarVendorRegistration, FoodVendorRegistration


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'category', 'booth_status', 'is_active', 'is_public')
    list_filter = ('category', 'booth_status', 'is_active', 'is_public')
    search_fields = ('business_name', 'user__email', 'contact_email')
    readonly_fields = ('id', 'setup_qr_id', 'setup_qr_secret', 'created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(Booth)
class BoothAdmin(admin.ModelAdmin):
    list_display = ('booth_code', 'area', 'zone', 'size', 'price_cents', 'has_electricity', 'has_water', 'is_active')
    list_filter = ('area', 'size', 'is_active', 'has_electricity', 'has_water')
    search_fields = ('booth_code', 'area')


@admin.register(BoothAssignment)
class BoothAssignmentAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'booth', 'is_paid', 'assigned_by', 'assigned_at')
    list_filter = ('is_paid', 'assigned_at')
    search_fields = ('vendor__business_name', 'booth__booth_code')
    readonly_fields = ('id', 'assigned_at')
    raw_id_fields = ('vendor', 'booth', 'assigned_by', 'payment_order')


@admin.register(VendorSetupLog)
class VendorSetupLogAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'checked_in_by', 'checked_in_at')
    list_filter = ('checked_in_at',)
    search_fields = ('vendor__business_name',)
    readonly_fields = ('id', 'checked_in_at')
    raw_id_fields = ('vendor', 'checked_in_by')


@admin.register(BazaarVendorRegistration)
class BazaarVendorRegistrationAdmin(admin.ModelAdmin):
    list_display = ('booth_name', 'legal_business_name', 'contact_email', 'phone_number', 'business_type', 'created_at', 'processed')
    list_filter = ('business_type', 'processed', 'created_at')
    search_fields = ('booth_name', 'legal_business_name', 'contact_email', 'phone_number')
    readonly_fields = ('id', 'created_at')
    list_editable = ('processed',)


@admin.register(FoodVendorRegistration)
class FoodVendorRegistrationAdmin(admin.ModelAdmin):
    list_display = ('booth_name', 'legal_business_name', 'contact_email', 'phone_number', 'business_type', 'has_health_permit', 'created_at', 'processed')
    list_filter = ('business_type', 'has_health_permit', 'processed', 'created_at')
    search_fields = ('booth_name', 'legal_business_name', 'contact_email', 'phone_number')
    readonly_fields = ('id', 'created_at')
    list_editable = ('processed',)
