"""
Management command to set up Pacific Amphitheatre venue and sections.
Run: python manage.py setup_amphitheater
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date, timedelta
from apps.tickets.amphitheater_models import Venue, Section, SeatBlock


class Command(BaseCommand):
    help = 'Set up Pacific Amphitheatre venue, sections, and seat inventory'

    def add_arguments(self, parser):
        parser.add_argument(
            '--event-dates',
            nargs='+',
            help='Event dates in YYYY-MM-DD format (e.g., 2026-06-19 2026-06-20 2026-06-21)',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Setting up Pacific Amphitheatre...')
        
        # Create or get venue
        venue, created = Venue.objects.get_or_create(
            name='Pacific Amphitheatre',
            defaults={
                'address': 'OC Fair & Event Center, 88 Fair Drive, Costa Mesa, CA 92626',
                'capacity': 8500,
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created venue: {venue.name}'))
        else:
            self.stdout.write(f'✓ Venue already exists: {venue.name}')
        
        # Create sections
        sections_data = [
            {
                'name': 'Orchestra Center',
                'section_type': 'ORCHESTRA',
                'capacity': 1500,
                'base_price_cents': 12500,  # $125
                'display_order': 1,
                'color': '#dc2626',  # Red
            },
            {
                'name': 'Orchestra Left',
                'section_type': 'ORCHESTRA',
                'capacity': 800,
                'base_price_cents': 10000,  # $100
                'display_order': 2,
                'color': '#ea580c',  # Orange
            },
            {
                'name': 'Orchestra Right',
                'section_type': 'ORCHESTRA',
                'capacity': 800,
                'base_price_cents': 10000,  # $100
                'display_order': 3,
                'color': '#ea580c',  # Orange
            },
            {
                'name': 'Mezzanine Center',
                'section_type': 'MEZZANINE',
                'capacity': 1200,
                'base_price_cents': 8500,  # $85
                'display_order': 4,
                'color': '#3b82f6',  # Blue
            },
            {
                'name': 'Mezzanine Left',
                'section_type': 'MEZZANINE',
                'capacity': 600,
                'base_price_cents': 7500,  # $75
                'display_order': 5,
                'color': '#0ea5e9',  # Sky blue
            },
            {
                'name': 'Mezzanine Right',
                'section_type': 'MEZZANINE',
                'capacity': 600,
                'base_price_cents': 7500,  # $75
                'display_order': 6,
                'color': '#0ea5e9',  # Sky blue
            },
            {
                'name': 'Terrace',
                'section_type': 'TERRACE',
                'capacity': 1500,
                'base_price_cents': 6000,  # $60
                'display_order': 7,
                'color': '#8b5cf6',  # Purple
            },
            {
                'name': 'Lawn',
                'section_type': 'LAWN',
                'capacity': 1500,
                'base_price_cents': 4500,  # $45
                'display_order': 8,
                'color': '#22c55e',  # Green
            },
        ]
        
        sections = []
        for section_data in sections_data:
            section, created = Section.objects.get_or_create(
                venue=venue,
                name=section_data['name'],
                defaults=section_data
            )
            sections.append(section)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created section: {section.name}'))
            else:
                self.stdout.write(f'  ✓ Section exists: {section.name}')
        
        # Create seat blocks for event dates
        event_dates = options.get('event_dates')
        if not event_dates:
            # Default to next 3 days
            today = date.today()
            event_dates = [
                (today + timedelta(days=i)).strftime('%Y-%m-%d')
                for i in range(3)
            ]
        
        self.stdout.write(f'\nCreating seat inventory for dates: {", ".join(event_dates)}')
        
        for date_str in event_dates:
            event_date = date.fromisoformat(date_str)
            
            for section in sections:
                # Create seat blocks (simplified: one block per section)
                # In production, you'd create multiple blocks per section for better allocation
                seat_block, created = SeatBlock.objects.get_or_create(
                    section=section,
                    event_date=event_date,
                    row_start='A',
                    row_end='Z',
                    defaults={
                        'seat_start': 1,
                        'seat_end': 50,
                        'total_seats': section.capacity,
                        'available_seats': section.capacity,
                        'price_cents': section.base_price_cents,
                        'is_active': True,
                    }
                )
                
                if created:
                    self.stdout.write(
                        f'  ✓ Created seat block: {section.name} - {event_date} '
                        f'({section.capacity} seats @ ${section.base_price_cents/100})'
                    )
        
        self.stdout.write(self.style.SUCCESS('\n✅ Pacific Amphitheatre setup complete!'))
        self.stdout.write(f'\nVenue: {venue.name}')
        self.stdout.write(f'Sections: {len(sections)}')
        self.stdout.write(f'Event dates: {len(event_dates)}')
        self.stdout.write(f'Total capacity per event: {sum(s.capacity for s in sections)} seats')
        
        self.stdout.write('\n📋 Next steps:')
        self.stdout.write('1. Run migrations: python manage.py migrate')
        self.stdout.write('2. Access admin: http://localhost:8000/admin/tickets/')
        self.stdout.write('3. Test API: http://localhost:8000/api/tickets/amphitheater/venues/')
        self.stdout.write('4. Frontend will automatically detect amphitheater tickets')
