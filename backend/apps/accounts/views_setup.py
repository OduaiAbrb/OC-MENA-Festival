"""
Setup views for initial account creation.
These are temporary endpoints for easy setup.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

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
