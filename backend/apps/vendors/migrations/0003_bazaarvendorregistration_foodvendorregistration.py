# Generated migration for vendor registration models
from django.db import migrations, models
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0002_alter_booth_area_alter_booth_zone_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BazaarVendorRegistration',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('business_type', models.CharField(max_length=100)),
                ('contact_email', models.EmailField(max_length=254)),
                ('legal_business_name', models.CharField(max_length=255)),
                ('booth_name', models.CharField(max_length=255)),
                ('same_as_legal_name', models.BooleanField(default=False)),
                ('phone_number', models.CharField(max_length=20)),
                ('instagram_handle', models.CharField(blank=True, max_length=100)),
                ('facebook_handle', models.CharField(blank=True, max_length=255)),
                ('tiktok_handle', models.CharField(blank=True, max_length=100)),
                ('accept_terms', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('processed', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'bazaar_vendor_registrations',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FoodVendorRegistration',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('business_type', models.CharField(max_length=100)),
                ('contact_email', models.EmailField(max_length=254)),
                ('legal_business_name', models.CharField(max_length=255)),
                ('booth_name', models.CharField(max_length=255)),
                ('same_as_legal_name', models.BooleanField(default=False)),
                ('phone_number', models.CharField(max_length=20)),
                ('instagram_handle', models.CharField(blank=True, max_length=100)),
                ('facebook_handle', models.CharField(blank=True, max_length=255)),
                ('tiktok_handle', models.CharField(blank=True, max_length=100)),
                ('has_health_permit', models.BooleanField(default=False)),
                ('pepsi_beverage_terms', models.BooleanField(default=False)),
                ('handwashing_station_terms', models.BooleanField(default=False)),
                ('health_department_terms', models.BooleanField(default=False)),
                ('setup_terms', models.BooleanField(default=False)),
                ('accept_terms', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('processed', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'food_vendor_registrations',
                'ordering': ['-created_at'],
            },
        ),
    ]
