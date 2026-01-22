# SendGrid Email Setup Guide

## Current Status
Your SendGrid account is created with domain authentication records, but they reference your Cloudflare Pages URL instead of a custom domain.

## DNS Records Provided by SendGrid

```
Type: CNAME
Host: em3076.https://oc-mena-festival.pages.dev/
Value: u59202847.wl098.sendgrid.net

Type: CNAME
Host: s1._domainkey.https://oc-mena-festival.pages.dev/
Value: s1.domainkey.u59202847.wl098.sendgrid.net

Type: CNAME
Host: s2._domainkey.https://oc-mena-festival.pages.dev/
Value: s2.domainkey.u59202847.wl098.sendgrid.net

Type: TXT
Host: _dmarc.https://oc-mena-festival.pages.dev/
Value: v=DMARC1; p=none;
```

## ⚠️ Issue
These records cannot be added to `oc-mena-festival.pages.dev` because:
- Cloudflare Pages domains don't allow custom DNS records
- You need a custom domain (e.g., `ocmenafestival.com`)

## ✅ Solution Options

### Option 1: Get a Custom Domain (Best for Production)

1. **Purchase a domain** (e.g., from Namecheap, GoDaddy, Cloudflare)
   - Suggested: `ocmenafestival.com` or `ocmena.org`
   - Cost: ~$10-15/year

2. **Add domain to Cloudflare Pages:**
   - Go to your Cloudflare Pages project
   - Settings → Custom domains
   - Add your domain
   - Cloudflare will auto-configure DNS

3. **Add SendGrid DNS records:**
   - Go to your domain's DNS settings
   - Add the 4 records above (remove the `.pages.dev` part)
   - Example for `ocmenafestival.com`:
     ```
     CNAME: em3076 → u59202847.wl098.sendgrid.net
     CNAME: s1._domainkey → s1.domainkey.u59202847.wl098.sendgrid.net
     CNAME: s2._domainkey → s2.domainkey.u59202847.wl098.sendgrid.net
     TXT: _dmarc → v=DMARC1; p=none;
     ```

4. **Update Railway environment variables:**
   ```
   SENDGRID_API_KEY=SG.your_api_key
   DEFAULT_FROM_EMAIL=noreply@ocmenafestival.com
   ADMIN_EMAIL=admin@ocmenafestival.com
   ```

5. **Verify in SendGrid dashboard** (takes 24-48 hours)

### Option 2: Use SendGrid Without Domain Authentication (Quick Start)

**Pros:** Works immediately, no domain needed
**Cons:** Lower email deliverability, may go to spam

1. **Get your SendGrid API key:**
   - Login to SendGrid dashboard
   - Settings → API Keys
   - Create new API key with "Mail Send" permissions
   - Copy the key (starts with `SG.`)

2. **Add to Railway environment variables:**
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   DEFAULT_FROM_EMAIL=noreply@sendgrid.net
   ADMIN_EMAIL=your-personal-email@gmail.com
   ```

3. **Emails will work but:**
   - Sent from SendGrid's shared domain
   - Higher chance of spam folder
   - Good for testing, not ideal for production

### Option 3: Use Gmail SMTP (Simplest for Testing)

**Pros:** No setup, works immediately
**Cons:** Limited to 500 emails/day, not for production

1. **Update Django settings:**
   ```python
   # In backend/core/settings.py
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = 'smtp.gmail.com'
   EMAIL_PORT = 587
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = os.environ.get('GMAIL_USER')
   EMAIL_HOST_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
   ```

2. **Create Gmail App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Add to Railway:**
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your_16_char_password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

## 🎯 Recommended Path

**For Development/Testing:**
- Use Option 2 (SendGrid without domain) or Option 3 (Gmail)
- Get emails working quickly
- Test ticket purchases, transfers, etc.

**For Production Launch:**
- Purchase custom domain
- Use Option 1 (Full SendGrid setup)
- Professional emails from your domain
- Better deliverability

## 📧 What Emails Are Sent?

Your system sends emails for:
1. **Ticket Purchase Confirmation** - Order details + QR codes
2. **Ticket Transfer Requests** - Link to accept transfer
3. **Transfer Accepted** - Notification to original owner
4. **Vendor Booth Confirmation** - Booth details + setup info
5. **Booth Assignment** - When booth number is assigned
6. **Password Reset** - If you add this feature
7. **Newsletter Signups** - From EventSchedule page

## 🔧 Current Backend Email Code

Your Django backend is already configured to use SendGrid:

```python
# backend/core/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = os.environ.get('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@example.com')
```

Just add the `SENDGRID_API_KEY` environment variable to Railway!

## ✅ Quick Setup (5 Minutes)

1. Get SendGrid API key from dashboard
2. Add to Railway:
   ```
   SENDGRID_API_KEY=SG.xxxxx
   DEFAULT_FROM_EMAIL=noreply@sendgrid.net
   ADMIN_EMAIL=your-email@gmail.com
   ```
3. Redeploy Railway (or it auto-deploys)
4. Test by purchasing a ticket
5. Check email inbox for confirmation

## 🐛 Troubleshooting

**Emails not sending?**
- Check Railway logs for email errors
- Verify `SENDGRID_API_KEY` is set correctly
- Check SendGrid dashboard for blocked sends
- Verify API key has "Mail Send" permission

**Emails going to spam?**
- Expected without domain authentication
- Ask recipients to mark as "Not Spam"
- For production, use custom domain (Option 1)

**SendGrid account suspended?**
- New accounts sometimes flagged
- Contact SendGrid support
- Verify your account in SendGrid dashboard

## 📞 Need Help?

- SendGrid Docs: https://docs.sendgrid.com/
- Django Email Docs: https://docs.djangoproject.com/en/5.0/topics/email/
- Your backend email code: `backend/apps/tickets/tasks.py`
