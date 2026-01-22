# OC MENA Festival Backend

Production-grade Django REST API backend for the OC MENA Festival ticketing platform.

## Features

- **Authentication**: JWT-based auth with role-based access control (Attendee, Vendor, Staff, Admin)
- **Ticketing**: Purchase, transfer, upgrade, refund, and comp tickets
- **QR Codes**: Secure, signed QR codes for ticket entry
- **Scanning**: Atomic scan operations with race condition prevention
- **Vendors**: Vendor profiles, booth assignments, and setup QR codes
- **Payments**: Stripe integration with webhook idempotency
- **Wallet**: Apple Wallet and Google Wallet pass preparation
- **Async Tasks**: Celery for PDF generation, emails, and background jobs

## Tech Stack

- Django 5.0 + Django REST Framework
- PostgreSQL
- Redis + Celery
- Stripe for payments
- SendGrid for emails
- drf-spectacular for OpenAPI docs

## Quick Start

### Local Development

1. **Clone and setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start services with Docker Compose**
```bash
docker-compose up -d db redis
```

4. **Run migrations**
```bash
python manage.py migrate
python manage.py createsuperuser
```

5. **Start development server**
```bash
python manage.py runserver
```

6. **Start Celery worker** (separate terminal)
```bash
celery -A core worker -l INFO
```

### Using Docker Compose (Full Stack)

```bash
docker-compose up --build
```

This starts:
- PostgreSQL database
- Redis cache
- Django web server
- Celery worker
- Celery beat scheduler

## API Documentation

Once running, access:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

## API Endpoints

### Public
- `GET /api/health/` - Health check
- `GET /api/config/public/` - Event configuration
- `GET /api/config/sponsors/` - Sponsors list
- `GET /api/config/schedule/` - Event schedule
- `POST /api/config/contact/` - Contact form
- `GET /api/tickets/types/` - Available ticket types

### Authentication
- `POST /api/auth/register/` - Register
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/me/` - Get profile
- `PATCH /api/auth/me/` - Update profile
- `POST /api/auth/password/change/` - Change password
- `POST /api/auth/password/reset/` - Request reset
- `POST /api/auth/password/reset/confirm/` - Confirm reset

### Tickets (Authenticated)
- `GET /api/tickets/my/` - My tickets
- `GET /api/tickets/{id}/` - Ticket details
- `GET /api/tickets/{id}/qr/` - Ticket QR code
- `GET /api/tickets/transfers/` - My transfers
- `POST /api/tickets/transfers/create/` - Create transfer
- `POST /api/tickets/transfers/{id}/cancel/` - Cancel transfer
- `POST /api/tickets/transfers/accept/` - Accept transfer
- `GET /api/tickets/upgrades/` - My upgrades
- `POST /api/tickets/upgrades/create/` - Request upgrade

### Payments (Authenticated)
- `POST /api/payments/checkout/create-intent/` - Create payment
- `POST /api/payments/checkout/confirm/` - Confirm payment
- `GET /api/payments/orders/` - My orders
- `GET /api/payments/orders/{id}/` - Order details
- `GET /api/payments/orders/{id}/invoice/` - Order invoice

### Scanning (Staff Only)
- `POST /api/scan/validate/` - Validate QR code
- `POST /api/scan/commit/` - Mark ticket as used
- `GET /api/scan/logs/` - Scan logs
- `GET /api/scan/stats/` - Scan statistics

### Staff Actions (Staff/Admin Only)
- `POST /api/tickets/staff/comp/` - Issue comp tickets
- `POST /api/tickets/staff/refund/` - Process refund
- `POST /api/tickets/staff/upgrade/` - Process upgrade
- `POST /api/tickets/staff/resend-tickets/` - Resend tickets
- `POST /api/tickets/staff/resend-invoice/` - Resend invoice
- `GET /api/tickets/staff/orders/` - List all orders
- `GET /api/tickets/staff/orders/{id}/` - Order details

### Vendors
- `GET /api/vendors/list/` - Public vendor list
- `GET /api/vendors/profile/` - Vendor profile
- `PATCH /api/vendors/profile/` - Update profile
- `GET /api/vendors/dashboard/` - Vendor dashboard
- `GET /api/vendors/setup-qr/` - Vendor setup QR

### Admin
- `GET /api/vendors/admin/booths/` - List booths
- `POST /api/vendors/admin/booths/assign/` - Assign booth
- `GET /api/vendors/admin/vendors/` - List all vendors

### Wallet
- `POST /api/wallet/apple/create-pass/` - Create Apple Wallet pass
- `POST /api/wallet/google/create-pass/` - Create Google Wallet pass
- `GET /api/wallet/passes/` - My wallet passes

## Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=apps --cov-report=html

# Specific test file
pytest tests/test_scanning.py

# Concurrency tests
pytest tests/test_scanning.py::TestScanConcurrency -v
```

## Load Testing

```bash
# Install locust
pip install locust

# Run load tests
locust -f locustfile.py --host=http://localhost:8000

# Open http://localhost:8089 to configure and start test
```

## Deployment (Railway)

### Prerequisites
- Railway account
- PostgreSQL plugin
- Redis plugin

### Deploy Steps

1. **Create Railway project**
```bash
railway login
railway init
```

2. **Add PostgreSQL and Redis plugins** via Railway dashboard

3. **Set environment variables** in Railway:
```
DJANGO_SECRET_KEY=<generate-secure-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-app.railway.app
DJANGO_ENVIRONMENT=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
SENTRY_DSN=https://...
QR_SIGNING_SECRET=<generate-secure-key>
FRONTEND_URL=https://your-frontend.com
```

4. **Deploy**
```bash
railway up
```

5. **Run migrations**
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

6. **Start worker** (create separate Railway service)
```bash
celery -A core worker -l INFO
```

### Stripe Webhook Setup

1. In Stripe Dashboard, create webhook endpoint:
   - URL: `https://your-app.railway.app/api/payments/webhook/stripe/`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

2. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DJANGO_SECRET_KEY` | Django secret key | Yes |
| `DJANGO_DEBUG` | Debug mode (False in production) | Yes |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hosts | Yes |
| `DJANGO_ENVIRONMENT` | development/staging/production | Yes |
| `DATABASE_URL` | PostgreSQL connection URL | Yes |
| `REDIS_URL` | Redis connection URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `SENDGRID_API_KEY` | SendGrid API key | Yes |
| `SENTRY_DSN` | Sentry DSN for error tracking | No |
| `QR_SIGNING_SECRET` | Secret for signing QR codes | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## Security Considerations

- All tickets use signed QR codes (HMAC-SHA256)
- Scan operations use database row locking to prevent race conditions
- Webhook processing is idempotent
- JWT tokens with configurable expiry
- Rate limiting on auth and scan endpoints
- CORS configured for frontend origin only
- HTTPS enforced in production

## Architecture

```
backend/
├── core/                   # Django project settings
│   ├── settings.py
│   ├── urls.py
│   ├── celery.py
│   └── exceptions.py
├── apps/
│   ├── accounts/          # User auth & RBAC
│   ├── config/            # Event config, sponsors, schedule
│   ├── tickets/           # Tickets, orders, transfers
│   ├── vendors/           # Vendor profiles, booths
│   ├── scanning/          # Ticket scanning
│   ├── payments/          # Stripe integration
│   └── wallet/            # Apple/Google Wallet
├── tests/                 # Test suite
├── locustfile.py         # Load tests
└── docker-compose.yml    # Local development
```

## License

Proprietary - OC MENA Festival
