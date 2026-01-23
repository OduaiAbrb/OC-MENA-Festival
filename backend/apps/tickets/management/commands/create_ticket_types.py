"""
Django management command to create default ticket types.
Usage: python manage.py create_ticket_types
"""
from django.core.management.base import BaseCommand
from apps.tickets.models import TicketType
from decimal import Decimal


class Command(BaseCommand):
    help = 'Create default ticket types for the festival'

    def handle(self, *args, **options):
        ticket_types_data = [
            {
                'name': '3-Day Pass',
                'slug': '3day',
                'description': 'Full festival access for all three days',
                'price_cents': 3500,  # $35
                'quantity_available': 1000,
                'is_active': True,
                'valid_days': ['2026-05-01', '2026-05-02', '2026-05-03']
            },
            {
                'name': '2-Day Pass',
                'slug': '2day',
                'description': 'Festival access for any two days',
                'price_cents': 2500,  # $25
                'quantity_available': 500,
                'is_active': True,
                'valid_days': ['2026-05-01', '2026-05-02', '2026-05-03']
            },
            {
                'name': '1-Day Pass',
                'slug': '1day',
                'description': 'Festival access for a single day',
                'price_cents': 1500,  # $15
                'quantity_available': 500,
                'is_active': True,
                'valid_days': ['2026-05-01', '2026-05-02', '2026-05-03']
            }
        ]
        
        self.stdout.write("Creating ticket types...")
        self.stdout.write("-" * 50)
        
        created = []
        updated = []
        
        for ticket_data in ticket_types_data:
            try:
                ticket_type, was_created = TicketType.objects.update_or_create(
                    slug=ticket_data['slug'],
                    defaults={
                        'name': ticket_data['name'],
                        'description': ticket_data['description'],
                        'price_cents': ticket_data['price_cents'],
                        'quantity_available': ticket_data['quantity_available'],
                        'is_active': ticket_data['is_active'],
                        'valid_days': ticket_data['valid_days']
                    }
                )
                
                if was_created:
                    created.append(ticket_type.name)
                    self.stdout.write(self.style.SUCCESS(f"✅ Created: {ticket_type.name} (${ticket_type.price_cents/100:.2f})"))
                else:
                    updated.append(ticket_type.name)
                    self.stdout.write(self.style.WARNING(f"⚠️  Updated: {ticket_type.name} (${ticket_type.price_cents/100:.2f})"))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error with {ticket_data['name']}: {e}"))
        
        self.stdout.write("-" * 50)
        self.stdout.write(self.style.SUCCESS(f"\n✅ Ticket types ready!"))
        self.stdout.write(f"Created: {len(created)}")
        self.stdout.write(f"Updated: {len(updated)}")
        self.stdout.write("\nTicket types are now available for purchase!")
