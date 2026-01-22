from django.urls import path
from . import views

app_name = 'wallet'

urlpatterns = [
    path('apple/create-pass/', views.AppleWalletCreatePassView.as_view(), name='apple-create-pass'),
    path('google/create-pass/', views.GoogleWalletCreatePassView.as_view(), name='google-create-pass'),
    path('passes/', views.PassListView.as_view(), name='pass-list'),
]
