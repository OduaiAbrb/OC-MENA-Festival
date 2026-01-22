"""
Management command to seed ticket types.
"""
from django.core.management.base import BaseCommand
from apps.tickets.models import TicketType


class Command(BaseCommand):
    help = 'Create sample ticket types if none exist'

    def handle(self, *args, **options):
        if TicketType.objects.exists():
            self.stdout.write(self.style.WARNING('Ticket types already exist'))
            return

        tickets = [
            {
                'name': '3-Day Pass',
                'slug': '3day',
                'description': 'Full festival access for all 3 days',
                'price_cents': 3500,
                'capacity': 1000,
                'badge_text': 'BEST VALUE',
                'is_active': True,
                'display_order': 1
            },
            {
                'name': '2-Day Pass',
                'slug': '2day',
                'description': 'Festival access for any 2 days',
                'price_cents': 2500,
                'capacity': 800,
                'badge_text': 'POPULAR',
                'is_active': True,
                'display_order': 2
            },
            {
                'name': '1-Day Pass',
                'slug': '1day',
                'description': 'Single day festival access',
                'price_cents': 1500,
                'capacity': 500,
                'badge_text': 'STANDARD',
                'is_active': True,
                'display_order': 3
            }
        ]

        created_count = 0
        for ticket_data in tickets:
            ticket = TicketType.objects.create(**ticket_data)
            self.stdout.write(self.style.SUCCESS(f'Created ticket type: {ticket.name} (${ticket.price_cents/100})'))
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} ticket types'))
