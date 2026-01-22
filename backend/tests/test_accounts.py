"""
Tests for accounts app.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from apps.accounts.models import User, UserRole


@pytest.mark.django_db
class TestRegistration:
    """Test user registration."""
    
    def test_register_success(self, api_client):
        url = reverse('accounts:register')
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'full_name': 'New User'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert 'tokens' in response.data['data']
        assert User.objects.filter(email='newuser@example.com').exists()
    
    def test_register_duplicate_email(self, api_client, attendee_user):
        url = reverse('accounts:register')
        data = {
            'email': attendee_user.email,
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'full_name': 'Another User'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_password_mismatch(self, api_client):
        url = reverse('accounts:register')
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'DifferentPass123!',
            'full_name': 'New User'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    """Test user login."""
    
    def test_login_success(self, api_client, user_factory):
        user = user_factory(email='login@example.com', password='TestPass123!')
        url = reverse('accounts:login')
        data = {
            'email': 'login@example.com',
            'password': 'TestPass123!'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'tokens' in response.data['data']
    
    def test_login_invalid_password(self, api_client, attendee_user):
        url = reverse('accounts:login')
        data = {
            'email': attendee_user.email,
            'password': 'WrongPassword!'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserProfile:
    """Test user profile endpoints."""
    
    def test_get_profile(self, authenticated_client, attendee_user):
        url = reverse('accounts:me')
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['email'] == attendee_user.email
    
    def test_update_profile(self, authenticated_client):
        url = reverse('accounts:me')
        data = {'full_name': 'Updated Name'}
        
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['full_name'] == 'Updated Name'
    
    def test_unauthenticated_profile(self, api_client):
        url = reverse('accounts:me')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPermissions:
    """Test role-based permissions."""
    
    def test_staff_endpoint_requires_staff(self, authenticated_client):
        url = reverse('tickets:staff-comp')
        data = {
            'user_email': 'test@example.com',
            'ticket_type_id': '00000000-0000-0000-0000-000000000000',
            'quantity': 1,
            'reason': 'VIP'
        }
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_staff_can_access_staff_endpoints(self, staff_client):
        url = reverse('tickets:staff-orders')
        
        response = staff_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
