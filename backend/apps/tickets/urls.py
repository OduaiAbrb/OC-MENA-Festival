from django.urls import path, include
from . import views
from .test_views import TestEmailView

app_name = 'tickets'

urlpatterns = [
    # Test endpoint (development only)
    path('test/send-email/', TestEmailView.as_view(), name='test-email'),
    
    # Amphitheater ticketing
    path('amphitheater/', include('apps.tickets.amphitheater_urls')),
    
    # Public
    path('types/', views.TicketTypeListView.as_view(), name='ticket-types'),
    
    # User tickets
    path('my/', views.MyTicketsView.as_view(), name='my-tickets'),
    path('<uuid:ticket_id>/', views.TicketDetailView.as_view(), name='ticket-detail'),
    path('<uuid:ticket_id>/qr/', views.TicketQRView.as_view(), name='ticket-qr'),
    path('<uuid:ticket_id>/pdf/', views.TicketPDFView.as_view(), name='ticket-pdf'),
    path('order/<uuid:order_id>/pdf/', views.OrderTicketsPDFView.as_view(), name='order-tickets-pdf'),
    
    # Transfers
    path('transfers/', views.TransferListView.as_view(), name='transfer-list'),
    path('transfers/create/', views.TransferCreateView.as_view(), name='transfer-create'),
    path('transfers/<uuid:transfer_id>/cancel/', views.TransferCancelView.as_view(), name='transfer-cancel'),
    path('transfers/accept/', views.TransferAcceptView.as_view(), name='transfer-accept'),
    
    # Upgrades
    path('upgrades/', views.UpgradeListView.as_view(), name='upgrade-list'),
    path('upgrades/create/', views.UpgradeCreateView.as_view(), name='upgrade-create'),
    
    # Staff endpoints
    path('staff/comp/', views.StaffCompView.as_view(), name='staff-comp'),
    path('staff/refund/', views.StaffRefundView.as_view(), name='staff-refund'),
    path('staff/upgrade/', views.StaffUpgradeView.as_view(), name='staff-upgrade'),
    path('staff/resend-tickets/', views.StaffResendTicketsView.as_view(), name='staff-resend-tickets'),
    path('staff/resend-invoice/', views.StaffResendInvoiceView.as_view(), name='staff-resend-invoice'),
    path('staff/orders/', views.StaffOrderListView.as_view(), name='staff-orders'),
    path('staff/orders/<uuid:order_id>/', views.StaffOrderDetailView.as_view(), name='staff-order-detail'),
]
