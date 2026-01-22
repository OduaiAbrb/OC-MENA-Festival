#!/usr/bin/env python
"""
Seed script for development data.
Run: python manage.py shell < scripts/seed_data.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from datetime import date, time, timedelta
from django.utils import timezone
from apps.accounts.models import User, UserRole
from apps.config.models import EventConfig, Sponsor, ScheduleItem
from apps.tickets.models import TicketType
from apps.vendors.models import Booth

print("Seeding development data...")

# Create or update event config
config, _ = EventConfig.objects.update_or_create(
    is_active=True,
    defaults={
        'event_name': 'OC MENA Festival',
        'event_tagline': 'Celebrating Middle Eastern & North African Culture',
        'event_start_date': date(2026, 9, 4),
        'event_end_date': date(2026, 9, 6),
        'event_location': 'Orange County Fairgrounds',
        'event_address': '88 Fair Dr, Costa Mesa, CA 92626',
        'ticket_sales_enabled': True,
        'transfer_enabled': True,
        'upgrade_enabled': True,
        'refunds_enabled': True,
        'scanning_enabled': True,
        'schedule_published': True,
        'vendors_published': True,
        'sponsors_published': True,
        'coming_soon_mode': False,
    }
)
print(f"✓ Event config: {config.event_name}")

# Create ticket types
ticket_types = [
    {
        'name': '3-Day Pass',
        'slug': '3day-pass',
        'description': 'Complete immersion in the festival. All three days of unlimited cultural experiences.',
        'price_cents': 3500,
        'valid_days': ['2026-09-04', '2026-09-05', '2026-09-06'],
        'badge_text': 'BEST VALUE',
        'features': ['All Day Access', 'Premium Seating Areas', 'Exclusive Workshops'],
        'display_order': 1,
    },
    {
        'name': '2-Day Pass',
        'slug': '2day-pass',
        'description': 'Two full days of festival magic with access to all main performances.',
        'price_cents': 2500,
        'valid_days': ['2026-09-05', '2026-09-06'],
        'badge_text': 'POPULAR',
        'features': ['All Day Access', 'Main Stage Access', 'Cultural Workshops'],
        'display_order': 2,
    },
    {
        'name': '1-Day Pass',
        'slug': '1day-pass',
        'description': 'One full day of cultural immersion, music, food, and entertainment.',
        'price_cents': 1500,
        'valid_days': ['2026-09-06'],
        'badge_text': '',
        'features': ['All Day Access', 'Main Performances', 'Food & Market Access'],
        'display_order': 3,
    },
]

for tt in ticket_types:
    obj, created = TicketType.objects.update_or_create(
        slug=tt['slug'],
        defaults=tt
    )
    print(f"✓ Ticket type: {obj.name}")

# Create sponsors
sponsors = [
    {'name': 'Acme Corp', 'tier': 'PLATINUM', 'display_order': 1},
    {'name': 'Global Foods', 'tier': 'GOLD', 'display_order': 1},
    {'name': 'Tech Solutions', 'tier': 'GOLD', 'display_order': 2},
    {'name': 'Local Bank', 'tier': 'SILVER', 'display_order': 1},
    {'name': 'Community Health', 'tier': 'SILVER', 'display_order': 2},
    {'name': 'Arts Foundation', 'tier': 'BRONZE', 'display_order': 1},
]

for s in sponsors:
    obj, _ = Sponsor.objects.update_or_create(name=s['name'], defaults=s)
    print(f"✓ Sponsor: {obj.name}")

# Create schedule items
schedule_items = [
    {
        'title': 'Opening Ceremony',
        'category': 'CEREMONY',
        'day': date(2026, 9, 4),
        'start_time': time(10, 0),
        'end_time': time(11, 0),
        'location': 'Main Stage',
        'is_featured': True,
    },
    {
        'title': 'Traditional Dance Performance',
        'category': 'PERFORMANCE',
        'day': date(2026, 9, 4),
        'start_time': time(12, 0),
        'end_time': time(13, 0),
        'location': 'Main Stage',
        'performer_name': 'Al-Andalus Ensemble',
    },
    {
        'title': 'Calligraphy Workshop',
        'category': 'WORKSHOP',
        'day': date(2026, 9, 4),
        'start_time': time(14, 0),
        'end_time': time(15, 30),
        'location': 'Workshop Tent A',
    },
    {
        'title': 'Live Music Night',
        'category': 'PERFORMANCE',
        'day': date(2026, 9, 4),
        'start_time': time(19, 0),
        'end_time': time(22, 0),
        'location': 'Main Stage',
        'is_featured': True,
    },
]

for si in schedule_items:
    obj, _ = ScheduleItem.objects.update_or_create(
        title=si['title'],
        day=si['day'],
        defaults=si
    )
    print(f"✓ Schedule: {obj.title}")

# Create booths
for area in ['Food Court', 'Main Hall', 'Outdoor Market']:
    for i in range(1, 6):
        code = f"{area[:2].upper()}-{i:03d}"
        Booth.objects.update_or_create(
            booth_code=code,
            defaults={
                'area': area,
                'zone': 'A' if i <= 3 else 'B',
                'number': str(i),
                'size': 'MEDIUM',
                'price_cents': 50000,
                'has_electricity': True,
                'has_water': area == 'Food Court',
            }
        )
print(f"✓ Created 15 booths")

# Create test users
test_users = [
    {'email': 'attendee@test.com', 'full_name': 'Test Attendee', 'role': UserRole.ATTENDEE},
    {'email': 'vendor@test.com', 'full_name': 'Test Vendor', 'role': UserRole.VENDOR},
    {'email': 'staff@test.com', 'full_name': 'Test Staff', 'role': UserRole.STAFF_SCANNER},
    {'email': 'admin@test.com', 'full_name': 'Test Admin', 'role': UserRole.ADMIN},
]

for u in test_users:
    user, created = User.objects.get_or_create(
        email=u['email'],
        defaults={'full_name': u['full_name'], 'role': u['role']}
    )
    if created:
        user.set_password('testpass123')
        user.save()
    print(f"✓ User: {user.email} ({user.role})")

print("\n✅ Seed complete!")
