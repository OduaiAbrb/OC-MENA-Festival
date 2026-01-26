"""
Post-deployment script for Railway.
Automatically sets up amphitheater venue after migrations.
"""
import os
import sys
import django
from datetime import date, timedelta

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import transaction

# Try to import amphitheater models - they may not exist on first deployment
try:
    from apps.tickets.amphitheater_models import Venue, Section, SeatBlock
    AMPHITHEATER_AVAILABLE = True
except (ImportError, Exception) as e:
    print(f'⚠️  Amphitheater models not available yet: {e}')
    AMPHITHEATER_AVAILABLE = False


def setup_amphitheater():
    """Set up Pacific Amphitheatre venue, sections, and seat inventory."""
    print('🎭 Setting up Pacific Amphitheatre...')
    
    with transaction.atomic():
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
            print(f'✓ Created venue: {venue.name}')
        else:
            print(f'✓ Venue already exists: {venue.name}')
        
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
                'color': '#ca8a04',  # Yellow
            },
            {
                'name': 'Mezzanine Left',
                'section_type': 'MEZZANINE',
                'capacity': 600,
                'base_price_cents': 7500,  # $75
                'display_order': 5,
                'color': '#65a30d',  # Lime
            },
            {
                'name': 'Mezzanine Right',
                'section_type': 'MEZZANINE',
                'capacity': 600,
                'base_price_cents': 7500,  # $75
                'display_order': 6,
                'color': '#65a30d',  # Lime
            },
            {
                'name': 'Terrace',
                'section_type': 'TERRACE',
                'capacity': 1500,
                'base_price_cents': 6000,  # $60
                'display_order': 7,
                'color': '#0891b2',  # Cyan
            },
            {
                'name': 'Lawn',
                'section_type': 'LAWN',
                'capacity': 1500,
                'base_price_cents': 4500,  # $45
                'display_order': 8,
                'color': '#7c3aed',  # Purple
            },
        ]
        
        sections_created = 0
        for section_data in sections_data:
            section, created = Section.objects.get_or_create(
                venue=venue,
                name=section_data['name'],
                defaults={
                    'section_type': section_data['section_type'],
                    'capacity': section_data['capacity'],
                    'base_price_cents': section_data['base_price_cents'],
                    'display_order': section_data['display_order'],
                    'color': section_data['color'],
                    'is_active': True,
                }
            )
            if created:
                sections_created += 1
                print(f'  ✓ Created section: {section.name} (${section_data["base_price_cents"]/100:.0f})')
        
        if sections_created > 0:
            print(f'✓ Created {sections_created} sections')
        else:
            print('✓ All sections already exist')
        
        # Create seat blocks for event dates
        # Default to 3 festival days if not specified
        event_dates = [
            date(2026, 6, 19),  # Thursday
            date(2026, 6, 20),  # Friday
            date(2026, 6, 21),  # Saturday
        ]
        
        blocks_created = 0
        for section in Section.objects.filter(venue=venue, is_active=True):
            for event_date in event_dates:
                block, created = SeatBlock.objects.get_or_create(
                    section=section,
                    event_date=event_date,
                    defaults={
                        'total_seats': section.capacity,
                        'available_seats': section.capacity,
                        'price_cents': section.base_price_cents,
                    }
                )
                if created:
                    blocks_created += 1
        
        if blocks_created > 0:
            print(f'✓ Created {blocks_created} seat blocks for {len(event_dates)} event dates')
        else:
            print('✓ All seat blocks already exist')
        
        print('✅ Pacific Amphitheatre setup complete!')
        print(f'   Total capacity: {venue.capacity:,} seats')
        print(f'   Sections: {Section.objects.filter(venue=venue).count()}')
        print(f'   Event dates: {len(event_dates)}')


if __name__ == '__main__':
    if not AMPHITHEATER_AVAILABLE:
        print('⚠️  Skipping amphitheater setup - models not available yet')
        print('   This is normal on first deployment. Run setup_amphitheater management command after deployment.')
        sys.exit(0)
    
    try:
        setup_amphitheater()
    except Exception as e:
        print(f'❌ Error setting up amphitheater: {e}')
        import traceback
        traceback.print_exc()
        # Don't exit with error - allow deployment to continue
        print('⚠️  Continuing deployment despite amphitheater setup error')
        sys.exit(0)
