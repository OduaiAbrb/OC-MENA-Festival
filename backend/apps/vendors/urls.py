from django.urls import path
from . import views

app_name = 'vendors'

urlpatterns = [
    # Public
    path('list/', views.VendorPublicListView.as_view(), name='vendor-list'),
    path('bazaar-registration/', views.BazaarVendorRegistrationView.as_view(), name='bazaar-registration'),
    path('food-registration/', views.FoodVendorRegistrationView.as_view(), name='food-registration'),
    
    # Vendor dashboard
    path('profile/', views.VendorProfileView.as_view(), name='vendor-profile'),
    path('dashboard/', views.VendorDashboardView.as_view(), name='vendor-dashboard'),
    path('setup-qr/', views.VendorSetupQRView.as_view(), name='vendor-setup-qr'),
    
    # Admin/Staff endpoints
    path('admin/booths/', views.BoothListView.as_view(), name='booth-list'),
    path('admin/booths/assign/', views.BoothAssignView.as_view(), name='booth-assign'),
    path('admin/vendors/', views.AdminVendorListView.as_view(), name='admin-vendor-list'),
    path('admin/bazaar-registrations/', views.AdminBazaarRegistrationsView.as_view(), name='admin-bazaar-registrations'),
    path('admin/food-registrations/', views.AdminFoodRegistrationsView.as_view(), name='admin-food-registrations'),
]
