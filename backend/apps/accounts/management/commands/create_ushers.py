"""
Django management command to create usher accounts.
Usage: python manage.py create_ushers
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Create usher accounts for scanner access'

    def handle(self, *args, **options):
        ushers_data = [
            {'email': 'usher1@ocmena.com', 'name': 'Usher One'},
            {'email': 'usher2@ocmena.com', 'name': 'Usher Two'},
            {'email': 'usher3@ocmena.com', 'name': 'Usher Three'},
            {'email': 'usher4@ocmena.com', 'name': 'Usher Four'},
        ]
        
        password = 'Usher2026!'
        
        self.stdout.write("Creating usher accounts...")
        self.stdout.write("-" * 50)
        
        for usher_data in ushers_data:
            try:
                user, created = User.objects.get_or_create(
                    email=usher_data['email'],
                    defaults={
                        'full_name': usher_data['name'],
                        'is_staff': True,
                        'is_active': True
                    }
                )
                
                if created:
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"✅ Created: {user.email}"))
                else:
                    user.is_staff = True
                    user.is_active = True
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.WARNING(f"⚠️  Updated: {user.email}"))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error creating {usher_data['email']}: {e}"))
        
        self.stdout.write("-" * 50)
        self.stdout.write(self.style.SUCCESS("\n✅ Usher accounts ready!"))
        self.stdout.write("\nLogin credentials:")
        self.stdout.write("Email: usher1@ocmena.com")
        self.stdout.write("Password: Usher2026!")
        self.stdout.write("\nAll ushers use the same password: Usher2026!")
