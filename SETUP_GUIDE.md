# OC MENA Festival - Setup & Configuration Guide

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching and Celery)
- SendGrid account (for emails)
- Stripe account (for payments)

---

## 📧 Email Configuration (CRITICAL)

### Step 1: Get SendGrid API Key

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key with "Full Access"
5. Copy the API key (starts with `SG.`)

### Step 2: Configure Sender Authentication

1. In SendGrid, go to Settings → Sender Authentication
2. Authenticate your domain OR
3. Set up Single Sender Verification for `noreply@ocmenafestival.com`
4. Verify the email address by clicking the link sent to your inbox

### Step 3: Add to Environment Variables

Create/update `backend/.env`:
```bash
SENDGRID_API_KEY=SG.your_actual_key_here
DEFAULT_FROM_EMAIL=noreply@ocmenafestival.com
ADMIN_EMAIL=admin@ocmenafestival.com
```

### Step 4: Test Email Delivery

```bash
cd backend
python manage.py shell

# In Python shell:
from django.core.mail import send_mail
send_mail(
    'Test Email',
    'This is a test email from OC MENA Festival',
    'noreply@ocmenafestival.com',
    ['your-gmail@gmail.com'],
    fail_silently=False,
)
```

Check your Gmail inbox (and spam folder).

---

## 💳 Stripe Configuration

### Step 1: Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Publishable Key** and **Secret Key**
3. For webhooks, get your **Webhook Signing Secret**

### Step 2: Add to Environment Variables

```bash
# Backend .env
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # or pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Frontend .env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Step 3: Set Up Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend-url.com/api/payments/webhook/`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook signing secret

---

## 🌐 Frontend URL Configuration

### Development
```bash
# Backend .env
FRONTEND_URL=http://localhost:3000
```

### Production
```bash
# Backend .env
FRONTEND_URL=https://oc-mena-festival.pages.dev
```

This URL is used in:
- Email links (login, password reset, ticket viewing)
- QR code validation URLs
- Transfer acceptance links

---

## 🗄️ Database Setup

### PostgreSQL

```bash
# Create database
createdb ocmena_db

# Backend .env
DB_NAME=ocmena_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Run Migrations

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 🔴 Redis Setup

### Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows:**
Download from [Redis Windows](https://github.com/microsoftarchive/redis/releases)

### Configure

```bash
# Backend .env
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

---

## 🎫 Ticket Types Setup

### Create Ticket Types in Admin

1. Go to `http://localhost:8000/admin/`
2. Navigate to Tickets → Ticket Types
3. Create ticket types:

**Regular Tickets:**
- 3-Day Pass: $35, slug: `3day`, valid_days: `["Friday", "Saturday", "Sunday"]`
- 2-Day Pass: $25, slug: `2day`, valid_days: `["Saturday", "Sunday"]`
- 1-Day Pass: $15, slug: `1day`, valid_days: `["Saturday"]`

**Vendor Booth Tickets:**
- Bazaar Vendor Booth: $500, slug: `bazaar-vendor-booth`
- Food Truck Booth: $800, slug: `food-truck-booth`
- Food Booth: $600, slug: `food-booth`

---

## 🏪 Vendor Booth Configuration

### Enable Vendor Features

```bash
# Backend .env
VENDOR_BOOTHS_ENABLED=True
```

### Create Booth Locations (Optional)

In Django Admin → Vendors → Booths:
- Create physical booth locations
- Assign booth codes (e.g., A1, A2, B1, etc.)
- Set pricing and amenities

---

## 🔐 Security Settings

### QR Code Signing

```bash
# Backend .env
QR_SIGNING_SECRET=your-random-secret-key-here
```

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Django Secret Key

```bash
# Backend .env
DJANGO_SECRET_KEY=your-django-secret-key
```

---

## 🧪 Testing the Complete Flow

### Test Regular Ticket Purchase

1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `cd .. && npm start`
3. Go to `http://localhost:3000/tickets`
4. Add tickets to cart
5. Proceed to checkout
6. Use test card: `4242 4242 4242 4242`, any future date, any CVC
7. Complete purchase
8. Check email inbox for confirmation
9. Login to dashboard at `http://localhost:3000/dashboard`
10. Verify ticket appears with QR code

### Test Vendor Booth Purchase

1. Go to `http://localhost:3000/vendor-booths`
2. Select a booth type
3. Fill out registration form
4. Complete payment
5. Check email for vendor setup instructions
6. Login to dashboard
7. Go to "Vendor Booth" tab
8. Verify booth ticket appears with all details

---

## 📊 Monitoring & Logs

### Check Email Delivery

**SendGrid Dashboard:**
- Activity → Email Activity
- View delivery status, opens, clicks
- Check for bounces or spam reports

**Backend Logs:**
```bash
cd backend
python manage.py runserver
# Watch console for email-related logs
```

### Check Payment Status

**Stripe Dashboard:**
- Payments → All payments
- View successful/failed payments
- Check webhook delivery

---

## 🐛 Troubleshooting

### Emails Not Arriving

1. **Check SendGrid API key:**
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. **Verify sender authentication:**
   - SendGrid → Settings → Sender Authentication
   - Ensure domain or single sender is verified

3. **Check spam folder:**
   - Gmail may mark first emails as spam
   - Mark as "Not Spam" to train filter

4. **Check SendGrid activity:**
   - Look for delivery errors
   - Check for domain reputation issues

5. **Test with console backend:**
   ```bash
   # In backend/.env, temporarily comment out:
   # SENDGRID_API_KEY=...
   # Emails will print to console instead
   ```

### Vendor Tickets Not Showing

1. **Check ticket type name:**
   - Must include "vendor", "booth", "bazaar", or "food truck"
   - Dashboard filters based on these keywords

2. **Check ticket status:**
   - Should be "ISSUED"
   - Check in Django Admin → Tickets

3. **Verify API response:**
   ```bash
   # In browser console:
   fetch('http://localhost:8000/api/tickets/my-tickets/', {
     headers: {
       'Authorization': 'Bearer YOUR_TOKEN'
     }
   }).then(r => r.json()).then(console.log)
   ```

### Payment Failing

1. **Check Stripe mode:**
   - Test mode: Use test cards
   - Live mode: Use real cards

2. **Verify webhook:**
   - Stripe Dashboard → Developers → Webhooks
   - Check recent deliveries
   - Ensure endpoint is accessible

3. **Check demo mode:**
   - If no Stripe keys configured, system runs in demo mode
   - Demo payments require manual confirmation

---

## 🚀 Production Deployment

### Environment Variables Checklist

```bash
# Django
DJANGO_SECRET_KEY=production-secret-key
DJANGO_DEBUG=False
DJANGO_ENVIRONMENT=production
DJANGO_ALLOWED_HOSTS=your-domain.com,api.your-domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Email
SENDGRID_API_KEY=SG.production_key
DEFAULT_FROM_EMAIL=noreply@ocmenafestival.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Frontend
FRONTEND_URL=https://ocmenafestival.com

# Redis
REDIS_URL=redis://production-redis:6379/0

# Security
QR_SIGNING_SECRET=production-qr-secret
```

### Pre-Launch Checklist

- [ ] SendGrid domain authenticated
- [ ] Stripe live mode enabled
- [ ] Webhook endpoints configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Redis persistence enabled
- [ ] Celery workers running
- [ ] Email delivery tested
- [ ] Payment flow tested end-to-end
- [ ] QR code scanning tested
- [ ] Vendor booth flow tested

---

## 📞 Support

For issues or questions:
- Email: admin@ocmenafestival.com
- Check logs: `backend/logs/`
- Django Admin: `http://localhost:8000/admin/`

---

## 🎉 You're All Set!

The system is now configured and ready to:
✅ Accept ticket purchases
✅ Send confirmation emails to Gmail
✅ Display tickets in user dashboard
✅ Separate vendor booths from regular tickets
✅ Generate QR codes for validation
✅ Process payments via Stripe
✅ Handle vendor booth registrations

Happy festival organizing! 🎪
