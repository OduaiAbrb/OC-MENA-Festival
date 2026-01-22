from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TicketType',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(unique=True)),
                ('description', models.TextField(blank=True)),
                ('price_cents', models.PositiveIntegerField()),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('valid_days', models.JSONField(default=list, help_text='List of valid dates in YYYY-MM-DD format')),
                ('capacity', models.PositiveIntegerField(blank=True, help_text='Null = unlimited', null=True)),
                ('sold_count', models.PositiveIntegerField(default=0)),
                ('sale_start', models.DateTimeField(blank=True, null=True)),
                ('sale_end', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('display_order', models.IntegerField(default=0)),
                ('badge_text', models.CharField(blank=True, help_text='e.g., BEST VALUE, POPULAR', max_length=50)),
                ('features', models.JSONField(default=list, help_text='List of feature strings')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'ticket_types',
                'ordering': ['display_order', 'price_cents'],
            },
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('order_number', models.CharField(db_index=True, max_length=20, unique=True)),
                ('status', models.CharField(choices=[('CREATED', 'Created'), ('PAYMENT_PENDING', 'Payment Pending'), ('PAID', 'Paid'), ('FAILED', 'Failed'), ('CANCELLED', 'Cancelled'), ('REFUNDED', 'Refunded'), ('PARTIALLY_REFUNDED', 'Partially Refunded')], db_index=True, default='CREATED', max_length=20)),
                ('subtotal_cents', models.PositiveIntegerField(default=0)),
                ('fees_cents', models.PositiveIntegerField(default=0)),
                ('tax_cents', models.PositiveIntegerField(default=0)),
                ('total_cents', models.PositiveIntegerField(default=0)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('stripe_payment_intent_id', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('idempotency_key', models.CharField(max_length=100, unique=True)),
                ('refunded_cents', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('buyer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='orders', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'orders',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Comp',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('reason', models.CharField(choices=[('VIP', 'VIP Guest'), ('SPEAKER', 'Speaker/Performer'), ('SPONSOR', 'Sponsor'), ('MEDIA', 'Media/Press'), ('STAFF', 'Staff'), ('VENDOR', 'Vendor Included'), ('PROMOTION', 'Promotion'), ('CUSTOMER_SERVICE', 'Customer Service'), ('OTHER', 'Other')], max_length=30)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('issued_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='comps_issued', to=settings.AUTH_USER_MODEL)),
                ('ticket_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tickets.tickettype')),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='comps_received', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'comps',
            },
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('ticket_code', models.CharField(db_index=True, max_length=32, unique=True)),
                ('status', models.CharField(choices=[('ISSUED', 'Issued'), ('TRANSFER_PENDING', 'Transfer Pending'), ('USED', 'Used'), ('CANCELLED', 'Cancelled'), ('REFUNDED', 'Refunded')], db_index=True, default='ISSUED', max_length=20)),
                ('qr_secret_version', models.PositiveIntegerField(default=1)),
                ('qr_payload_hash', models.CharField(blank=True, max_length=64)),
                ('is_comp', models.BooleanField(default=False)),
                ('issued_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('used_at', models.DateTimeField(blank=True, null=True)),
                ('comp', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets', to='tickets.comp')),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets', to='tickets.order')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tickets', to=settings.AUTH_USER_MODEL)),
                ('ticket_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tickets.tickettype')),
            ],
            options={
                'db_table': 'tickets',
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('invoice_number', models.CharField(max_length=30, unique=True)),
                ('pdf_url', models.URLField(blank=True)),
                ('pdf_file', models.FileField(blank=True, upload_to='invoices/')),
                ('generated_at', models.DateTimeField(blank=True, null=True)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='tickets.order')),
            ],
            options={
                'db_table': 'invoices',
            },
        ),
        migrations.CreateModel(
            name='Refund',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount_cents', models.PositiveIntegerField()),
                ('status', models.CharField(choices=[('REQUESTED', 'Requested'), ('PROCESSING', 'Processing'), ('SUCCEEDED', 'Succeeded'), ('FAILED', 'Failed')], db_index=True, default='REQUESTED', max_length=20)),
                ('stripe_refund_id', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('reason', models.CharField(choices=[('CUSTOMER_REQUEST', 'Customer Request'), ('EVENT_CANCELLED', 'Event Cancelled'), ('DUPLICATE_PURCHASE', 'Duplicate Purchase'), ('OTHER', 'Other')], max_length=30)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('initiated_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='refunds_initiated', to=settings.AUTH_USER_MODEL)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='refunds', to='tickets.order')),
            ],
            options={
                'db_table': 'refunds',
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveIntegerField()),
                ('unit_price_cents', models.PositiveIntegerField()),
                ('total_cents', models.PositiveIntegerField()),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='tickets.order')),
                ('ticket_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tickets.tickettype')),
            ],
            options={
                'db_table': 'order_items',
            },
        ),
        migrations.CreateModel(
            name='TicketTransfer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('to_email', models.EmailField(max_length=254)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('CANCELLED', 'Cancelled'), ('EXPIRED', 'Expired')], db_index=True, default='PENDING', max_length=20)),
                ('token_hash', models.CharField(max_length=64, unique=True)),
                ('expires_at', models.DateTimeField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='transfers_sent', to=settings.AUTH_USER_MODEL)),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfers', to='tickets.ticket')),
                ('to_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transfers_received', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ticket_transfers',
            },
        ),
        migrations.CreateModel(
            name='TicketUpgrade',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('diff_cents', models.IntegerField()),
                ('status', models.CharField(choices=[('CREATED', 'Created'), ('PAYMENT_PENDING', 'Payment Pending'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed'), ('CANCELLED', 'Cancelled'), ('COMPED', 'Comped')], db_index=True, default='CREATED', max_length=20)),
                ('stripe_payment_intent_id', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('comped_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='upgrades_comped', to=settings.AUTH_USER_MODEL)),
                ('from_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='upgrades_from', to='tickets.tickettype')),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='upgrades', to='tickets.ticket')),
                ('to_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='upgrades_to', to='tickets.tickettype')),
            ],
            options={
                'db_table': 'ticket_upgrades',
            },
        ),
        migrations.AddIndex(
            model_name='tickettype',
            index=models.Index(fields=['is_active', 'sale_start', 'sale_end'], name='ticket_type_is_acti_a1b2c3_idx'),
        ),
        migrations.AddIndex(
            model_name='tickettype',
            index=models.Index(fields=['slug'], name='ticket_type_slug_d4e5f6_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['buyer', 'status'], name='orders_buyer_i_de73e4_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['stripe_payment_intent_id'], name='orders_stripe__191dc4_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['created_at'], name='orders_created_77e2b9_idx'),
        ),
        migrations.AddIndex(
            model_name='comp',
            index=models.Index(fields=['to_user', 'created_at'], name='comps_to_user_291423_idx'),
        ),
        migrations.AddIndex(
            model_name='comp',
            index=models.Index(fields=['issued_by', 'created_at'], name='comps_issued__470267_idx'),
        ),
        migrations.AddIndex(
            model_name='ticket',
            index=models.Index(fields=['owner', 'status'], name='tickets_owner_i_805e5e_idx'),
        ),
        migrations.AddIndex(
            model_name='ticket',
            index=models.Index(fields=['ticket_code'], name='tickets_ticket__2ef6a4_idx'),
        ),
        migrations.AddIndex(
            model_name='ticket',
            index=models.Index(fields=['status', 'issued_at'], name='tickets_status_01eee7_idx'),
        ),
        migrations.AddConstraint(
            model_name='ticket',
            constraint=models.CheckConstraint(check=models.Q(('status', 'USED'), ('used_at__isnull', True), _negated=True), name='used_ticket_must_have_used_at'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['invoice_number'], name='invoices_invoice_7778bc_idx'),
        ),
        migrations.AddIndex(
            model_name='refund',
            index=models.Index(fields=['order', 'status'], name='refunds_order_i_37bade_idx'),
        ),
        migrations.AddIndex(
            model_name='refund',
            index=models.Index(fields=['created_at'], name='refunds_created_7e4196_idx'),
        ),
        migrations.AddIndex(
            model_name='tickettransfer',
            index=models.Index(fields=['ticket', 'status'], name='ticket_tran_ticket__b07155_idx'),
        ),
        migrations.AddIndex(
            model_name='tickettransfer',
            index=models.Index(fields=['to_email', 'status'], name='ticket_tran_to_emai_f992af_idx'),
        ),
        migrations.AddIndex(
            model_name='tickettransfer',
            index=models.Index(fields=['expires_at'], name='ticket_tran_expires_54f3c5_idx'),
        ),
        migrations.AddConstraint(
            model_name='tickettransfer',
            constraint=models.UniqueConstraint(condition=models.Q(('status', 'PENDING')), fields=('ticket',), name='one_pending_transfer_per_ticket'),
        ),
        migrations.AddIndex(
            model_name='ticketupgrade',
            index=models.Index(fields=['ticket', 'status'], name='ticket_upgr_ticket__24de91_idx'),
        ),
        migrations.AddConstraint(
            model_name='ticketupgrade',
            constraint=models.UniqueConstraint(condition=models.Q(('status__in', ['COMPLETED', 'FAILED', 'CANCELLED', 'COMPED']), _negated=True), fields=('ticket',), name='one_active_upgrade_per_ticket'),
        ),
    ]
