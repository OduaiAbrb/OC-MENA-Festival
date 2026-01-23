# Railway Setup Instructions

The setup URLs are returning 404. Here are alternative methods to set up your system:

## Method 1: Django Admin (Recommended)

### Create Ticket Types:

1. Go to: `https://api-production-34dd.up.railway.app/admin/`
2. Login with your superuser account
3. Go to **Tickets** → **Ticket types** → **Add ticket type**
4. Create these 3 ticket types:

**3-Day Pass:**
- Name: `3-Day Pass`
- Slug: `3day`
- Description: `Full festival access for all three days`
- Price (cents): `3500`
- Quantity available: `1000`
- Is active: ✅ (checked)
- Valid days: `["2026-05-01", "2026-05-02", "2026-05-03"]`

**2-Day Pass:**
- Name: `2-Day Pass`
- Slug: `2day`
- Description: `Festival access for any two days`
- Price (cents): `2500`
- Quantity available: `500`
- Is active: ✅ (checked)
- Valid days: `["2026-05-01", "2026-05-02", "2026-05-03"]`

**1-Day Pass:**
- Name: `1-Day Pass`
- Slug: `1day`
- Description: `Festival access for a single day`
- Price (cents): `1500`
- Quantity available: `500`
- Is active: ✅ (checked)
- Valid days: `["2026-05-01", "2026-05-02", "2026-05-03"]`

### Create Usher Accounts:

1. Still in Django Admin
2. Go to **Users** → **Add user**
3. Create these 4 users:

**Usher 1:**
- Email: `usher1@ocmena.com`
- Password: `Usher2026!`
- Full name: `Usher One`
- Staff status: ✅ (checked)
- Active: ✅ (checked)

**Usher 2:**
- Email: `usher2@ocmena.com`
- Password: `Usher2026!`
- Full name: `Usher Two`
- Staff status: ✅ (checked)
- Active: ✅ (checked)

**Usher 3:**
- Email: `usher3@ocmena.com`
- Password: `Usher2026!`
- Full name: `Usher Three`
- Staff status: ✅ (checked)
- Active: ✅ (checked)

**Usher 4:**
- Email: `usher4@ocmena.com`
- Password: `Usher2026!`
- Full name: `Usher Four`
- Staff status: ✅ (checked)
- Active: ✅ (checked)

---

## Method 2: Railway CLI (If you have it installed)

```bash
# Connect to Railway
railway link

# Create ticket types
railway run python manage.py create_ticket_types

# Create ushers
railway run python manage.py create_ushers
```

---

## Method 3: Direct Database Access (Advanced)

If you have Railway database access, you can run SQL directly, but Method 1 (Django Admin) is much easier and safer.

---

## After Setup:

Once you've created the ticket types and usher accounts:

1. **Test Tickets:**
   - Go to your frontend `/tickets`
   - Tickets should load with proper UUIDs
   - Add to cart and checkout should work

2. **Test Scanner:**
   - Go to `/login`
   - Login with `usher1@ocmena.com` / `Usher2026!`
   - Navigate to `/scanner`
   - Camera activates automatically
   - Point at QR codes to scan

---

## Troubleshooting:

**If you don't have a superuser account:**

You'll need to create one using Railway CLI:
```bash
railway run python manage.py createsuperuser
```

Or ask someone with Railway access to create it for you.

**If Django Admin URL doesn't work:**

Make sure your backend URL is correct:
```
https://api-production-34dd.up.railway.app/admin/
```

**If ticket types don't show in frontend:**

1. Check that `is_active` is checked
2. Verify the slugs are exactly: `3day`, `2day`, `1day`
3. Check that `quantity_available` is greater than 0
