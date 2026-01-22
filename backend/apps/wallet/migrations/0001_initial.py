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
            name='PassRecord',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('pass_type', models.CharField(choices=[('APPLE', 'Apple Wallet'), ('GOOGLE', 'Google Wallet')], db_index=True, max_length=10)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('CREATED', 'Created'), ('INSTALLED', 'Installed'), ('UPDATED', 'Updated'), ('REVOKED', 'Revoked'), ('FAILED', 'Failed')], db_index=True, default='PENDING', max_length=20)),
                ('pass_serial_number', models.CharField(blank=True, max_length=100, unique=True)),
                ('pass_url', models.URLField(blank=True)),
                ('authentication_token', models.CharField(blank=True, max_length=100)),
                ('last_updated_tag', models.CharField(blank=True, max_length=100)),
                ('google_pass_class_id', models.CharField(blank=True, max_length=100)),
                ('google_pass_object_id', models.CharField(blank=True, max_length=100)),
                ('push_token', models.CharField(blank=True, max_length=255)),
                ('error_message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('installed_at', models.DateTimeField(blank=True, null=True)),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wallet_passes', to='tickets.ticket')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wallet_passes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'pass_records',
            },
        ),
        migrations.AddConstraint(
            model_name='passrecord',
            constraint=models.UniqueConstraint(fields=('ticket', 'pass_type'), name='one_pass_per_ticket_per_type'),
        ),
    ]
