"""Simple email test that can be run via Railway shell"""
from apps.tickets.models import Order
from apps.tickets.email_service import TicketEmailService
from apps.accounts.models import User

# Check if we have any orders
orders = Order.objects.all()
print(f"Total orders in database: {orders.count()}")

if orders.count() == 0:
    print("\nNo orders found. Creating a test order...")
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        email='test@ocmenafestival.com',
        defaults={
            'full_name': 'Test User',
            'role': 'ATTENDEE'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Get a ticket type
    from apps.tickets.models import TicketType
    ticket_type = TicketType.objects.filter(is_active=True).first()
    
    if not ticket_type:
        print("ERROR: No ticket types found. Create one in admin first.")
    else:
        # Create a test order
        from apps.tickets.services import OrderService
        
        order = OrderService.create_order(
            buyer=user,
            items=[{'ticket_type_id': str(ticket_type.id), 'quantity': 1}],
            idempotency_key='test-manual-123'
        )
        
        # Mark as paid and finalize
        order.status = 'PAID'
        order.save()
        
        OrderService.finalize_order(order)
        
        print(f"✅ Created test order: {order.order_number}")
        print(f"   Email will be sent to: {user.email}")
        print(f"   Total: ${order.total_cents / 100:.2f}")
else:
    # Use existing order
    order = Order.objects.filter(status='PAID').order_by('-created_at').first()
    
    if not order:
        order = orders.first()
        print(f"⚠️  Using unpaid order: {order.order_number}")
    else:
        print(f"✅ Using existing order: {order.order_number}")
    
    print(f"   Buyer: {order.buyer.email}")
    print(f"   Total: ${order.total_cents / 100:.2f}")

print("\n📧 Sending email...")
result = TicketEmailService.send_order_confirmation(order)

if result:
    print("✅ SUCCESS! Email sent!")
    print(f"   Check inbox: {order.buyer.email}")
else:
    print("❌ FAILED! Check Railway logs for errors")
