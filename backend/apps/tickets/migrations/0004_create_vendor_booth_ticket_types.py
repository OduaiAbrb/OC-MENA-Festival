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
            'description': 'Bazaar vendor booth access for all three days (Friday-Sunday)',
            'price_cents': 30000,  # $300
            'quantity_available': 50,
            'is_active': True,
        },
        {
            'name': 'Bazaar Vendor Booth - 2 Days',
            'slug': 'bazaar-2day',
            'description': 'Bazaar vendor booth access for two days (Saturday-Sunday)',
            'price_cents': 21000,  # $210 (30% discount)
            'quantity_available': 30,
            'is_active': True,
        },
        {
            'name': 'Food Vendor Booth - 3 Days',
            'slug': 'food-3day',
            'description': 'Food vendor booth access for all three days (Friday-Sunday)',
            'price_cents': 50000,  # $500
            'quantity_available': 30,
            'is_active': True,
        },
        {
            'name': 'Food Vendor Booth - 2 Days',
            'slug': 'food-2day',
            'description': 'Food vendor booth access for two days (Saturday-Sunday)',
            'price_cents': 35000,  # $350 (30% discount)
            'quantity_available': 20,
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
    slugs = ['bazaar-3day', 'bazaar-2day', 'food-3day', 'food-2day']
    TicketType.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0003_create_initial_ticket_types'),
    ]

    operations = [
        migrations.RunPython(create_vendor_booth_ticket_types, reverse_migration),
    ]
