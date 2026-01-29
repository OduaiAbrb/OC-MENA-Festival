"""
URL routing for amphitheater ticketing API.
"""
from django.urls import path
from . import amphitheater_views

app_name = 'amphitheater'

urlpatterns = [
    # Venue and sections
    path('venues/', amphitheater_views.VenueListView.as_view(), name='venue-list'),
    path('venues/<uuid:venue_id>/sections/', amphitheater_views.VenueSectionsView.as_view(), name='venue-sections'),
    path('event-dates/', amphitheater_views.EventDatesView.as_view(), name='event-dates'),
    
    # Availability and holds - frontend expects these paths
    path('seats/availability/', amphitheater_views.CheckAvailabilityView.as_view(), name='seats-availability'),
    path('seats/hold/', amphitheater_views.CreateSeatHoldView.as_view(), name='seats-hold'),
    path('check-availability/', amphitheater_views.CheckAvailabilityView.as_view(), name='check-availability'),
    path('holds/create/', amphitheater_views.CreateSeatHoldView.as_view(), name='create-hold'),
    path('holds/<uuid:hold_id>/release/', amphitheater_views.ReleaseSeatHoldView.as_view(), name='release-hold'),
    
    # User tickets
    path('my-tickets/', amphitheater_views.MyAmphitheaterTicketsView.as_view(), name='my-tickets'),
]
