"""
Ticket views for ticket management, transfers, upgrades, and staff actions.
"""
import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.accounts.permissions import IsStaffOrAdmin, IsOwnerOrStaff
from apps.accounts.models import User
from apps.accounts.services import AuditService
from apps.config.models import EventConfig

from .models import TicketType, Order, Ticket, TicketTransfer, TicketUpgrade
from .serializers import (
    TicketTypeSerializer, OrderSerializer, TicketSerializer, TicketDetailSerializer,
    TicketTransferSerializer, TransferCreateSerializer, TransferAcceptSerializer,
    TicketUpgradeSerializer, UpgradeCreateSerializer,
    StaffRefundSerializer, StaffCompSerializer, StaffUpgradeSerializer,
    ResendTicketsSerializer, ResendInvoiceSerializer
)
from .services import (
    QRCodeService, TransferService, UpgradeService, 
    RefundService, CompService
)

logger = logging.getLogger(__name__)


class TicketTypeListView(APIView):
    """List available ticket types."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    @extend_schema(summary="List ticket types", responses={200: TicketTypeSerializer(many=True)})
    def get(self, request):
        config = EventConfig.get_active()
        
        if not config.ticket_sales_enabled:
            return Response({
                'success': True,
                'data': [],
                'message': 'Ticket sales are not yet open'
            })
        
        ticket_types = TicketType.objects.filter(is_active=True).order_by('display_order')
        return Response({
            'success': True,
            'data': TicketTypeSerializer(ticket_types, many=True).data
        })


class MyTicketsView(APIView):
    """List current user's tickets."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="List my tickets", responses={200: TicketSerializer(many=True)})
    def get(self, request):
        tickets = Ticket.objects.filter(
            owner=request.user
        ).select_related('ticket_type', 'order').order_by('-issued_at')
        
        return Response({
            'success': True,
            'data': TicketSerializer(tickets, many=True).data
        })


class TicketDetailView(APIView):
    """Get ticket details."""
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    
    @extend_schema(summary="Get ticket details", responses={200: TicketDetailSerializer})
    def get(self, request, ticket_id):
        ticket = get_object_or_404(
            Ticket.objects.select_related('ticket_type', 'order', 'owner'),
            id=ticket_id
        )
        self.check_object_permissions(request, ticket)
        
        return Response({
            'success': True,
            'data': TicketDetailSerializer(ticket).data
        })


class TicketQRView(APIView):
    """Get ticket QR code data."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Get ticket QR code")
    def get(self, request, ticket_id):
        ticket = get_object_or_404(
            Ticket.objects.select_related('ticket_type'),
            id=ticket_id,
            owner=request.user
        )
        
        if ticket.status not in [Ticket.Status.ISSUED]:
            return Response({
                'success': False,
                'error': {'message': 'QR code not available for this ticket status'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        qr_data = QRCodeService.generate_qr_data(ticket)
        
        return Response({
            'success': True,
            'data': {
                'ticket_code': ticket.ticket_code,
                'qr_data': qr_data,
                'ticket_type': ticket.ticket_type.name,
                'valid_days': ticket.ticket_type.valid_days
            }
        })


class TransferListView(APIView):
    """List user's transfers."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="List my transfers", responses={200: TicketTransferSerializer(many=True)})
    def get(self, request):
        sent = TicketTransfer.objects.filter(
            from_user=request.user
        ).select_related('ticket', 'ticket__ticket_type').order_by('-created_at')
        
        received = TicketTransfer.objects.filter(
            to_user=request.user
        ).select_related('ticket', 'ticket__ticket_type').order_by('-created_at')
        
        return Response({
            'success': True,
            'data': {
                'sent': TicketTransferSerializer(sent, many=True).data,
                'received': TicketTransferSerializer(received, many=True).data
            }
        })


class TransferCreateView(APIView):
    """Create a ticket transfer."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Create transfer", request=TransferCreateSerializer)
    def post(self, request):
        config = EventConfig.get_active()
        if not config.transfer_enabled:
            return Response({
                'success': False,
                'error': {'message': 'Transfers are not currently enabled'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = TransferCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ticket = get_object_or_404(Ticket, id=serializer.validated_data['ticket_id'])
        
        try:
            transfer = TransferService.create_transfer(
                ticket=ticket,
                from_user=request.user,
                to_email=serializer.validated_data['to_email']
            )
            
            return Response({
                'success': True,
                'message': 'Transfer created. An email has been sent to the recipient.',
                'data': TicketTransferSerializer(transfer).data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class TransferCancelView(APIView):
    """Cancel a pending transfer."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Cancel transfer")
    def post(self, request, transfer_id):
        transfer = get_object_or_404(TicketTransfer, id=transfer_id)
        
        try:
            TransferService.cancel_transfer(transfer, request.user)
            
            return Response({
                'success': True,
                'message': 'Transfer cancelled'
            })
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class TransferAcceptView(APIView):
    """Accept a transfer."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Accept transfer", request=TransferAcceptSerializer)
    def post(self, request):
        serializer = TransferAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            ticket = TransferService.accept_transfer(
                token=serializer.validated_data['token'],
                accepting_user=request.user
            )
            
            return Response({
                'success': True,
                'message': 'Transfer accepted! The ticket is now yours.',
                'data': TicketSerializer(ticket).data
            })
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class UpgradeListView(APIView):
    """List user's upgrades."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="List my upgrades", responses={200: TicketUpgradeSerializer(many=True)})
    def get(self, request):
        upgrades = TicketUpgrade.objects.filter(
            ticket__owner=request.user
        ).select_related('ticket', 'from_type', 'to_type').order_by('-created_at')
        
        return Response({
            'success': True,
            'data': TicketUpgradeSerializer(upgrades, many=True).data
        })


class UpgradeCreateView(APIView):
    """Create an upgrade request."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="Create upgrade", request=UpgradeCreateSerializer)
    def post(self, request):
        config = EventConfig.get_active()
        if not config.upgrade_enabled:
            return Response({
                'success': False,
                'error': {'message': 'Upgrades are not currently enabled'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UpgradeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ticket = get_object_or_404(Ticket, id=serializer.validated_data['ticket_id'])
        to_type = get_object_or_404(TicketType, id=serializer.validated_data['to_type_id'])
        
        try:
            upgrade = UpgradeService.create_upgrade(
                ticket=ticket,
                to_type=to_type,
                user=request.user
            )
            
            return Response({
                'success': True,
                'data': TicketUpgradeSerializer(upgrade).data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


# Staff endpoints

class StaffCompView(APIView):
    """Staff: Issue complimentary tickets."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Issue comp tickets", request=StaffCompSerializer)
    def post(self, request):
        serializer = StaffCompSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            user = User.objects.get(email=data['user_email'].lower())
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': {'message': 'User not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        ticket_type = get_object_or_404(TicketType, id=data['ticket_type_id'])
        
        comp, tickets = CompService.issue_comp(
            issued_by=request.user,
            to_user=user,
            ticket_type=ticket_type,
            quantity=data['quantity'],
            reason=data['reason'],
            notes=data.get('notes', '')
        )
        
        AuditService.log(
            actor=request.user,
            action_type='COMP',
            target_type='User',
            target_id=str(user.id),
            metadata={
                'ticket_type': ticket_type.name,
                'quantity': data['quantity'],
                'reason': data['reason']
            },
            request=request
        )
        
        return Response({
            'success': True,
            'message': f'{data["quantity"]} comp ticket(s) issued to {user.email}',
            'data': {
                'tickets': TicketSerializer(tickets, many=True).data
            }
        }, status=status.HTTP_201_CREATED)


class StaffRefundView(APIView):
    """Staff: Process refund."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Process refund", request=StaffRefundSerializer)
    def post(self, request):
        serializer = StaffRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        order = get_object_or_404(Order, id=data['order_id'])
        
        try:
            refund = RefundService.create_refund(
                order=order,
                initiated_by=request.user,
                amount_cents=data.get('amount_cents'),
                reason=data['reason'],
                notes=data.get('notes', '')
            )
            
            AuditService.log(
                actor=request.user,
                action_type='REFUND',
                target_type='Order',
                target_id=str(order.id),
                metadata={
                    'amount_cents': refund.amount_cents,
                    'reason': data['reason']
                },
                request=request
            )
            
            # TODO: Process via Stripe in payments service
            
            return Response({
                'success': True,
                'message': f'Refund of ${refund.amount_cents / 100:.2f} initiated',
                'data': {'refund_id': str(refund.id)}
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class StaffUpgradeView(APIView):
    """Staff: Process comp upgrade."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Process upgrade", request=StaffUpgradeSerializer)
    def post(self, request):
        serializer = StaffUpgradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        ticket = get_object_or_404(Ticket, id=data['ticket_id'])
        to_type = get_object_or_404(TicketType, id=data['to_type_id'])
        
        try:
            upgrade = UpgradeService.comp_upgrade(
                ticket=ticket,
                to_type=to_type,
                staff_user=request.user
            )
            
            AuditService.log(
                actor=request.user,
                action_type='UPGRADE',
                target_type='Ticket',
                target_id=str(ticket.id),
                metadata={
                    'from_type': upgrade.from_type.name,
                    'to_type': upgrade.to_type.name,
                    'is_comped': True
                },
                request=request
            )
            
            return Response({
                'success': True,
                'message': f'Ticket upgraded to {to_type.name}',
                'data': TicketUpgradeSerializer(upgrade).data
            })
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': {'message': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class StaffResendTicketsView(APIView):
    """Staff: Resend ticket emails."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Resend tickets", request=ResendTicketsSerializer)
    def post(self, request):
        serializer = ResendTicketsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # TODO: Implement email resend via Celery task
        
        AuditService.log(
            actor=request.user,
            action_type='RESEND_TICKET',
            target_type='Order' if serializer.validated_data.get('order_id') else 'Ticket',
            target_id=str(serializer.validated_data.get('order_id') or serializer.validated_data.get('ticket_id')),
            request=request
        )
        
        return Response({
            'success': True,
            'message': 'Tickets resent successfully'
        })


class StaffResendInvoiceView(APIView):
    """Staff: Resend invoice email."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Resend invoice", request=ResendInvoiceSerializer)
    def post(self, request):
        serializer = ResendInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order = get_object_or_404(Order, id=serializer.validated_data['order_id'])
        
        # TODO: Implement invoice resend via Celery task
        
        AuditService.log(
            actor=request.user,
            action_type='RESEND_INVOICE',
            target_type='Order',
            target_id=str(order.id),
            request=request
        )
        
        return Response({
            'success': True,
            'message': 'Invoice resent successfully'
        })


class StaffOrderListView(APIView):
    """Staff: List all orders."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="List orders", responses={200: OrderSerializer(many=True)})
    def get(self, request):
        orders = Order.objects.select_related('buyer').prefetch_related('items').order_by('-created_at')
        
        # Filters
        status_filter = request.query_params.get('status')
        email = request.query_params.get('email')
        
        if status_filter:
            orders = orders.filter(status=status_filter)
        if email:
            orders = orders.filter(buyer__email__icontains=email)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        start = (page - 1) * per_page
        end = start + per_page
        
        total = orders.count()
        orders = orders[start:end]
        
        return Response({
            'success': True,
            'data': OrderSerializer(orders, many=True).data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        })


class StaffOrderDetailView(APIView):
    """Staff: Get order details."""
    permission_classes = [IsStaffOrAdmin]
    
    @extend_schema(summary="Get order details", responses={200: OrderSerializer})
    def get(self, request, order_id):
        order = get_object_or_404(
            Order.objects.select_related('buyer').prefetch_related('items', 'tickets'),
            id=order_id
        )
        
        return Response({
            'success': True,
            'data': {
                'order': OrderSerializer(order).data,
                'tickets': TicketSerializer(order.tickets.all(), many=True).data
            }
        })
