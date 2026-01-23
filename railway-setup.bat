@echo off
echo ========================================
echo Railway Setup Script
echo ========================================
echo.

echo Step 1: Logging into Railway...
echo (This will open your browser to authenticate)
echo.
call railway login

echo.
echo Step 2: Linking to your project...
call railway link

echo.
echo Step 3: Creating superuser account...
echo Email: admin@ocmena.com
echo Password: Admin2026!
echo.
call railway run python manage.py shell -c "from apps.accounts.models import User; u, created = User.objects.get_or_create(email='admin@ocmena.com', defaults={'full_name': 'Admin User', 'is_staff': True, 'is_superuser': True, 'is_active': True}); u.set_password('Admin2026!') if created else None; u.is_staff=True; u.is_superuser=True; u.save(); print('Superuser created!' if created else 'Superuser updated!')"

echo.
echo Step 4: Creating usher accounts...
call railway run python manage.py shell -c "from apps.accounts.models import User; emails = ['usher1@ocmena.com', 'usher2@ocmena.com', 'usher3@ocmena.com', 'usher4@ocmena.com']; [User.objects.update_or_create(email=e, defaults={'full_name': f'Usher {i+1}', 'is_staff': True, 'is_active': True})[0].set_password('Usher2026!') or print(f'Created {e}') for i, e in enumerate(emails)]"

echo.
echo Step 5: Creating ticket types...
call railway run python manage.py shell -c "from apps.tickets.models import TicketType; TicketType.objects.update_or_create(slug='3day', defaults={'name': '3-Day Pass', 'description': 'Full festival access', 'price_cents': 3500, 'quantity_available': 1000, 'is_active': True}); TicketType.objects.update_or_create(slug='2day', defaults={'name': '2-Day Pass', 'description': 'Two day access', 'price_cents': 2500, 'quantity_available': 500, 'is_active': True}); TicketType.objects.update_or_create(slug='1day', defaults={'name': '1-Day Pass', 'description': 'Single day access', 'price_cents': 1500, 'quantity_available': 500, 'is_active': True}); print('Ticket types created!')"

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Admin login: admin@ocmena.com / Admin2026!
echo Usher login: usher1@ocmena.com / Usher2026!
echo.
echo Django Admin: https://api-production-34dd.up.railway.app/admin/
echo.
pause
