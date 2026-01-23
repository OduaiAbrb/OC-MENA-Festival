#!/usr/bin/env python
"""
Script to create usher accounts for scanner access.
Run this in Railway using: railway run python create_usher.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import User

def create_ushers():
    """Create multiple usher accounts."""
    ushers_data = [
        {'email': 'usher1@ocmena.com', 'name': 'Usher One'},
        {'email': 'usher2@ocmena.com', 'name': 'Usher Two'},
        {'email': 'usher3@ocmena.com', 'name': 'Usher Three'},
        {'email': 'usher4@ocmena.com', 'name': 'Usher Four'},
    ]
    
    password = 'Usher2026!'
    
    print("Creating usher accounts...")
    print("-" * 50)
    
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
                print(f"✅ Created: {user.email}")
                print(f"   Password: {password}")
            else:
                # Update existing user to ensure staff status
                user.is_staff = True
                user.is_active = True
                user.set_password(password)
                user.save()
                print(f"⚠️  Updated: {user.email}")
                print(f"   Password: {password}")
                
        except Exception as e:
            print(f"❌ Error creating {usher_data['email']}: {e}")
    
    print("-" * 50)
    print("\n✅ Usher accounts ready!")
    print("\nLogin credentials:")
    print("Email: usher1@ocmena.com")
    print("Password: Usher2026!")
    print("\nAll ushers use the same password: Usher2026!")

if __name__ == '__main__':
    create_ushers()
