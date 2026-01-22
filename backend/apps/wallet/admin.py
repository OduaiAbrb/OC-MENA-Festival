from django.contrib import admin
from .models import PassRecord


@admin.register(PassRecord)
class PassRecordAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'pass_type', 'status', 'created_at', 'installed_at')
    list_filter = ('pass_type', 'status', 'created_at')
    search_fields = ('ticket__ticket_code', 'user__email', 'pass_serial_number')
    readonly_fields = ('id', 'pass_serial_number', 'authentication_token', 'created_at', 'updated_at')
    raw_id_fields = ('user', 'ticket')
