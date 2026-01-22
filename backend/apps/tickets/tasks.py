"""
Celery tasks for ticket-related async operations.
"""
import logging
from io import BytesIO
from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_invoice_pdf(self, order_id: str):
    """Generate PDF invoice for an order."""
    from apps.tickets.models import Order, Invoice
    
    try:
        order = Order.objects.select_related('buyer').prefetch_related('items__ticket_type').get(id=order_id)
        invoice = order.invoice
        
        # Generate PDF using reportlab
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Header
        elements.append(Paragraph("OC MENA Festival", styles['Heading1']))
        elements.append(Paragraph(f"Invoice #{invoice.invoice_number}", styles['Heading2']))
        elements.append(Spacer(1, 20))
        
        # Order info
        elements.append(Paragraph(f"Order: {order.order_number}", styles['Normal']))
        elements.append(Paragraph(f"Date: {order.paid_at.strftime('%B %d, %Y') if order.paid_at else 'N/A'}", styles['Normal']))
        elements.append(Paragraph(f"Customer: {order.buyer.full_name}", styles['Normal']))
        elements.append(Paragraph(f"Email: {order.buyer.email}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Items table
        data = [['Item', 'Qty', 'Unit Price', 'Total']]
        for item in order.items.all():
            data.append([
                item.ticket_type.name,
                str(item.quantity),
                f"${item.unit_price_cents / 100:.2f}",
                f"${item.total_cents / 100:.2f}"
            ])
        
        data.append(['', '', 'Subtotal:', f"${order.subtotal_cents / 100:.2f}"])
        data.append(['', '', 'Fees:', f"${order.fees_cents / 100:.2f}"])
        data.append(['', '', 'Total:', f"${order.total_cents / 100:.2f}"])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        doc.build(elements)
        
        # Save PDF
        from django.utils import timezone
        from django.core.files.base import ContentFile
        
        pdf_content = buffer.getvalue()
        buffer.close()
        
        invoice.pdf_file.save(f"{invoice.invoice_number}.pdf", ContentFile(pdf_content))
        invoice.generated_at = timezone.now()
        invoice.save()
        
        logger.info(f"Invoice PDF generated for order {order.order_number}")
        
        return {'status': 'success', 'invoice_number': invoice.invoice_number}
        
    except Exception as e:
        logger.error(f"Error generating invoice PDF: {e}")
        self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_order_confirmation_email(self, order_id: str):
    """Send order confirmation email with tickets."""
    from apps.tickets.models import Order
    
    try:
        order = Order.objects.select_related('buyer').prefetch_related(
            'tickets__ticket_type'
        ).get(id=order_id)
        
        tickets = order.tickets.all()
        
        subject = f"Your OC MENA Festival Tickets - Order #{order.order_number}"
        
        message = f"""
Hello {order.buyer.full_name},

Thank you for your purchase! Your order has been confirmed.

Order Details:
- Order Number: {order.order_number}
- Total: ${order.total_cents / 100:.2f}

Your Tickets:
"""
        for ticket in tickets:
            message += f"- {ticket.ticket_type.name}: {ticket.ticket_code}\n"
        
        message += f"""
You can view your tickets and QR codes by logging into your account:
{settings.FRONTEND_URL}/dashboard

We look forward to seeing you at the festival!

Best regards,
OC MENA Festival Team
        """
        
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[order.buyer.email]
        )
        email.send()
        
        logger.info(f"Order confirmation email sent for {order.order_number}")
        
        return {'status': 'success', 'order_number': order.order_number}
        
    except Exception as e:
        logger.error(f"Error sending order confirmation: {e}")
        self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_ticket_email(self, ticket_id: str):
    """Send individual ticket email."""
    from apps.tickets.models import Ticket
    
    try:
        ticket = Ticket.objects.select_related('owner', 'ticket_type').get(id=ticket_id)
        
        subject = f"Your OC MENA Festival Ticket - {ticket.ticket_type.name}"
        message = f"""
Hello {ticket.owner.full_name},

Here is your ticket for OC MENA Festival!

Ticket Details:
- Type: {ticket.ticket_type.name}
- Code: {ticket.ticket_code}
- Valid Days: {', '.join(ticket.ticket_type.valid_days) if ticket.ticket_type.valid_days else 'All festival days'}

View your QR code:
{settings.FRONTEND_URL}/dashboard

See you at the festival!

OC MENA Festival Team
        """
        
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[ticket.owner.email]
        )
        email.send()
        
        logger.info(f"Ticket email sent for {ticket.ticket_code}")
        
        return {'status': 'success'}
        
    except Exception as e:
        logger.error(f"Error sending ticket email: {e}")
        self.retry(exc=e, countdown=60)


@shared_task
def expire_pending_transfers():
    """Mark expired transfers as expired."""
    from django.utils import timezone
    from apps.tickets.models import Ticket, TicketTransfer
    
    expired = TicketTransfer.objects.filter(
        status=TicketTransfer.Status.PENDING,
        expires_at__lt=timezone.now()
    )
    
    count = 0
    for transfer in expired:
        transfer.status = TicketTransfer.Status.EXPIRED
        transfer.save(update_fields=['status'])
        
        # Restore ticket status
        Ticket.objects.filter(id=transfer.ticket_id).update(
            status=Ticket.Status.ISSUED
        )
        count += 1
    
    logger.info(f"Expired {count} pending transfers")
    return {'expired_count': count}
