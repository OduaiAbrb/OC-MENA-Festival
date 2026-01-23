"""
Config views for public information and contact.
"""
import logging
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from .models import EventConfig, Sponsor, ScheduleItem, ContactSubmission
from .serializers import (
    PublicConfigSerializer,
    SponsorSerializer,
    ScheduleItemSerializer,
    ContactSubmissionSerializer,
    NewsletterSubscribeSerializer,
)

logger = logging.getLogger(__name__)

CACHE_TIMEOUT = 300  # 5 minutes


class PublicConfigView(APIView):
    """Public event configuration endpoint."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Get public event configuration",
        responses={200: PublicConfigSerializer}
    )
    def get(self, request):
        cache_key = 'public_config'
        cached = cache.get(cache_key)
        
        if cached:
            return Response({'success': True, 'data': cached})
        
        config = EventConfig.get_active()
        data = PublicConfigSerializer(config).data
        
        cache.set(cache_key, data, timeout=CACHE_TIMEOUT)
        
        return Response({'success': True, 'data': data})


class SponsorsListView(APIView):
    """Public sponsors list endpoint."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Get sponsors list",
        responses={200: SponsorSerializer(many=True)}
    )
    def get(self, request):
        config = EventConfig.get_active()
        
        if not config.sponsors_published:
            return Response({
                'success': True,
                'data': [],
                'message': 'Sponsors list coming soon'
            })
        
        cache_key = 'sponsors_list'
        cached = cache.get(cache_key)
        
        if cached:
            return Response({'success': True, 'data': cached})
        
        sponsors = Sponsor.objects.filter(is_active=True)
        data = SponsorSerializer(sponsors, many=True).data
        
        cache.set(cache_key, data, timeout=CACHE_TIMEOUT)
        
        return Response({'success': True, 'data': data})


class ScheduleListView(APIView):
    """Public schedule list endpoint."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Get event schedule",
        responses={200: ScheduleItemSerializer(many=True)}
    )
    def get(self, request):
        config = EventConfig.get_active()
        
        if not config.schedule_published:
            return Response({
                'success': True,
                'data': [],
                'message': 'Schedule coming soon'
            })
        
        cache_key = 'schedule_list'
        day = request.query_params.get('day')
        category = request.query_params.get('category')
        
        if day:
            cache_key += f'_day_{day}'
        if category:
            cache_key += f'_cat_{category}'
        
        cached = cache.get(cache_key)
        if cached:
            return Response({'success': True, 'data': cached})
        
        queryset = ScheduleItem.objects.filter(is_active=True)
        
        if day:
            queryset = queryset.filter(day=day)
        if category:
            queryset = queryset.filter(category=category)
        
        data = ScheduleItemSerializer(queryset, many=True).data
        cache.set(cache_key, data, timeout=CACHE_TIMEOUT)
        
        return Response({'success': True, 'data': data})


class ContactSubmitView(APIView):
    """Contact form submission endpoint."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Submit contact form",
        request=ContactSubmissionSerializer,
        responses={
            201: {"type": "object", "properties": {"success": {"type": "boolean"}, "message": {"type": "string"}}}
        }
    )
    def post(self, request):
        serializer = ContactSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()
        
        # Send notification email to admin
        try:
            send_mail(
                subject=f"[OC MENA Festival] New Contact: {submission.subject}",
                message=f"""
New contact form submission:

Name: {submission.first_name} {submission.last_name}
Email: {submission.email}
Phone: {submission.phone or 'Not provided'}
Subject: {submission.get_subject_display()}

Message:
{submission.message}
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send contact notification: {e}")
        
        return Response({
            'success': True,
            'message': 'Thank you for your message! We will get back to you soon.'
        }, status=status.HTTP_201_CREATED)


class NewsletterSubscribeView(APIView):
    """Newsletter subscription endpoint."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Subscribe to newsletter",
        request=NewsletterSubscribeSerializer,
        responses={
            201: {"type": "object", "properties": {"success": {"type": "boolean"}, "message": {"type": "string"}}}
        }
    )
    def post(self, request):
        serializer = NewsletterSubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip_address = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        subscriber, created = serializer.save()
        if ip_address:
            subscriber.ip_address = ip_address
            subscriber.save(update_fields=['ip_address'])
        
        logger.info(f"Newsletter subscription: {subscriber.email} (new={created})")
        
        return Response({
            'success': True,
            'message': 'Thank you for subscribing to our newsletter!'
        }, status=status.HTTP_201_CREATED)
