from django.urls import path
from . import views

app_name = 'scanning'

urlpatterns = [
    path('quick/', views.QuickScanView.as_view(), name='quick-scan'),
    path('validate/', views.ScanValidateView.as_view(), name='scan-validate'),
    path('commit/', views.ScanCommitView.as_view(), name='scan-commit'),
    path('logs/', views.ScanLogListView.as_view(), name='scan-logs'),
    path('stats/', views.ScanStatsView.as_view(), name='scan-stats'),
]
