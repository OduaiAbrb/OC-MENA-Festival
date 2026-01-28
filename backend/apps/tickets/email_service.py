"""
Email service for ticket confirmations and notifications.
"""
import logging
import qrcode
import io
import base64
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone

from .models import Order, Ticket

logger = logging.getLogger(__name__)


class TicketEmailService:
    """Service for sending ticket-related emails."""
    
    @staticmethod
    def _generate_qr_code_bytes(ticket: Ticket) -> tuple:
        """Generate QR code as bytes for email attachment. Returns (bytes, content_id)."""
        try:
            logger.info(f"Generating QR code for ticket {ticket.ticket_code}")
            from .services import QRCodeService
            
            qr_data = QRCodeService.generate_qr_data(ticket)
            logger.info(f"QR data generated: {qr_data[:50]}...")
            
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            img_bytes = buffer.getvalue()
            content_id = f"qr_{ticket.ticket_code}"
            logger.info(f"QR code generated successfully, size: {len(img_bytes)} bytes")
            return (img_bytes, content_id)
        except Exception as e:
            logger.error(f"Failed to generate QR code: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return (None, None)
    
    @staticmethod
    def send_order_confirmation(order: Order) -> bool:
        """
        Send order confirmation email with tickets.
        Returns True if successful, False otherwise.
        """
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail, Attachment, ContentId, Disposition, FileContent, FileName, FileType
            
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
                # Handle tickets without ticket_type (amphitheater tickets)
                if ticket.ticket_type:
                    ticket_name = ticket.ticket_type.name
                    valid_days = ', '.join(ticket.ticket_type.valid_days) if ticket.ticket_type.valid_days else 'All Days'
                    extra_info = ''
                elif ticket.metadata and ticket.metadata.get('type') == 'amphitheater':
                    ticket_name = ticket.metadata.get('ticket_name', 'Amphitheater Ticket')
                    valid_days = 'Event Day'
                    # Add seat information if available
                    extra_info = ''
                    if ticket.metadata.get('section_name'):
                        extra_info += f"\n  Section: {ticket.metadata.get('section_name')}"
                    if ticket.metadata.get('seats'):
                        extra_info += f"\n  {ticket.metadata.get('seats')}"
                else:
                    ticket_name = 'Special Ticket'
                    valid_days = 'See ticket details'
                    extra_info = ''
                
                text_content += f"\n- {ticket_name}"
                text_content += f"\n  Ticket Code: {ticket.ticket_code}"
                text_content += f"\n  Valid Days: {valid_days}"
                if extra_info:
                    text_content += extra_info
                text_content += "\n"
            
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
            
            # Generate QR codes for ALL tickets
            ticket_qr_codes = []
            attachments = []
            for ticket in tickets:
                img_bytes, content_id = TicketEmailService._generate_qr_code_bytes(ticket)
                if img_bytes:
                    # Create attachment for SendGrid
                    encoded = base64.b64encode(img_bytes).decode()
                    attachment = Attachment()
                    attachment.file_content = FileContent(encoded)
                    attachment.file_type = FileType('image/png')
                    attachment.file_name = FileName(f'{content_id}.png')
                    attachment.disposition = Disposition('inline')
                    attachment.content_id = ContentId(content_id)
                    attachments.append(attachment)
                    
                ticket_qr_codes.append({
                    'ticket': ticket,
                    'content_id': content_id if img_bytes else None
                })
            
            # HTML version matching the provided design
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }}
        .container {{ 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        .header {{ 
            text-align: center;
            padding: 40px 20px 20px;
            background: white;
        }}
        .logo {{
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }}
        .order-number {{
            text-align: right;
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
            padding: 0 20px;
        }}
        .title {{
            font-size: 28px;
            font-weight: 600;
            color: #000;
            margin: 20px 0 10px;
        }}
        .subtitle {{
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }}
        .qr-section {{
            text-align: center;
            padding: 30px 20px;
            background: #fafafa;
        }}
        .qr-code {{
            width: 250px;
            height: 250px;
            margin: 20px auto;
        }}
        .wallet-button {{
            display: inline-block;
            background: #000;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 10px 5px;
            font-size: 14px;
            font-weight: 500;
        }}
        .download-button {{
            display: inline-block;
            background: white;
            color: #000;
            border: 2px solid #ddd;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 10px 5px;
            font-size: 14px;
            font-weight: 500;
        }}
        .login-button {{
            display: inline-block;
            background: #dc3545;
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 25px;
            margin: 15px 5px;
            font-size: 15px;
            font-weight: 600;
        }}
        .details-section {{
            padding: 30px 20px;
            background: white;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: 600;
            color: #000;
            margin-bottom: 15px;
        }}
        .detail-row {{
            margin: 15px 0;
        }}
        .detail-label {{
            font-size: 11px;
            text-transform: uppercase;
            color: #666;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }}
        .detail-value {{
            font-size: 14px;
            color: #000;
            font-weight: 500;
        }}
        .order-summary {{
            padding: 30px 20px;
            background: #fafafa;
            border-top: 1px solid #eee;
        }}
        .summary-table {{
            width: 100%;
            margin-top: 15px;
        }}
        .summary-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }}
        .summary-row.total {{
            border-top: 2px solid #000;
            border-bottom: none;
            font-weight: 600;
            font-size: 16px;
            padding-top: 15px;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            background: white;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="order-number">Order #{order.order_number}</div>
            <h1 class="title">You've got tickets!</h1>
            <p class="subtitle">Please add your ticket to your wallet, download it, or <a href="{settings.FRONTEND_URL}/login">login</a> to your account to retrieve tickets at a later time.</p>
        </div>
        
        <div class="qr-section">
            <div style="margin-bottom: 20px;">
                <a href="{settings.FRONTEND_URL}/login" class="login-button">Login</a>
            </div>
        </div>"""
            
            # Add each ticket with its QR code using CID references
            for idx, item in enumerate(ticket_qr_codes):
                ticket = item['ticket']
                content_id = item['content_id']
                # Get ticket name handling amphitheater tickets
                if ticket.ticket_type:
                    tkt_name = ticket.ticket_type.name
                elif ticket.metadata and ticket.metadata.get('type') == 'amphitheater':
                    tkt_name = ticket.metadata.get('ticket_name', 'Amphitheater Ticket')
                else:
                    tkt_name = 'Special Ticket'
                html_content += f"""
        <div style="text-align: center; padding: 30px 20px; background: #fafafa; border-top: 1px solid #eee;">
            <h3 style="margin: 0 0 10px; color: #333;">Ticket {idx + 1}: {tkt_name}</h3>
            <p style="margin: 0 0 15px; color: #666; font-size: 12px;">Code: {ticket.ticket_code}</p>
            {f'<img src="cid:{content_id}" alt="QR Code for {ticket.ticket_code}" style="width: 200px; height: 200px; margin: 10px auto; display: block;">' if content_id else '<p style="color: #999;">QR Code unavailable</p>'}
            <div style="margin-top: 15px;">
                <a href="#" style="display: inline-block; background: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 12px; margin: 5px;">Add to Apple Wallet</a>
                <a href="#" style="display: inline-block; background: white; color: #000; border: 1px solid #ddd; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 12px; margin: 5px;">Download PDF</a>
            </div>
        </div>"""
            
            html_content += f"""
        
        <div class="details-section">
            <h2 class="section-title">Ticket Details</h2>
            
            <div class="detail-row">
                <div class="detail-label">TICKET TYPE</div>
                <div class="detail-value">{tickets[0].ticket_type.name if tickets and tickets[0].ticket_type else (tickets[0].metadata.get('ticket_name', 'Amphitheater Ticket') if tickets and tickets[0].metadata and tickets[0].metadata.get('type') == 'amphitheater' else 'Special Ticket')}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">DATE & TIME</div>
                <div class="detail-value">
                    {', '.join(tickets[0].ticket_type.valid_days) if tickets and tickets[0].ticket_type and tickets[0].ticket_type.valid_days else 'See event details'}
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">LOCATION</div>
                <div class="detail-value">
                    OC Fair & Event Center<br>
                    88 Fair Drive<br>
                    Costa Mesa, CA 92626
                </div>
            </div>
        </div>
        
        <div class="order-summary">
            <h2 class="section-title">Order Summary</h2>
            <div class="summary-table">"""
            
            for ticket in tickets:
                # Handle tickets without ticket_type
                if ticket.ticket_type:
                    t_name = ticket.ticket_type.name
                    t_price = ticket.ticket_type.price_cents / 100
                elif ticket.metadata and ticket.metadata.get('type') == 'amphitheater':
                    t_name = ticket.metadata.get('ticket_name', 'Amphitheater Ticket')
                    t_price = ticket.metadata.get('price_paid', 0) / 100
                else:
                    t_name = 'Special Ticket'
                    t_price = 0
                html_content += f"""
                <div class="summary-row">
                    <span>{t_name} x1</span>
                    <span>${t_price:.2f}</span>
                </div>"""
            
            html_content += f"""
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${order.total_cents / 100:.2f}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>USD ${order.total_cents / 100:.2f}</span>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <div class="detail-label">DATE</div>
                <div class="detail-value">{order.created_at.strftime('%B %d, %Y')}</div>
            </div>
            
            <div style="margin-top: 15px;">
                <div class="detail-label">PAYMENT METHOD</div>
                <div class="detail-value">Card Payment</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Questions? Contact us at {settings.DEFAULT_FROM_EMAIL}</p>
            <p>&copy; {timezone.now().year} OC MENA Festival. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            """
            
            # Use SendGrid API directly for faster, more reliable sending
            message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=order.buyer.email,
                subject=subject,
                plain_text_content=text_content,
                html_content=html_content
            )
            
            # Add QR code attachments as inline images
            for attachment in attachments:
                message.add_attachment(attachment)
            
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
            
            logger.info(f"Order confirmation email sent for order {order.order_number}, status: {response.status_code}")
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
