# Usher/Staff Scanner Credentials

## How to Create Usher Accounts

Ushers need staff permissions to use the scanner. Here's how to create them:

### Option 1: Django Admin (Recommended)

1. Log into Django admin at: `https://your-backend-url/admin/`
2. Go to **Users** section
3. Click **Add User**
4. Fill in:
   - Email: `usher1@ocmena.com`
   - Password: `Usher2026!`
   - Full Name: `Usher One`
5. After creating, edit the user and check:
   - ✅ **Staff status** (is_staff = True)
   - ✅ **Active** (is_active = True)
6. Save

### Option 2: Django Management Command

Run this in your backend terminal:

```bash
cd backend
python manage.py shell
```

Then run:

```python
from apps.accounts.models import User

# Create usher account
usher = User.objects.create_user(
    email='usher1@ocmena.com',
    password='Usher2026!',
    full_name='Usher One',
    is_staff=True,
    is_active=True
)
print(f"Created usher: {usher.email}")
```

### Option 3: Create Multiple Ushers at Once

```python
from apps.accounts.models import User

ushers_data = [
    {'email': 'usher1@ocmena.com', 'name': 'Usher One'},
    {'email': 'usher2@ocmena.com', 'name': 'Usher Two'},
    {'email': 'usher3@ocmena.com', 'name': 'Usher Three'},
    {'email': 'usher4@ocmena.com', 'name': 'Usher Four'},
]

for usher_data in ushers_data:
    user, created = User.objects.get_or_create(
        email=usher_data['email'],
        defaults={
            'full_name': usher_data['name'],
            'is_staff': True,
            'is_active': True
        }
    )
    if created:
        user.set_password('Usher2026!')
        user.save()
        print(f"✅ Created: {user.email}")
    else:
        print(f"⚠️  Already exists: {user.email}")
```

## Test Credentials

Once created, use these credentials to log in:

| Email | Password | Role |
|-------|----------|------|
| usher1@ocmena.com | Usher2026! | Staff/Usher |
| usher2@ocmena.com | Usher2026! | Staff/Usher |
| usher3@ocmena.com | Usher2026! | Staff/Usher |
| usher4@ocmena.com | Usher2026! | Staff/Usher |

## Scanner Flow

1. **Usher logs in** at `/login` with credentials above
2. **Navigate to** `/scanner`
3. **Camera activates** automatically
4. **Point at QR code** - automatic detection (every 300ms)
5. **Backend validates** via authenticated `/api/scanning/validate/` endpoint
6. **If valid** → Navigate to success page with ticket details
7. **If invalid** → Show error message for 4 seconds

## Required Permissions

For the scanner to work, the user must have:
- ✅ `is_staff = True` (Staff status)
- ✅ `is_active = True` (Active account)
- ✅ Valid JWT token (obtained via login)

## API Endpoint Used

The scanner now uses the **authenticated** endpoint:

```
POST /api/scanning/validate/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "qr_data": "TICKET_CODE_HERE"
}
```

**NOT** using the quick-scan endpoint anymore.

## Troubleshooting

### "Authentication required" error
- Usher needs to log in first at `/login`
- Check that `is_staff = True` in Django admin

### "Access denied" error  
- User doesn't have staff permissions
- Set `is_staff = True` in Django admin

### "Failed to validate ticket" error
- Backend might not be running
- Check network connection
- Verify scanning is enabled in EventConfig

### "Ticket not found" error
- No tickets exist in database yet
- Create test tickets via Django admin or API

## Creating Test Tickets

To test the scanner, you need tickets in the database:

```python
from apps.tickets.models import TicketType, Order, OrderItem, Ticket
from apps.accounts.models import User
from decimal import Decimal

# Create ticket type
ticket_type = TicketType.objects.create(
    name='3-Day Pass',
    slug='3day',
    description='Full festival access',
    price_cents=3500,
    quantity_available=100,
    is_active=True,
    valid_days=['2026-05-01', '2026-05-02', '2026-05-03']
)

# Create test user (ticket holder)
holder = User.objects.create_user(
    email='test@example.com',
    password='Test123!',
    full_name='Test User'
)

# Create order
order = Order.objects.create(
    user=holder,
    email=holder.email,
    total_amount=Decimal('35.00'),
    status='COMPLETED'
)

# Create order item
item = OrderItem.objects.create(
    order=order,
    ticket_type=ticket_type,
    quantity=1,
    unit_price=Decimal('35.00')
)

# Ticket is auto-created via signal
ticket = Ticket.objects.filter(order=order).first()
print(f"✅ Ticket created: {ticket.ticket_code}")
print(f"QR Code: {ticket.qr_code_url}")
```

Now you can scan this ticket!
