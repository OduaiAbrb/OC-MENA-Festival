from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views_setup import CreateUshersView, CreateTicketTypesView

app_name = 'accounts'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.UserProfileView.as_view(), name='me'),
    path('password/change/', views.ChangePasswordView.as_view(), name='change-password'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Setup endpoints (one-time use)
    path('setup/create-ushers/', CreateUshersView.as_view(), name='create-ushers'),
    path('setup/create-ticket-types/', CreateTicketTypesView.as_view(), name='create-ticket-types'),
    
    # Address management
    path('addresses/', views.UserAddressListView.as_view(), name='address-list'),
    path('addresses/<uuid:address_id>/', views.UserAddressDetailView.as_view(), name='address-detail'),
]
