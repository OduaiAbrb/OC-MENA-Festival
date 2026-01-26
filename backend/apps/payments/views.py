"""
Payment views for checkout and webhooks.
"""
import logging
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.config.models import EventConfig
from apps.tickets.models import Order, TicketType
from apps.tickets.serializers import OrderSerializer
from apps.tickets.services import OrderService

from .serializers import CreatePaymentIntentSerializer, ConfirmPaymentSerializer, GuestCheckoutSerializer
from .services import StripeService
from .guest_checkout import GuestCheckoutService

logger = logging.getLogger(__name__)


class GuestCheckoutView(APIView):
    """Create payment intent for guest checkout (no forced registration)."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(
        summary="Guest checkout - create payment intent",
        request=GuestCheckoutSerializer
    )
    def post(self, request):
        config = EventConfig.get_active()
        if not config.ticket_sales_enabled:
            return Response({
                'success': False,
                'error': {'message': 'Ticket sales are not currently open'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = GuestCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            # Get or create user account for guest
            user, created = GuestCheckoutService.get_or_create_user(
                email=data['email'],
                full_name=data['full_name'],
                phone=data.get('phone', '')
            )
            
            # Create order
            order = OrderService.create_order(
                buyer=user,
                items=data['items'],
                idempotency_key=data['idempotency_key']
            )
            
            # Create payment intent
            result = StripeService.create_payment_intent(
                order=order,
                idempotency_key=data['idempotency_key']
            )
            
            # Send account creation email if new user
            if created:
                try:
                    GuestCheckoutService.send_account_created_email(user, order.order_number)
                except Exception as e:
                    logger.error(f"Failed to send account creation email: {e}")
            
            return Response({
                'success': True,
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_cents': order.total_cents,
                    'client_secret': result['client_secret'],
                    'payment_intent_id': result['payment_intent_id'],
                    'account_created': created
                }
            })
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': {'message': f'Server error: {str(e)}'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreatePaymentIntentView(APIView):
    """Create a payment intent for checkout (authenticated users)."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Create payment intent",
        request=CreatePaymentIntentSerializer
    )
    def post(self, request):
        config = EventConfig.get_active()
        if not config.ticket_sales_enabled:
            return Response({
                'success': False,
                'error': {'message': 'Ticket sales are not currently open'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            # Create order
            order = OrderService.create_order(
                buyer=request.user,
                items=data['items'],
                idempotency_key=data['idempotency_key'],
                payment_method=data.get('payment_method', 'card')
            )
            
            # Create payment intent
            result = StripeService.create_payment_intent(
                order=order,
                idempotency_key=data['idempotency_key']
            )
            
            return Response({
                'success': True,
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_cents': order.total_cents,
                    'client_secret': result['client_secret'],
                    'payment_intent_id': result['payment_intent_id']
                }
            })
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': {'message': f'Server error: {str(e)}'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmPaymentView(APIView):
    """Confirm payment was successful (client-side confirmation)."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Confirm payment",
        request=ConfirmPaymentSerializer
    )
    def post(self, request):
        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order = get_object_or_404(Order, id=serializer.validated_data['order_id'])
        
        if order.buyer != request.user:
            return Response({
                'success': False,
                'error': {'message': 'Order not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if this is a demo payment that needs confirmation
        if order.stripe_payment_intent_id and order.stripe_payment_intent_id.startswith('pi_demo_'):
            try:
                result = StripeService.confirm_demo_payment(str(order.id))
                return Response({
                    'success': True,
                    'data': {
                        'order_number': result['order_number'],
                        'status': 'PAID',
                        'message': result['message'],
                        'demo_mode': True
                    }
                })
            except ValueError as e:
                return Response({
                    'success': False,
                    'error': {'message': str(e)}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Finalize the order - generate tickets and set status
        try:
            payment_intent_id = serializer.validated_data['payment_intent_id']
            finalized_order = OrderService.finalize_order(
                order_id=str(order.id),
                payment_intent_id=payment_intent_id
            )
            
            return Response({
                'success': True,
                'data': {
                    'order_number': finalized_order.order_number,
                    'status': finalized_order.status,
                    'message': 'Payment confirmed and tickets issued' if finalized_order.status == Order.Status.PAID else 'Payment is being processed'
                }
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': {'message': f'Failed to finalize order: {str(e)}'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckDemoModeView(APIView):
    """Check if the system is running in demo mode."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="Check demo mode status")
    def get(self, request):
        return Response({
            'success': True,
            'data': {
                'demo_mode': StripeService.is_demo_mode(),
                'message': 'Payment system is in DEMO mode. No real charges will be made.' if StripeService.is_demo_mode() else 'Payment system is LIVE.'
            }
        })


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """Stripe webhook endpoint."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="Stripe webhook")
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        if not sig_header:
            return Response({'error': 'Missing signature'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = StripeService.handle_webhook_event(payload, sig_header)
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error(f"Webhook error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Webhook processing error: {e}")
            return Response({'error': 'Processing error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderListView(APIView):
    """List user's orders."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="List my orders", responses={200: OrderSerializer(many=True)})
    def get(self, request):
        orders = Order.objects.filter(
            buyer=request.user
        ).prefetch_related('items', 'items__ticket_type').order_by('-created_at')
        
        return Response({
            'success': True,
            'data': OrderSerializer(orders, many=True).data
        })


class OrderDetailView(APIView):
    """Get order details."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Get order details", responses={200: OrderSerializer})
    def get(self, request, order_id):
        order = get_object_or_404(
            Order.objects.prefetch_related('items', 'tickets'),
            id=order_id,
            buyer=request.user
        )
        
        return Response({
            'success': True,
            'data': OrderSerializer(order).data
        })


class OrderInvoiceView(APIView):
    """Get order invoice."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Get order invoice")
    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, buyer=request.user)
        
        if not hasattr(order, 'invoice'):
            return Response({
                'success': False,
                'error': {'message': 'Invoice not available'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'data': {
                'invoice_number': order.invoice.invoice_number,
                'pdf_url': order.invoice.pdf_url or None,
                'generated_at': order.invoice.generated_at
            }
        })
