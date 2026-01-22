from django.contrib import admin
from .models import TicketScanLog, ScanSession


@admin.register(TicketScanLog)
class TicketScanLogAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'result', 'scanner', 'gate', 'scanned_at')
    list_filter = ('result', 'gate', 'scanned_at')
    search_fields = ('ticket__ticket_code', 'scanner__email')
    readonly_fields = ('id', 'ticket', 'scanner', 'result', 'gate', 'device_id', 'raw_qr_data', 'error_message', 'scanned_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ScanSession)
class ScanSessionAdmin(admin.ModelAdmin):
    list_display = ('scanner', 'gate', 'device_id', 'total_scans', 'successful_scans', 'is_active', 'started_at')
    list_filter = ('is_active', 'gate', 'started_at')
    search_fields = ('scanner__email', 'device_id')
    readonly_fields = ('id', 'started_at')
