"""
Management command to seed initial EventConfig.
"""
from django.core.management.base import BaseCommand
from django.db import connection
from apps.config.models import EventConfig


class Command(BaseCommand):
    help = 'Create initial EventConfig if none exists'

    def handle(self, *args, **options):
        # Check if EventConfig already exists
        if EventConfig.objects.exists():
            self.stdout.write(self.style.WARNING('EventConfig already exists'))
            return

        # Check if table has the correct schema
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'event_config'
            """)
            columns = [row[0] for row in cursor.fetchall()]
            
            # If event_name column doesn't exist, the schema is old - drop and recreate
            if 'event_name' not in columns:
                self.stdout.write(self.style.WARNING('Old schema detected - recreating event_config table'))
                cursor.execute('DROP TABLE IF EXISTS event_config CASCADE')
                
                # Create table with correct schema
                cursor.execute("""
                    CREATE TABLE event_config (
                        id UUID PRIMARY KEY,
                        event_name VARCHAR(255) DEFAULT 'OC MENA Festival',
                        event_tagline VARCHAR(500) DEFAULT '',
                        event_start_date DATE NULL,
                        event_end_date DATE NULL,
                        event_location VARCHAR(500) DEFAULT '',
                        event_address TEXT DEFAULT '',
                        ticket_sales_enabled BOOLEAN DEFAULT FALSE,
                        transfer_enabled BOOLEAN DEFAULT FALSE,
                        upgrade_enabled BOOLEAN DEFAULT FALSE,
                        refunds_enabled BOOLEAN DEFAULT FALSE,
                        scanning_enabled BOOLEAN DEFAULT FALSE,
                        schedule_published BOOLEAN DEFAULT FALSE,
                        vendors_published BOOLEAN DEFAULT FALSE,
                        sponsors_published BOOLEAN DEFAULT FALSE,
                        apple_wallet_enabled BOOLEAN DEFAULT FALSE,
                        google_wallet_enabled BOOLEAN DEFAULT FALSE,
                        coming_soon_mode BOOLEAN DEFAULT TRUE,
                        coming_soon_message TEXT DEFAULT '',
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                self.stdout.write(self.style.SUCCESS('Recreated event_config table'))

        # Now create the config
        try:
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
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to create EventConfig: {e}'))
