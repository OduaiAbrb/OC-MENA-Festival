"""
Django admin interface for amphitheater ticketing.
"""
from django.contrib import admin
from .amphitheater_models import Venue, Section, SeatBlock, SeatHold, AmphitheaterTicket


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'address')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'venue', 'section_type', 'capacity', 'base_price_cents', 'display_order', 'is_active')
    list_filter = ('venue', 'section_type', 'is_active')
    search_fields = ('name',)
    ordering = ('venue', 'display_order', 'name')
    readonly_fields = ('id',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'venue', 'name', 'section_type', 'capacity')
        }),
        ('Pricing & Display', {
            'fields': ('base_price_cents', 'display_order', 'color')
        }),
        ('Map Configuration', {
            'fields': ('map_coordinates',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(SeatBlock)
class SeatBlockAdmin(admin.ModelAdmin):
    list_display = ('section', 'event_date', 'row_range', 'total_seats', 'available_seats', 'held_seats', 'sold_seats', 'price_cents', 'is_active')
    list_filter = ('event_date', 'section__venue', 'section', 'is_active')
    search_fields = ('section__name',)
    ordering = ('event_date', 'section', 'row_start')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Event & Section', {
            'fields': ('id', 'section', 'event_date')
        }),
        ('Seat Range', {
            'fields': ('row_start', 'row_end', 'seat_start', 'seat_end', 'total_seats')
        }),
        ('Availability', {
            'fields': ('available_seats', 'held_seats', 'sold_seats')
        }),
        ('Pricing', {
            'fields': ('price_cents',)
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    def row_range(self, obj):
        return f"{obj.row_start}-{obj.row_end}"
    row_range.short_description = 'Rows'


@admin.register(SeatHold)
class SeatHoldAdmin(admin.ModelAdmin):
    list_display = ('id', 'seat_block', 'user', 'quantity', 'expires_at', 'is_active', 'created_at')
    list_filter = ('is_active', 'expires_at', 'created_at')
    search_fields = ('user__email', 'session_key')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'allocated_seats')
    
    fieldsets = (
        ('Hold Info', {
            'fields': ('id', 'seat_block', 'user', 'session_key')
        }),
        ('Seats', {
            'fields': ('quantity', 'allocated_seats')
        }),
        ('Status', {
            'fields': ('expires_at', 'is_active', 'created_at')
        }),
    )


@admin.register(AmphitheaterTicket)
class AmphitheaterTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'event_name', 'event_date', 'section_name', 'seat_location_display', 'status', 'includes_festival_access')
    list_filter = ('event_date', 'status', 'includes_festival_access', 'seat_block__section')
    search_fields = ('festival_ticket__ticket_code', 'festival_ticket__owner__email', 'event_name')
    ordering = ('-event_date', 'seat_block__section', 'row', 'seat_number')
    readonly_fields = ('id', 'created_at', 'updated_at', 'seat_location')
    raw_id_fields = ('festival_ticket', 'seat_block', 'festival_day_ticket')
    
    fieldsets = (
        ('Ticket Info', {
            'fields': ('id', 'festival_ticket', 'event_name', 'event_date')
        }),
        ('Seat Assignment', {
            'fields': ('seat_block', 'row', 'seat_number', 'seat_location')
        }),
        ('Pricing', {
            'fields': ('price_paid_cents',)
        }),
        ('Festival Access', {
            'fields': ('includes_festival_access', 'festival_day_ticket')
        }),
        ('Status', {
            'fields': ('status', 'metadata', 'created_at', 'updated_at')
        }),
    )
    
    def ticket_code(self, obj):
        return obj.festival_ticket.ticket_code
    ticket_code.short_description = 'Ticket Code'
    
    def section_name(self, obj):
        return obj.seat_block.section.name
    section_name.short_description = 'Section'
    
    def seat_location_display(self, obj):
        return f"Row {obj.row}, Seat {obj.seat_number}"
    seat_location_display.short_description = 'Seat'
