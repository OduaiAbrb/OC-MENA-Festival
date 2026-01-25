#!/usr/bin/env python
"""
Quick test script to send a test order confirmation email.
Run with: python test_email.py YOUR_EMAIL@example.com
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.tickets.models import Order, Ticket
from apps.tickets.email_service import TicketEmailService

def test_email(recipient_email=None):
    """Send test email to verify email system works."""
    
    # Get the most recent paid order
    order = Order.objects.filter(status='PAID').order_by('-created_at').first()
    
    if not order:
        print("❌ No paid orders found in database")
        print("Create a test order first or use the API to make a purchase")
        return False
    
    print(f"✅ Found order: {order.order_number}")
    print(f"   Buyer: {order.buyer.email}")
    print(f"   Total: ${order.total_cents / 100:.2f}")
    print(f"   Tickets: {order.tickets.count()}")
    
    # Override recipient if provided
    original_email = order.buyer.email
    if recipient_email:
        order.buyer.email = recipient_email
        print(f"   Sending to: {recipient_email} (override)")
    
    print("\n📧 Sending test email...")
    
    try:
        result = TicketEmailService.send_order_confirmation(order)
        
        if result:
            print("✅ Email sent successfully!")
            print(f"   Check inbox: {recipient_email or original_email}")
            return True
        else:
            print("❌ Email failed to send (check logs)")
            return False
            
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Restore original email
        if recipient_email:
            order.buyer.email = original_email

if __name__ == '__main__':
    recipient = sys.argv[1] if len(sys.argv) > 1 else None
    
    if not recipient:
        print("Usage: python test_email.py YOUR_EMAIL@example.com")
        print("\nOr just run without args to send to the order's original buyer email")
        print()
    
    test_email(recipient)
