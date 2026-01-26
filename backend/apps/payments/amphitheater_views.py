"""
API views for amphitheater checkout and payment.
"""
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from .amphitheater_checkout import AmphitheaterCheckoutService

logger = logging.getLogger(__name__)


class AmphitheaterCheckoutView(APIView):
    """Create order and payment intent for amphitheater tickets."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Checkout amphitheater tickets",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'hold_id': {'type': 'string', 'format': 'uuid'},
                    'billing_details': {'type': 'object'},
                },
                'required': ['hold_id']
            }
        }
    )
    def post(self, request):
        hold_id = request.data.get('hold_id')
        billing_details = request.data.get('billing_details', {})
        
        if not hold_id:
            return Response({
                'success': False,
                'error': 'hold_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user for guest checkout
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            # Guest checkout - create temporary user or use existing
            email = billing_details.get('email')
            if not email:
                return Response({
                    'success': False,
                    'error': 'Email is required for guest checkout'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use guest checkout service
            from .guest_checkout import GuestCheckoutService
            user = GuestCheckoutService.get_or_create_guest_user(
                email=email,
                full_name=f"{billing_details.get('firstName', '')} {billing_details.get('lastName', '')}".strip(),
                phone=billing_details.get('phone', '')
            )
        
        # Create order and payment intent
        result = AmphitheaterCheckoutService.create_amphitheater_order(
            hold_id=hold_id,
            user=user,
            billing_details=billing_details
        )
        
        if not result.get('success'):
            return Response({
                'success': False,
                'error': result.get('error', 'Failed to create order')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': result
        }, status=status.HTTP_201_CREATED)


class AmphitheaterConfirmPaymentView(APIView):
    """Confirm amphitheater payment (demo mode)."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Confirm amphitheater payment",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'order_id': {'type': 'string', 'format': 'uuid'},
                    'payment_intent_id': {'type': 'string'},
                },
                'required': ['order_id']
            }
        }
    )
    def post(self, request):
        order_id = request.data.get('order_id')
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not order_id:
            return Response({
                'success': False,
                'error': 'order_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            order = AmphitheaterCheckoutService.finalize_amphitheater_order(
                order_id=order_id,
                payment_intent_id=payment_intent_id
            )
            
            return Response({
                'success': True,
                'data': {
                    'order_number': order.order_number,
                    'status': order.status,
                    'message': 'Amphitheater tickets issued successfully'
                }
            })
            
        except Exception as e:
            logger.error(f"Error confirming amphitheater payment: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
