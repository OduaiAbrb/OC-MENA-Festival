from django.contrib import admin
from .models import EventConfig, Sponsor, ScheduleItem, ContactSubmission


@admin.register(EventConfig)
class EventConfigAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'is_active', 'ticket_sales_enabled', 'coming_soon_mode', 'updated_at')
    fieldsets = (
        ('Event Info', {'fields': ('event_name', 'event_tagline', 'event_start_date', 'event_end_date', 'event_location', 'event_address')}),
        ('Feature Flags', {'fields': ('ticket_sales_enabled', 'transfer_enabled', 'upgrade_enabled', 'refunds_enabled', 'scanning_enabled', 'schedule_published', 'vendors_published', 'sponsors_published', 'apple_wallet_enabled', 'google_wallet_enabled', 'amphitheater_visible')}),
        ('Coming Soon', {'fields': ('coming_soon_mode', 'coming_soon_message')}),
        ('Status', {'fields': ('is_active',)}),
    )


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ('name', 'tier', 'display_order', 'is_active')
    list_filter = ('tier', 'is_active')
    search_fields = ('name',)
    ordering = ('tier', 'display_order')


@admin.register(ScheduleItem)
class ScheduleItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'day', 'start_time', 'location', 'is_featured', 'is_active')
    list_filter = ('category', 'day', 'is_featured', 'is_active')
    search_fields = ('title', 'performer_name', 'location')
    ordering = ('day', 'start_time')


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'subject', 'is_read', 'is_responded', 'created_at')
    list_filter = ('subject', 'is_read', 'is_responded', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'message')
    readonly_fields = ('first_name', 'last_name', 'email', 'phone', 'subject', 'message', 'created_at')
    ordering = ('-created_at',)
