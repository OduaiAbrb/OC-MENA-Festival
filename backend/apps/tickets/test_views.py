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
                
                # Test SendGrid API directly with detailed error handling
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                from python_http_client.exceptions import HTTPError
                
                try:
                    logger.info(f"SendGrid API Key present: {bool(settings.SENDGRID_API_KEY)}")
                    logger.info(f"From email: {settings.DEFAULT_FROM_EMAIL}")
                    logger.info(f"To email: {test_email}")
                    
                    message = Mail(
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to_emails=test_email,
                        subject='Test Email from OC MENA Festival',
                        plain_text_content='This is a test email to verify SendGrid is working correctly.',
                        html_content='<strong>This is a test email to verify SendGrid is working correctly.</strong>'
                    )
                    
                    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
                    response = sg.send(message)
                    
                    logger.info(f"SendGrid response status: {response.status_code}")
                    logger.info(f"SendGrid response body: {response.body}")
                    
                    return Response({
                        'success': True,
                        'message': 'Test email sent successfully!',
                        'data': {
                            'recipient': test_email,
                            'status_code': response.status_code,
                            'response_body': str(response.body),
                            'note': 'Email sent via SendGrid API'
                        }
                    })
                except HTTPError as e:
                    logger.error(f"SendGrid HTTPError: {e}")
                    logger.error(f"Status code: {e.status_code}")
                    logger.error(f"Body: {e.body}")
                    logger.error(f"Headers: {e.headers}")
                    return Response({
                        'success': False,
                        'error': f'SendGrid HTTP Error {e.status_code}',
                        'details': str(e.body),
                        'headers': str(e.headers)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                except Exception as e:
                    logger.error(f"Failed to send test email: {e}")
                    import traceback
                    return Response({
                        'success': False,
                        'error': f'Failed to send email: {str(e)}',
                        'traceback': traceback.format_exc()
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
