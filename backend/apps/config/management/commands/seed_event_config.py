"""
Management command to seed initial EventConfig.
"""
from django.core.management.base import BaseCommand
from apps.config.models import EventConfig


class Command(BaseCommand):
    help = 'Create initial EventConfig if none exists'

    def handle(self, *args, **options):
        if EventConfig.objects.exists():
            self.stdout.write(self.style.WARNING('EventConfig already exists'))
            return

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
        
        self.stdout.write(self.style.SUCCESS(f'Created EventConfig: {config.id}'))
