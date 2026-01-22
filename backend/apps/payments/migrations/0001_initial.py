from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StripeEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('stripe_event_id', models.CharField(max_length=100, unique=True)),
                ('event_type', models.CharField(db_index=True, max_length=100)),
                ('processed', models.BooleanField(default=False)),
                ('processing_error', models.TextField(blank=True)),
                ('payload', models.JSONField(default=dict)),
                ('received_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'stripe_events',
            },
        ),
        migrations.CreateModel(
            name='PaymentAttempt',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('stripe_payment_intent_id', models.CharField(db_index=True, max_length=100)),
                ('amount_cents', models.PositiveIntegerField()),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('status', models.CharField(choices=[('INITIATED', 'Initiated'), ('PROCESSING', 'Processing'), ('SUCCEEDED', 'Succeeded'), ('FAILED', 'Failed'), ('CANCELLED', 'Cancelled')], default='INITIATED', max_length=20)),
                ('failure_code', models.CharField(blank=True, max_length=100)),
                ('failure_message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_attempts', to='tickets.order')),
            ],
            options={
                'db_table': 'payment_attempts',
            },
        ),
    ]
