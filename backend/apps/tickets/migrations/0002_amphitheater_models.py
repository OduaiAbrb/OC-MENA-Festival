"""
Migration to add amphitheater ticketing models.
"""
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Venue',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(default='Pacific Amphitheatre', max_length=255)),
                ('address', models.TextField()),
                ('capacity', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Amphitheater Venue',
                'verbose_name_plural': 'Amphitheater Venues',
                'db_table': 'amphitheater_venues',
            },
        ),
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('section_type', models.CharField(choices=[('ORCHESTRA', 'Orchestra'), ('MEZZANINE', 'Mezzanine'), ('TERRACE', 'Terrace'), ('LAWN', 'Lawn'), ('VIP', 'VIP')], max_length=20)),
                ('capacity', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('base_price_cents', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('display_order', models.IntegerField(default=0)),
                ('color', models.CharField(default='#3b82f6', help_text='Hex color for map display', max_length=7)),
                ('is_active', models.BooleanField(default=True)),
                ('map_coordinates', models.JSONField(blank=True, default=dict, help_text='SVG path or polygon coordinates')),
                ('venue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='tickets.venue')),
            ],
            options={
                'db_table': 'amphitheater_sections',
                'ordering': ['display_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='SeatBlock',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_date', models.DateField(db_index=True)),
                ('row_start', models.CharField(max_length=10)),
                ('row_end', models.CharField(max_length=10)),
                ('seat_start', models.IntegerField()),
                ('seat_end', models.IntegerField()),
                ('total_seats', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('available_seats', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('held_seats', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ('sold_seats', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ('price_cents', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seat_blocks', to='tickets.section')),
            ],
            options={
                'db_table': 'amphitheater_seat_blocks',
                'unique_together': {('section', 'event_date', 'row_start', 'row_end')},
            },
        ),
        migrations.CreateModel(
            name='SeatHold',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('session_key', models.CharField(db_index=True, max_length=255)),
                ('quantity', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('allocated_seats', models.JSONField(default=list, help_text='List of {row, seat} objects')),
                ('expires_at', models.DateTimeField(db_index=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('seat_block', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='holds', to='tickets.seatblock')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'amphitheater_seat_holds',
            },
        ),
        migrations.CreateModel(
            name='AmphitheaterTicket',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('row', models.CharField(max_length=10)),
                ('seat_number', models.IntegerField()),
                ('event_date', models.DateField(db_index=True)),
                ('event_name', models.CharField(default='OC MENA Festival Concert', max_length=255)),
                ('price_paid_cents', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('status', models.CharField(choices=[('ISSUED', 'Issued'), ('USED', 'Used'), ('CANCELLED', 'Cancelled'), ('TRANSFERRED', 'Transferred')], default='ISSUED', max_length=20)),
                ('includes_festival_access', models.BooleanField(default=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('festival_ticket', models.OneToOneField(help_text='Main ticket record for QR code and scanning', on_delete=django.db.models.deletion.CASCADE, related_name='amphitheater_ticket', to='tickets.ticket')),
                ('seat_block', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tickets', to='tickets.seatblock')),
                ('festival_day_ticket', models.ForeignKey(blank=True, help_text='Auto-issued festival day pass', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='granted_by_amphitheater', to='tickets.ticket')),
            ],
            options={
                'db_table': 'amphitheater_tickets',
                'unique_together': {('seat_block', 'row', 'seat_number')},
            },
        ),
        migrations.AddIndex(
            model_name='section',
            index=models.Index(fields=['venue', 'is_active'], name='amphitheate_venue_i_idx'),
        ),
        migrations.AddIndex(
            model_name='seatblock',
            index=models.Index(fields=['section', 'event_date', 'is_active'], name='amphitheate_section_idx'),
        ),
        migrations.AddIndex(
            model_name='seatblock',
            index=models.Index(fields=['event_date', 'available_seats'], name='amphitheate_event_d_idx'),
        ),
        migrations.AddIndex(
            model_name='seathold',
            index=models.Index(fields=['session_key', 'is_active'], name='amphitheate_session_idx'),
        ),
        migrations.AddIndex(
            model_name='seathold',
            index=models.Index(fields=['expires_at', 'is_active'], name='amphitheate_expires_idx'),
        ),
        migrations.AddIndex(
            model_name='amphitheaterticket',
            index=models.Index(fields=['event_date', 'status'], name='amphitheate_event_d_status_idx'),
        ),
        migrations.AddIndex(
            model_name='amphitheaterticket',
            index=models.Index(fields=['festival_ticket'], name='amphitheate_festiva_idx'),
        ),
    ]
