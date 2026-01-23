# Migration to fix VendorSetupLog field names
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0003_bazaarvendorregistration_foodvendorregistration'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Remove old fields if they exist and add new ones
        migrations.RemoveField(
            model_name='vendorsetuplog',
            name='action',
        ),
        migrations.RemoveField(
            model_name='vendorsetuplog',
            name='scanned_at',
        ),
        migrations.RemoveField(
            model_name='vendorsetuplog',
            name='scanned_by',
        ),
        migrations.AddField(
            model_name='vendorsetuplog',
            name='checked_in_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='vendorsetuplog',
            name='checked_in_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vendor_checkins', to=settings.AUTH_USER_MODEL),
        ),
    ]
