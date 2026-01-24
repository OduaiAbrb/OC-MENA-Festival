"""
Email service for ticket confirmations and notifications.
"""
import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone

from .models import Order, Ticket

logger = logging.getLogger(__name__)


class TicketEmailService:
    """Service for sending ticket-related emails."""
    
    @staticmethod
    def send_order_confirmation(order: Order) -> bool:
        """
        Send order confirmation email with tickets.
        Returns True if successful, False otherwise.
        """
        try:
            tickets = order.tickets.select_related('ticket_type').all()
            
            subject = f"Your OC MENA Festival Tickets - Order #{order.order_number}"
            
            # Plain text version
            text_content = f"""
Hello {order.buyer.full_name}!

Thank you for your purchase! Your order has been confirmed.

Order Number: {order.order_number}
Order Date: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
Total: ${order.total_cents / 100:.2f}

TICKETS:
"""
            for ticket in tickets:
                text_content += f"\n- {ticket.ticket_type.name}"
                text_content += f"\n  Ticket Code: {ticket.ticket_code}"
                text_content += f"\n  Valid Days: {', '.join(ticket.ticket_type.valid_days)}\n"
            
            text_content += f"""

View your tickets and QR codes:
{settings.FRONTEND_URL}/dashboard

IMPORTANT INFORMATION:
- Save this email for your records
- You'll need to show your QR code at the entrance
- Tickets are non-transferable unless explicitly transferred through our platform
- Check-in begins at the event entrance

Questions? Contact us at {settings.DEFAULT_FROM_EMAIL}

See you at the festival!
OC MENA Festival Team
            """
            
            # HTML version (optional, can be enhanced later)
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .ticket {{ background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #666; margin-top: 30px; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
        </div>
        <div class="content">
            <p>Hello {order.buyer.full_name}!</p>
            <p>Your tickets for OC MENA Festival are ready!</p>
            
            <p><strong>Order #:</strong> {order.order_number}<br>
            <strong>Date:</strong> {order.created_at.strftime('%B %d, %Y at %I:%M %p')}<br>
            <strong>Total:</strong> ${order.total_cents / 100:.2f}</p>
            
            <h3>Your Tickets:</h3>
"""
            
            for ticket in tickets:
                html_content += f"""
            <div class="ticket">
                <strong>{ticket.ticket_type.name}</strong><br>
                Ticket Code: <code>{ticket.ticket_code}</code><br>
                Valid: {', '.join(ticket.ticket_type.valid_days)}
            </div>
"""
            
            html_content += f"""
            <a href="{settings.FRONTEND_URL}/dashboard" class="button">View Your Tickets</a>
            
            <h3>Important Information:</h3>
            <ul>
                <li>Save this email for your records</li>
                <li>Show your QR code at the entrance</li>
                <li>Tickets can be transferred through your dashboard</li>
                <li>Check-in begins at the event entrance</li>
            </ul>
            
            <div class="footer">
                <p>Questions? Contact us at {settings.DEFAULT_FROM_EMAIL}</p>
                <p>See you at the festival! 🎊</p>
                <p>&copy; {timezone.now().year} OC MENA Festival</p>
            </div>
        </div>
    </div>
</body>
</html>
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[order.buyer.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            logger.info(f"Order confirmation email sent for order {order.order_number}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send order confirmation email for order {order.order_number}: {e}")
            return False
    
    @staticmethod
    def send_vendor_setup_ticket(vendor_profile) -> bool:
        """
        Send vendor setup ticket email with QR code for early check-in.
        """
        try:
            subject = "Your OC MENA Festival Vendor Setup Pass"
            
            text_content = f"""
Hello {vendor_profile.contact_name}!

Your vendor booth has been confirmed for OC MENA Festival!

Business: {vendor_profile.business_name}
Setup Pass ID: {vendor_profile.setup_qr_id}

VENDOR SETUP INSTRUCTIONS:
- Setup day is ONE DAY BEFORE the festival
- Present this QR code at the vendor entrance
- You'll receive wristbands for your staff
- Booth assignment details will be provided on-site

View your vendor dashboard:
{settings.FRONTEND_URL}/vendor/dashboard

Questions? Contact vendor support at {settings.DEFAULT_FROM_EMAIL}

See you at setup!
OC MENA Festival Team
            """
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .pass {{ background: white; padding: 30px; margin: 20px 0; border: 3px solid #f5576c; border-radius: 10px; text-align: center; }}
        .pass-id {{ font-size: 24px; font-weight: bold; color: #f5576c; margin: 15px 0; letter-spacing: 2px; }}
        .button {{ display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #666; margin-top: 30px; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 Vendor Setup Pass</h1>
            <p>Your booth is confirmed!</p>
        </div>
        <div class="content">
            <p>Hello {vendor_profile.contact_name}!</p>
            <p>Welcome to OC MENA Festival as a vendor!</p>
            
            <div class="pass">
                <h3>{vendor_profile.business_name}</h3>
                <p>Setup Pass ID:</p>
                <div class="pass-id">{vendor_profile.setup_qr_id}</div>
                <p><small>Present this at vendor entrance</small></p>
            </div>
            
            <h3>Setup Day Instructions:</h3>
            <ul>
                <li><strong>When:</strong> ONE DAY BEFORE the festival</li>
                <li><strong>Where:</strong> Vendor entrance (details in confirmation)</li>
                <li><strong>What to bring:</strong> This QR code and valid ID</li>
                <li><strong>You'll receive:</strong> Staff wristbands and booth info</li>
            </ul>
            
            <a href="{settings.FRONTEND_URL}/vendor/dashboard" class="button">Vendor Dashboard</a>
            
            <div class="footer">
                <p>Questions? Contact vendor support at {settings.DEFAULT_FROM_EMAIL}</p>
                <p>Thank you for being part of OC MENA Festival! 🎪</p>
                <p>&copy; {timezone.now().year} OC MENA Festival</p>
            </div>
        </div>
    </div>
</body>
</html>
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[vendor_profile.contact_email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            logger.info(f"Vendor setup ticket sent for {vendor_profile.business_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send vendor setup ticket: {e}")
            return False
