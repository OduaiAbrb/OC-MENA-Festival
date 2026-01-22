"""
URL configuration for OC MENA Festival backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from .views import HealthCheckView


def root_view(request):
    return JsonResponse({
        'name': 'OC MENA Festival API',
        'version': '1.0.0',
        'docs': '/api/docs/',
        'health': '/api/health/',
    })


urlpatterns = [
    # Root
    path('', root_view, name='root'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # App URLs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/config/', include('apps.config.urls')),
    path('api/tickets/', include('apps.tickets.urls')),
    path('api/vendors/', include('apps.vendors.urls')),
    path('api/scan/', include('apps.scanning.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/wallet/', include('apps.wallet.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
