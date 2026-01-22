"""
Pytest configuration and fixtures for the OC MENA Festival backend.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def user_factory(db):
    """Factory for creating users."""
    def create_user(
        email='test@example.com',
        password='testpass123',
        full_name='Test User',
        role='ATTENDEE',
        **kwargs
    ):
        return User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role=role,
            **kwargs
        )
    return create_user


@pytest.fixture
def attendee_user(user_factory):
    """Create a regular attendee user."""
    return user_factory(
        email='attendee@example.com',
        role='ATTENDEE'
    )


@pytest.fixture
def vendor_user(user_factory):
    """Create a vendor user."""
    return user_factory(
        email='vendor@example.com',
        role='VENDOR'
    )


@pytest.fixture
def staff_user(user_factory):
    """Create a staff scanner user."""
    return user_factory(
        email='staff@example.com',
        role='STAFF_SCANNER'
    )


@pytest.fixture
def admin_user(user_factory):
    """Create an admin user."""
    return user_factory(
        email='admin@example.com',
        role='ADMIN'
    )


@pytest.fixture
def authenticated_client(api_client, attendee_user):
    """Return an API client authenticated as an attendee."""
    refresh = RefreshToken.for_user(attendee_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def staff_client(api_client, staff_user):
    """Return an API client authenticated as staff."""
    refresh = RefreshToken.for_user(staff_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Return an API client authenticated as admin."""
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client
