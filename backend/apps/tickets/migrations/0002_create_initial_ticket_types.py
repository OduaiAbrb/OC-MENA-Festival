"""
Data migration to create initial ticket types.
This runs automatically during deployment.
"""
from django.db import migrations


def create_ticket_types(apps, schema_editor):
    """Create default ticket types."""
    TicketType = apps.get_model('tickets', 'TicketType')
    
    ticket_types = [
        {
            'name': '3-Day Pass',
            'slug': '3day',
            'description': 'Full festival access for all three days',
            'price_cents': 3500,
            'quantity_available': 1000,
            'is_active': True,
        },
        {
            'name': '2-Day Pass',
            'slug': '2day',
            'description': 'Festival access for any two days',
            'price_cents': 2500,
            'quantity_available': 500,
            'is_active': True,
        },
        {
            'name': '1-Day Pass',
            'slug': '1day',
            'description': 'Festival access for a single day',
            'price_cents': 1500,
            'quantity_available': 500,
            'is_active': True,
        },
    ]
    
    for ticket_data in ticket_types:
        if not TicketType.objects.filter(slug=ticket_data['slug']).exists():
            TicketType.objects.create(**ticket_data)
            print(f"Created ticket type: {ticket_data['name']}")


def reverse_migration(apps, schema_editor):
    """Remove the created ticket types (optional)."""
    TicketType = apps.get_model('tickets', 'TicketType')
    slugs = ['3day', '2day', '1day']
    TicketType.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_ticket_types, reverse_migration),
    ]
