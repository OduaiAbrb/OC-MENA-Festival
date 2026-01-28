"""
Config serializers.
"""
from rest_framework import serializers
from .models import EventConfig, Sponsor, ScheduleItem, ContactSubmission, NewsletterSubscriber


class PublicConfigSerializer(serializers.ModelSerializer):
    """Serializer for public event configuration."""
    
    class Meta:
        model = EventConfig
        fields = [
            'event_name', 'event_tagline', 'event_start_date', 'event_end_date',
            'event_location', 'event_address', 'ticket_sales_enabled',
            'transfer_enabled', 'upgrade_enabled', 'schedule_published',
            'vendors_published', 'sponsors_published', 'apple_wallet_enabled',
            'google_wallet_enabled', 'coming_soon_mode', 'coming_soon_message',
            'amphitheater_visible'
        ]


class SponsorSerializer(serializers.ModelSerializer):
    """Serializer for sponsors."""
    
    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'tier', 'logo_url', 'website_url', 'description']


class ScheduleItemSerializer(serializers.ModelSerializer):
    """Serializer for schedule items."""
    
    class Meta:
        model = ScheduleItem
        fields = [
            'id', 'title', 'description', 'category', 'location',
            'day', 'start_time', 'end_time', 'performer_name',
            'image_url', 'is_featured'
        ]


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for contact form submissions."""
    
    class Meta:
        model = ContactSubmission
        fields = ['first_name', 'last_name', 'email', 'phone', 'subject', 'message']
    
    def validate_subject(self, value):
        valid_subjects = [choice[0] for choice in ContactSubmission.SubjectChoices.choices]
        # Map frontend values to backend values
        subject_map = {
            'Sponsor Inquiry': 'SPONSOR_INQUIRY',
            'Vendor Inquiry': 'VENDOR_INQUIRY',
            'General Question': 'GENERAL_QUESTION',
            'Press Inquiry': 'PRESS_INQUIRY',
            'Other': 'OTHER',
        }
        return subject_map.get(value, value)


class NewsletterSubscribeSerializer(serializers.Serializer):
    """Serializer for newsletter subscription."""
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    source = serializers.CharField(max_length=50, required=False, default='website')
    
    def validate_email(self, value):
        return value.lower()
    
    def create(self, validated_data):
        email = validated_data['email']
        # Update or create subscriber
        subscriber, created = NewsletterSubscriber.objects.update_or_create(
            email=email,
            defaults={
                'first_name': validated_data.get('first_name', ''),
                'source': validated_data.get('source', 'website'),
                'is_active': True,
                'unsubscribed_at': None,
            }
        )
        return subscriber, created
