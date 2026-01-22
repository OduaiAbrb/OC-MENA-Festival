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
            name='Booth',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('booth_code', models.CharField(max_length=20, unique=True)),
                ('area', models.CharField(max_length=100)),
                ('zone', models.CharField(blank=True, max_length=50)),
                ('row', models.CharField(blank=True, max_length=10)),
                ('number', models.CharField(blank=True, max_length=10)),
                ('size', models.CharField(choices=[('SMALL', 'Small (8x8)'), ('MEDIUM', 'Medium (10x10)'), ('LARGE', 'Large (12x12)'), ('EXTRA_LARGE', 'Extra Large (15x15)')], default='MEDIUM', max_length=20)),
                ('price_cents', models.PositiveIntegerField(default=0)),
                ('has_electricity', models.BooleanField(default=True)),
                ('has_water', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'booths',
                'ordering': ['area', 'zone', 'row', 'number'],
            },
        ),
        migrations.CreateModel(
            name='VendorProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('business_name', models.CharField(max_length=255)),
                ('business_description', models.TextField(blank=True)),
                ('category', models.CharField(choices=[('FOOD', 'Food & Beverage'), ('CRAFT', 'Arts & Crafts'), ('RETAIL', 'Retail'), ('SERVICE', 'Services'), ('NONPROFIT', 'Non-Profit'), ('ENTERTAINMENT', 'Entertainment'), ('OTHER', 'Other')], db_index=True, max_length=20)),
                ('website_url', models.URLField(blank=True)),
                ('contact_name', models.CharField(max_length=255)),
                ('contact_phone', models.CharField(max_length=20)),
                ('contact_email', models.EmailField(max_length=254)),
                ('booth_status', models.CharField(choices=[('PENDING', 'Pending Application'), ('APPROVED', 'Approved'), ('AWAITING_ASSIGNMENT', 'Awaiting Assignment'), ('ASSIGNED', 'Booth Assigned'), ('REJECTED', 'Rejected')], db_index=True, default='PENDING', max_length=20)),
                ('setup_qr_id', models.CharField(blank=True, max_length=32, unique=True)),
                ('setup_qr_secret', models.CharField(blank=True, max_length=64)),
                ('included_tickets_count', models.PositiveIntegerField(default=2)),
                ('internal_notes', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_public', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='vendor_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'vendor_profiles',
            },
        ),
        migrations.CreateModel(
            name='BoothAssignment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount_paid_cents', models.PositiveIntegerField(default=0)),
                ('is_paid', models.BooleanField(default=False)),
                ('notes', models.TextField(blank=True)),
                ('assigned_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('assigned_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='booth_assignments_made', to=settings.AUTH_USER_MODEL)),
                ('booth', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='assignment', to='vendors.booth')),
                ('payment_order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='booth_assignments', to='tickets.order')),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booth_assignments', to='vendors.vendorprofile')),
            ],
            options={
                'db_table': 'booth_assignments',
            },
        ),
        migrations.CreateModel(
            name='VendorSetupLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(max_length=50)),
                ('notes', models.TextField(blank=True)),
                ('scanned_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('scanned_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vendor_setups_scanned', to=settings.AUTH_USER_MODEL)),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='setup_logs', to='vendors.vendorprofile')),
            ],
            options={
                'db_table': 'vendor_setup_logs',
                'ordering': ['-scanned_at'],
            },
        ),
    ]
