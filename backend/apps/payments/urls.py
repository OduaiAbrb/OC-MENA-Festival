from django.urls import path
from . import views
from . import amphitheater_views
from . import checkout_session_views

app_name = 'payments'

urlpatterns = [
    # Regular checkout
    path('checkout/guest/', views.GuestCheckoutView.as_view(), name='guest-checkout'),
    path('checkout/create-intent/', views.CreatePaymentIntentView.as_view(), name='create-intent'),
    path('checkout/confirm/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('checkout/demo-mode/', views.CheckDemoModeView.as_view(), name='check-demo-mode'),
    
    # Stripe Hosted Checkout
    path('checkout/create-session/', checkout_session_views.CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('webhook/checkout-session/', checkout_session_views.CheckoutSessionWebhookView.as_view(), name='checkout-session-webhook'),
    
    # Amphitheater checkout
    path('amphitheater/checkout/', amphitheater_views.AmphitheaterCheckoutView.as_view(), name='amphitheater-checkout'),
    path('amphitheater/confirm/', amphitheater_views.AmphitheaterConfirmPaymentView.as_view(), name='amphitheater-confirm'),
    
    # Webhooks and orders
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/<uuid:order_id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:order_id>/invoice/', views.OrderInvoiceView.as_view(), name='order-invoice'),
    path('orders/<uuid:order_id>/verify-payment/', views.VerifyPaymentView.as_view(), name='verify-payment'),
]
