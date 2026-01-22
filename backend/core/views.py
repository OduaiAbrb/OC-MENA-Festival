"""
Core views including health check endpoint.
"""
import logging
from django.db import connection
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """
    Health check endpoint for monitoring.
    Checks: application, database, and redis connectivity.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Health Check",
        description="Returns health status of the application, database, and cache",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "app": {"type": "object"},
                    "database": {"type": "object"},
                    "cache": {"type": "object"},
                }
            }
        }
    )
    def get(self, request):
        health_status = {
            'status': 'healthy',
            'app': {'status': 'ok'},
            'database': {'status': 'unknown'},
            'cache': {'status': 'unknown'},
        }
        
        overall_healthy = True
        
        # Check database
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
            health_status['database'] = {'status': 'ok'}
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            health_status['database'] = {'status': 'error', 'message': str(e)}
            overall_healthy = False
        
        # Check Redis cache
        try:
            cache.set('health_check', 'ok', timeout=10)
            result = cache.get('health_check')
            if result == 'ok':
                health_status['cache'] = {'status': 'ok'}
            else:
                health_status['cache'] = {'status': 'error', 'message': 'Cache read/write failed'}
                overall_healthy = False
        except Exception as e:
            logger.error(f"Cache health check failed: {e}")
            health_status['cache'] = {'status': 'error', 'message': str(e)}
            overall_healthy = False
        
        if not overall_healthy:
            health_status['status'] = 'unhealthy'
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response(health_status, status=status.HTTP_200_OK)
