from django.db import migrations, models
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='EventConfig',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_name', models.CharField(default='OC MENA Festival', max_length=255)),
                ('event_tagline', models.CharField(blank=True, max_length=500)),
                ('event_start_date', models.DateField(blank=True, null=True)),
                ('event_end_date', models.DateField(blank=True, null=True)),
                ('event_location', models.CharField(blank=True, max_length=500)),
                ('event_address', models.TextField(blank=True)),
                ('ticket_sales_enabled', models.BooleanField(default=False)),
                ('transfer_enabled', models.BooleanField(default=False)),
                ('upgrade_enabled', models.BooleanField(default=False)),
                ('refunds_enabled', models.BooleanField(default=False)),
                ('scanning_enabled', models.BooleanField(default=False)),
                ('schedule_published', models.BooleanField(default=False)),
                ('vendors_published', models.BooleanField(default=False)),
                ('sponsors_published', models.BooleanField(default=False)),
                ('apple_wallet_enabled', models.BooleanField(default=False)),
                ('google_wallet_enabled', models.BooleanField(default=False)),
                ('coming_soon_mode', models.BooleanField(default=True)),
                ('coming_soon_message', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'event_config',
            },
        ),
        migrations.CreateModel(
            name='ContactSubmission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(blank=True, max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('subject', models.CharField(choices=[('SPONSOR_INQUIRY', 'Sponsor Inquiry'), ('VENDOR_INQUIRY', 'Vendor Inquiry'), ('GENERAL_QUESTION', 'General Question'), ('PRESS_INQUIRY', 'Press Inquiry'), ('OTHER', 'Other')], max_length=30)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('is_responded', models.BooleanField(default=False)),
                ('responded_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'contact_submissions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ScheduleItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(choices=[('PERFORMANCE', 'Performance'), ('WORKSHOP', 'Workshop'), ('FOOD', 'Food & Dining'), ('ACTIVITY', 'Activity'), ('CEREMONY', 'Ceremony'), ('OTHER', 'Other')], db_index=True, max_length=20)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('day', models.DateField(db_index=True)),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('performer_name', models.CharField(blank=True, max_length=255)),
                ('image_url', models.URLField(blank=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'schedule_items',
                'ordering': ['day', 'start_time'],
            },
        ),
        migrations.CreateModel(
            name='Sponsor',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('tier', models.CharField(choices=[('PLATINUM', 'Platinum'), ('GOLD', 'Gold'), ('SILVER', 'Silver'), ('BRONZE', 'Bronze'), ('PARTNER', 'Partner')], db_index=True, max_length=20)),
                ('logo_url', models.URLField(blank=True)),
                ('website_url', models.URLField(blank=True)),
                ('description', models.TextField(blank=True)),
                ('display_order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'sponsors',
                'ordering': ['tier', 'display_order', 'name'],
            },
        ),
    ]
