from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TicketScanLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('result', models.CharField(choices=[('SUCCESS', 'Success'), ('ALREADY_USED', 'Already Used'), ('INVALID', 'Invalid QR'), ('REFUNDED', 'Ticket Refunded'), ('CANCELLED', 'Ticket Cancelled'), ('WRONG_DAY', 'Wrong Day'), ('TRANSFER_PENDING', 'Transfer Pending'), ('NOT_FOUND', 'Ticket Not Found'), ('SIGNATURE_INVALID', 'Invalid Signature')], db_index=True, max_length=30)),
                ('gate', models.CharField(blank=True, max_length=50)),
                ('device_id', models.CharField(blank=True, max_length=100)),
                ('raw_qr_data', models.TextField(blank=True)),
                ('error_message', models.TextField(blank=True)),
                ('scanned_at', models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
                ('scanner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='scans_performed', to=settings.AUTH_USER_MODEL)),
                ('ticket', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='scan_logs', to='tickets.ticket')),
            ],
            options={
                'db_table': 'ticket_scan_logs',
                'ordering': ['-scanned_at'],
            },
        ),
        migrations.CreateModel(
            name='ScanSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('gate', models.CharField(blank=True, max_length=50)),
                ('device_id', models.CharField(max_length=100)),
                ('started_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('total_scans', models.PositiveIntegerField(default=0)),
                ('successful_scans', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('scanner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scan_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'scan_sessions',
            },
        ),
    ]
