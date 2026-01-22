# Deployment Guide - Railway

## Prerequisites

1. Railway account (https://railway.app)
2. Railway CLI installed
3. GitHub repository connected to Railway

## Step 1: Create Railway Project

```bash
# Login to Railway
railway login

# Initialize project in backend directory
cd backend
railway init
```

## Step 2: Add Database and Redis

In Railway Dashboard:

1. Click "New" → "Database" → "Add PostgreSQL"
2. Click "New" → "Database" → "Add Redis"

Railway will automatically set `DATABASE_URL` and `REDIS_URL` environment variables.

## Step 3: Configure Environment Variables

In Railway Dashboard → Variables, add:

```
DJANGO_SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-app>.railway.app
DJANGO_ENVIRONMENT=production

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
DEFAULT_FROM_EMAIL=noreply@ocmenafestival.com
ADMIN_EMAIL=admin@ocmenafestival.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...

# Security
QR_SIGNING_SECRET=<generate secure random string>

# Frontend
FRONTEND_URL=https://your-frontend-domain.com
```

## Step 4: Deploy Web Service

```bash
# Deploy
railway up

# Or connect GitHub for auto-deploy
railway link
```

The `railway.toml` file configures:
- Dockerfile build
- Health check endpoint
- Auto-restart policy

## Step 5: Run Migrations

```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

## Step 6: Create Celery Worker Service

1. In Railway Dashboard, click "New Service" → "Empty Service"
2. Name it "worker"
3. Connect to same GitHub repo
4. Set start command: `celery -A core worker -l INFO`
5. Copy all environment variables from web service

## Step 7: Create Celery Beat Service (Optional)

For scheduled tasks:

1. Create another empty service named "beat"
2. Set start command: `celery -A core beat -l INFO`
3. Copy environment variables

## Step 8: Configure Stripe Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://<your-app>.railway.app/api/payments/webhook/stripe/`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var

## Step 9: Configure Custom Domain (Optional)

1. In Railway Dashboard → Settings → Domains
2. Add custom domain
3. Update DNS records as instructed
4. Update `DJANGO_ALLOWED_HOSTS` to include custom domain

## Step 10: Verify Deployment

```bash
# Check health
curl https://<your-app>.railway.app/api/health/

# Check API docs
# Visit: https://<your-app>.railway.app/api/docs/
```

## Monitoring

### Logs
```bash
railway logs
```

### Sentry
- Errors and performance issues tracked automatically
- Set up alerts in Sentry Dashboard

### Railway Metrics
- View CPU, memory, and network in Railway Dashboard

## Scaling

### Horizontal Scaling
In Railway Dashboard → Service → Settings:
- Increase replicas for web service
- Workers scale independently

### Database Scaling
- Upgrade PostgreSQL plan in Railway
- Enable connection pooling for high traffic

## Troubleshooting

### Migration Issues
```bash
railway run python manage.py showmigrations
railway run python manage.py migrate --fake-initial
```

### Static Files
```bash
railway run python manage.py collectstatic --noinput
```

### Shell Access
```bash
railway run python manage.py shell
```

## Rollback

Railway keeps deployment history:
1. Go to Deployments tab
2. Click on previous successful deployment
3. Click "Rollback"

## Security Checklist

- [ ] `DJANGO_DEBUG=False`
- [ ] Strong `DJANGO_SECRET_KEY`
- [ ] Strong `QR_SIGNING_SECRET`
- [ ] HTTPS enforced (automatic on Railway)
- [ ] CORS configured for frontend only
- [ ] Rate limiting enabled
- [ ] Sentry configured for error tracking
- [ ] Database backups enabled
