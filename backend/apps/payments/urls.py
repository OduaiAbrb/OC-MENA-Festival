from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('checkout/guest/', views.GuestCheckoutView.as_view(), name='guest-checkout'),
    path('checkout/create-intent/', views.CreatePaymentIntentView.as_view(), name='create-intent'),
    path('checkout/confirm/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('checkout/demo-mode/', views.CheckDemoModeView.as_view(), name='check-demo-mode'),
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/<uuid:order_id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:order_id>/invoice/', views.OrderInvoiceView.as_view(), name='order-invoice'),
]
