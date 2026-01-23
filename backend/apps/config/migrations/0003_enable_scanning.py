"""
Data migration to enable scanning and create default event config if needed.
"""
from django.db import migrations


def enable_scanning(apps, schema_editor):
    """Enable scanning in event config."""
    EventConfig = apps.get_model('config', 'EventConfig')
    
    # Get or create active config
    config = EventConfig.objects.filter(is_active=True).first()
    
    if not config:
        # Create default config with scanning enabled
        config = EventConfig.objects.create(
            event_name='OC MENA Festival',
            event_tagline='Experience the Culture',
            ticket_sales_enabled=True,
            transfer_enabled=True,
            upgrade_enabled=True,
            refunds_enabled=False,
            scanning_enabled=True,
            schedule_published=False,
            vendors_published=False,
            sponsors_published=True,
            apple_wallet_enabled=False,
            google_wallet_enabled=False,
            coming_soon_mode=False,
            is_active=True
        )
        print('Created EventConfig with scanning enabled')
    else:
        # Update existing config to enable scanning
        if not config.scanning_enabled:
            config.scanning_enabled = True
            config.save(update_fields=['scanning_enabled'])
            print(f'Enabled scanning for EventConfig: {config.id}')
        else:
            print('Scanning already enabled')


def reverse_migration(apps, schema_editor):
    """Disable scanning."""
    EventConfig = apps.get_model('config', 'EventConfig')
    EventConfig.objects.filter(is_active=True).update(scanning_enabled=False)


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0002_alter_eventconfig_options_and_more'),
    ]

    operations = [
        migrations.RunPython(enable_scanning, reverse_migration),
    ]
