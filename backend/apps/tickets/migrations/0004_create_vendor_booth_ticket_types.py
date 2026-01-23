"""
Data migration to create vendor booth ticket types.
"""
from django.db import migrations


def create_vendor_booth_ticket_types(apps, schema_editor):
    """Create vendor booth ticket types."""
    TicketType = apps.get_model('tickets', 'TicketType')
    
    vendor_ticket_types = [
        {
            'name': 'Bazaar Vendor Booth - 3 Days',
            'slug': 'bazaar-3day',
            'description': '10x10 Bazaar booth access for all three days (Friday-Sunday)',
            'price_cents': 100000,  # $1000
            'capacity': 50,
            'is_active': True,
        },
        {
            'name': 'Bazaar Vendor Booth - 2 Days',
            'slug': 'bazaar-2day',
            'description': '10x10 Bazaar booth access for two days (Saturday-Sunday)',
            'price_cents': 70000,  # $700 (30% discount)
            'capacity': 30,
            'is_active': True,
        },
        {
            'name': 'Food Truck - 3 Days',
            'slug': 'food-truck-3day',
            'description': '10x10 Food truck space for all three days (Friday-Sunday)',
            'price_cents': 300000,  # $3000
            'capacity': 20,
            'is_active': True,
        },
        {
            'name': 'Food Truck - 2 Days',
            'slug': 'food-truck-2day',
            'description': '10x10 Food truck space for two days (Saturday-Sunday)',
            'price_cents': 210000,  # $2100 (30% discount)
            'capacity': 15,
            'is_active': True,
        },
        {
            'name': 'Food Booth - 3 Days',
            'slug': 'food-booth-3day',
            'description': '10x10 Food booth access for all three days (Friday-Sunday)',
            'price_cents': 175000,  # $1750
            'capacity': 30,
            'is_active': True,
        },
        {
            'name': 'Food Booth - 2 Days',
            'slug': 'food-booth-2day',
            'description': '10x10 Food booth access for two days (Saturday-Sunday)',
            'price_cents': 122500,  # $1225 (30% discount)
            'capacity': 20,
            'is_active': True,
        },
    ]
    
    for ticket_data in vendor_ticket_types:
        if not TicketType.objects.filter(slug=ticket_data['slug']).exists():
            TicketType.objects.create(**ticket_data)
            print(f"Created vendor booth ticket type: {ticket_data['name']}")


def reverse_migration(apps, schema_editor):
    """Remove vendor booth ticket types."""
    TicketType = apps.get_model('tickets', 'TicketType')
    slugs = ['bazaar-3day', 'bazaar-2day', 'food-truck-3day', 'food-truck-2day', 'food-booth-3day', 'food-booth-2day']
    TicketType.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0003_create_initial_ticket_types'),
    ]

    operations = [
        migrations.RunPython(create_vendor_booth_ticket_types, reverse_migration),
    ]
