"""
Test endpoint to trigger email sending - for testing only.
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema

from .models import Order, TicketType
from .services import OrderService
from .email_service import TicketEmailService
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class TestEmailView(APIView):
    """Test endpoint to send order confirmation email."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="Test email sending (development only)")
    def post(self, request):
        """Send a test order confirmation email."""
        
        # Get email from request or use default
        test_email = request.data.get('email', 'oduaiaburub@gmail.com')
        
        try:
            # Check for existing paid order
            order = Order.objects.filter(status='PAID').order_by('-created_at').first()
            
            if not order:
                # No paid orders, create a test one
                logger.info("No paid orders found, creating test order...")
                
                # Get or create test user
                user, created = User.objects.get_or_create(
                    email=test_email,
                    defaults={
                        'full_name': 'Test User',
                        'role': 'ATTENDEE'
                    }
                )
                
                if created:
                    user.set_password('testpass123')
                    user.save()
                    logger.info(f"Created test user: {test_email}")
                
                # Just send a simple test email without creating order
                from django.core.mail import send_mail
                
                try:
                    send_mail(
                        'Test Email from OC MENA Festival',
                        'This is a test email to verify email sending works.',
                        settings.DEFAULT_FROM_EMAIL,
                        [test_email],
                        fail_silently=False,
                    )
                    
                    return Response({
                        'success': True,
                        'message': 'Test email sent successfully!',
                        'data': {
                            'recipient': test_email,
                            'note': 'Simple test email sent without order creation'
                        }
                    })
                except Exception as e:
                    logger.error(f"Failed to send test email: {e}")
                    return Response({
                        'success': False,
                        'error': f'Failed to send email: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Create test order
                order = OrderService.create_order(
                    buyer=user,
                    items=[{
                        'ticket_type_id': str(ticket_type.id),
                        'quantity': 1
                    }],
                    idempotency_key=f'test-email-{user.id}'
                )
                
                # Mark as paid and finalize
                order.status = 'PAID'
                order.save()
                
                OrderService.finalize_order(order)
                
                logger.info(f"Created test order: {order.order_number}")
            
            # Override buyer email if different
            original_email = order.buyer.email
            if test_email != original_email:
                order.buyer.email = test_email
            
            # Send email
            logger.info(f"Sending test email to: {test_email}")
            result = TicketEmailService.send_order_confirmation(order)
            
            # Restore original email
            if test_email != original_email:
                order.buyer.email = original_email
            
            if result:
                return Response({
                    'success': True,
                    'message': 'Test email sent successfully!',
                    'data': {
                        'order_number': order.order_number,
                        'recipient': test_email,
                        'total': f'${order.total_cents / 100:.2f}',
                        'tickets_count': order.tickets.count()
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Email failed to send. Check logs for details.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error in test email endpoint: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
