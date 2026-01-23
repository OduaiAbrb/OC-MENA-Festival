from django.urls import path
from . import views

app_name = 'config'

urlpatterns = [
    path('public/', views.PublicConfigView.as_view(), name='public-config'),
    path('sponsors/', views.SponsorsListView.as_view(), name='sponsors-list'),
    path('schedule/', views.ScheduleListView.as_view(), name='schedule-list'),
    path('contact/', views.ContactSubmitView.as_view(), name='contact-submit'),
    path('newsletter/', views.NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]
