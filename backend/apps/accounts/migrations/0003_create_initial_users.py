"""
Data migration to create initial superuser and usher accounts.
This runs automatically during deployment.
"""
from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_initial_users(apps, schema_editor):
    """Create superuser and usher accounts."""
    User = apps.get_model('accounts', 'User')
    
    # Create superuser
    if not User.objects.filter(email='admin@ocmena.com').exists():
        User.objects.create(
            email='admin@ocmena.com',
            password=make_password('Admin2026!'),
            full_name='Admin User',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print('Created superuser: admin@ocmena.com')
    
    # Create ushers
    ushers = [
        ('usher1@ocmena.com', 'Usher One'),
        ('usher2@ocmena.com', 'Usher Two'),
        ('usher3@ocmena.com', 'Usher Three'),
        ('usher4@ocmena.com', 'Usher Four'),
    ]
    
    for email, name in ushers:
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                email=email,
                password=make_password('Usher2026!'),
                full_name=name,
                is_staff=True,
                is_superuser=False,
                is_active=True
            )
            print(f'Created usher: {email}')


def reverse_migration(apps, schema_editor):
    """Remove the created users (optional)."""
    User = apps.get_model('accounts', 'User')
    emails = [
        'admin@ocmena.com',
        'usher1@ocmena.com',
        'usher2@ocmena.com',
        'usher3@ocmena.com',
        'usher4@ocmena.com',
    ]
    User.objects.filter(email__in=emails).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_groups'),
    ]

    operations = [
        migrations.RunPython(create_initial_users, reverse_migration),
    ]
