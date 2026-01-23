"""
Setup views for initial account creation.
These are temporary endpoints for easy setup.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.tickets.models import TicketType

User = get_user_model()


class CreateUshersView(APIView):
    """
    Public endpoint to create usher accounts.
    Visit: /api/accounts/setup/create-ushers/
    
    This is a one-time setup endpoint. In production, you should
    disable this after creating the accounts.
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        """Create usher accounts when visiting this URL."""
        ushers_data = [
            {'email': 'usher1@ocmena.com', 'name': 'Usher One'},
            {'email': 'usher2@ocmena.com', 'name': 'Usher Two'},
            {'email': 'usher3@ocmena.com', 'name': 'Usher Three'},
            {'email': 'usher4@ocmena.com', 'name': 'Usher Four'},
        ]
        
        password = 'Usher2026!'
        created_users = []
        updated_users = []
        errors = []
        
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
                    created_users.append(user.email)
                else:
                    # Update existing user
                    user.is_staff = True
                    user.is_active = True
                    user.full_name = usher_data['name']
                    user.set_password(password)
                    user.save()
                    updated_users.append(user.email)
                    
            except Exception as e:
                errors.append(f"Error with {usher_data['email']}: {str(e)}")
        
        return Response({
            'success': True,
            'message': 'Usher accounts setup complete!',
            'created': created_users,
            'updated': updated_users,
            'errors': errors,
            'credentials': {
                'password': password,
                'note': 'All ushers use the same password'
            },
            'next_steps': [
                'Go to /login',
                'Login with usher1@ocmena.com / Usher2026!',
                'Navigate to /scanner',
                'Scanner will activate automatically'
            ]
        }, status=status.HTTP_200_OK)


class CreateTicketTypesView(APIView):
    """
    Public endpoint to create default ticket types.
    Visit: /api/accounts/setup/create-ticket-types/
    
    This creates the default 3-Day, 2-Day, and 1-Day passes.
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        """Create ticket types when visiting this URL."""
        ticket_types_data = [
            {
                'name': '3-Day Pass',
                'slug': '3day',
                'description': 'Full festival access for all three days',
                'price_cents': 3500,
                'quantity_available': 1000,
                'is_active': True,
                'valid_days': ['2026-05-01', '2026-05-02', '2026-05-03']
            },
            {
                'name': '2-Day Pass',
                'slug': '2day',
                'description': 'Festival access for any two days',
                'price_cents': 2500,
                'quantity_available': 500,
                'is_active': True,
                'valid_days': ['2026-05-01', '2026-05-02', '2026-05-03']
            },
            {
                'name': '1-Day Pass',
                'slug': '1day',
                'description': 'Festival access for a single day',
                'price_cents': 1500,
                'quantity_available': 500,
                'is_active': True,
                'valid_days': ['2026-05-01', '2026-05-02', '2026-05-03']
            }
        ]
        
        created = []
        updated = []
        errors = []
        
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
                    created.append({
                        'name': ticket_type.name,
                        'price': f"${ticket_type.price_cents/100:.2f}",
                        'id': str(ticket_type.id)
                    })
                else:
                    updated.append({
                        'name': ticket_type.name,
                        'price': f"${ticket_type.price_cents/100:.2f}",
                        'id': str(ticket_type.id)
                    })
                    
            except Exception as e:
                errors.append(f"Error with {ticket_data['name']}: {str(e)}")
        
        return Response({
            'success': True,
            'message': 'Ticket types setup complete!',
            'created': created,
            'updated': updated,
            'errors': errors,
            'next_steps': [
                'Go to /tickets',
                'Tickets will now load with proper UUIDs',
                'Add tickets to cart',
                'Proceed to checkout - UUID error should be fixed!'
            ]
        }, status=status.HTTP_200_OK)


class CreateSuperuserView(APIView):
    """
    Public endpoint to create a default superuser account.
    Visit: /api/accounts/setup/create-superuser/
    
    WARNING: This creates a default admin account. Change the password immediately after first login!
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        """Create default superuser when visiting this URL."""
        email = 'admin@ocmena.com'
        password = 'Admin2026!'
        
        try:
            # Check if superuser already exists
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                return Response({
                    'success': True,
                    'message': 'Superuser already exists!',
                    'email': email,
                    'note': 'Use this account to login to Django Admin',
                    'django_admin_url': '/admin/',
                    'warning': 'If you forgot the password, you need to reset it via Railway CLI'
                }, status=status.HTTP_200_OK)
            
            # Create superuser
            user = User.objects.create_superuser(
                email=email,
                password=password,
                full_name='Admin User'
            )
            
            return Response({
                'success': True,
                'message': 'Superuser created successfully!',
                'credentials': {
                    'email': email,
                    'password': password,
                    'warning': '⚠️ CHANGE THIS PASSWORD IMMEDIATELY after first login!'
                },
                'next_steps': [
                    f'Go to /admin/',
                    f'Login with {email} / {password}',
                    'Change your password in admin',
                    'Create usher accounts',
                    'Create ticket types',
                    'Make your test user staff if needed'
                ]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Failed to create superuser'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
