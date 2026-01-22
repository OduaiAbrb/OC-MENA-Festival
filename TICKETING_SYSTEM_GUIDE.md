# OC MENA Festival - Complete Ticketing System Guide

## 🎫 System Overview

The OC MENA Festival ticketing system is a complete end-to-end solution that handles:
- **Ticket Purchases** (Attendee & Vendor Booth tickets)
- **QR Code Generation** for entry validation
- **Ticket Transfers** between users
- **Ticket Upgrades** to higher tiers
- **Vendor Management** with booth assignments
- **Demo Mode** for testing without real payments

---

## 🔄 Complete User Journey

### **1. Purchase Flow (Tickets Page → Checkout → Payment)**

#### Frontend Pages:
- **`/tickets`** - Browse and select ticket types
- **`/checkout`** - Complete purchase with billing info
- **`/dashboard`** - View purchased tickets with QR codes

#### Backend APIs:
```
GET  /api/tickets/types/          # Fetch available ticket types
POST /api/payments/checkout/create-intent/  # Create order & payment intent
POST /api/payments/checkout/confirm/         # Confirm payment
GET  /api/payments/checkout/demo-mode/       # Check if demo mode active
```

#### How It Works:
1. User selects tickets on `/tickets` page
2. Clicks "Get Tickets" → redirected to `/checkout`
3. If not logged in → redirected to `/login?redirect=/checkout`
4. After login, cart data restored from `localStorage.pendingCart`
5. User fills billing details and payment info
6. Frontend calls `api.createPaymentIntent(items, idempotencyKey)`
7. Backend creates Order with status `PAYMENT_PENDING`
8. Frontend calls `api.confirmPayment(orderId)`
9. Backend processes payment (Stripe or Demo mode)
10. Order status → `COMPLETED`, tickets generated with QR codes
11. User redirected to `/dashboard` to view tickets

---

### **2. QR Code Display (Dashboard)**

#### Frontend Page:
- **`/dashboard`** - "Tickets" section shows all purchased tickets

#### Backend APIs:
```
GET /api/tickets/my/              # Get user's tickets
GET /api/tickets/{id}/qr/         # Get QR code image for specific ticket
```

#### How It Works:
1. Dashboard loads tickets via `api.getMyTickets()`
2. Each ticket has a unique `ticket_code` (e.g., `MENA-2024-ABC123`)
3. QR code generated on backend using `qrcode` library
4. QR contains ticket validation data: `{ticket_id, code, event_id, user_id}`
5. Frontend displays QR code image for each ticket
6. QR codes can be scanned at event entry for validation

---

### **3. Ticket Transfer Flow**

#### Frontend Page:
- **`/dashboard`** - "Tickets" section with "Transfer" button per ticket

#### Backend APIs:
```
GET  /api/tickets/transfers/              # Get user's transfer history
POST /api/tickets/transfers/create/       # Initiate transfer
POST /api/tickets/transfers/{id}/cancel/  # Cancel pending transfer
POST /api/tickets/transfers/accept/       # Accept transfer (via email link)
```

#### How It Works:
1. User clicks "Transfer" on a ticket in dashboard
2. Enters recipient's email address
3. Frontend calls `api.createTransfer(ticketId, toEmail)`
4. Backend creates `TicketTransfer` with status `PENDING`
5. Email sent to recipient with unique transfer token
6. Recipient clicks link → `/transfer/accept?token=xyz`
7. If recipient has account → auto-accept transfer
8. If no account → prompted to register first
9. Transfer status → `COMPLETED`, ticket ownership changes
10. Original owner can cancel before acceptance

---

### **4. Ticket Upgrade Flow**

#### Frontend Page:
- **`/dashboard`** - "Tickets" section with "Upgrade" button

#### Backend APIs:
```
GET  /api/tickets/upgrades/available/     # Get upgrade options for ticket
POST /api/tickets/upgrades/create/        # Create upgrade request
POST /api/payments/checkout/create-intent/  # Pay upgrade difference
```

#### How It Works:
1. User clicks "Upgrade" on a ticket
2. System shows available higher-tier tickets
3. Calculates price difference (upgrade cost)
4. User confirms upgrade
5. Frontend creates payment intent for difference
6. After payment confirmation:
   - Original ticket marked as `UPGRADED`
   - New ticket issued at higher tier
   - QR code regenerated for new ticket
7. Old QR code invalidated, new QR code active

---

### **5. Vendor Booth Purchase Flow**

#### Frontend Pages:
- **`/vendor-booths`** - Browse and select booth packages
- **`/checkout`** - Complete booth purchase
- **`/dashboard`** - "Vendor Booth" section

#### Backend APIs:
```
GET  /api/vendors/list/           # Get public vendor listings
POST /api/vendors/register/       # Register as vendor
GET  /api/vendors/profile/        # Get vendor profile
GET  /api/vendors/dashboard/      # Get vendor dashboard data
```

#### How It Works:
1. User browses booth options on `/vendor-booths`
2. Selects booth type (Bazaar, Food Truck, Food Booth)
3. Chooses days (3-day or 2-day)
4. Adds upgrades (larger space, etc.)
5. Fills vendor registration form
6. Proceeds to checkout (same flow as tickets)
7. After payment:
   - User role upgraded to `VENDOR`
   - Vendor profile created
   - Booth assignment pending
   - 4 guest tickets included automatically
   - Vendor credentials generated

---

### **6. Vendor Dashboard Features**

#### Frontend Page:
- **`/dashboard`** - "Vendor Booth" section (only for vendors)

#### What Vendors See:
- **Booth Details**: Type, size, location (when assigned)
- **Setup Information**: 
  - Setup times (Fri evening, Sat 8-11 AM)
  - Teardown schedule
  - Load-in instructions
- **Vendor QR Code**: Unique QR for wristband pickup
- **Included Tickets**: 4 guest entry tickets + 1 parking
- **Booth Assignment Status**: 
  - `PENDING` → awaiting assignment
  - `ASSIGNED` → booth number confirmed
  - Email notification when assigned
- **Additional Purchases**: Option to buy more guest tickets

---

## 🔧 Backend Architecture

### **Django Apps Structure:**

```
backend/
├── apps/
│   ├── accounts/      # User authentication & profiles
│   ├── tickets/       # Ticket types, orders, transfers, upgrades
│   ├── payments/      # Stripe integration, payment intents
│   ├── vendors/       # Vendor profiles, booth assignments
│   ├── scanning/      # QR code validation at event
│   ├── wallet/        # Apple/Google Wallet integration
│   └── config/        # Event settings, feature flags
```

### **Key Models:**

**Tickets App:**
- `TicketType` - Ticket categories (1-Day, 3-Day, VIP, etc.)
- `Order` - Purchase orders with status tracking
- `Ticket` - Individual tickets with QR codes
- `TicketTransfer` - Transfer requests between users
- `TicketUpgrade` - Upgrade history

**Vendors App:**
- `VendorProfile` - Vendor business information
- `Booth` - Physical booth spaces
- `BoothAssignment` - Vendor-to-booth mapping
- `VendorSetupLog` - Check-in/check-out tracking

**Payments App:**
- `PaymentAttempt` - Payment transaction logs
- `StripeEvent` - Webhook event processing

---

## 🎭 Demo Mode

### **How It Works:**
- Detects if `STRIPE_SECRET_KEY` is missing in environment
- Simulates payment processing without real charges
- Test card: `4242 4242 4242 4242` (any expiry/CVC)
- All features work identically to production
- Orders marked as `DEMO` in backend

### **Frontend Detection:**
```javascript
const response = await api.checkDemoMode();
if (response.data.demo_mode) {
  // Show demo banner
  // Allow any card details
}
```

---

## 🔐 Authentication Flow

### **JWT Token System:**
1. User logs in → receives `access` and `refresh` tokens
2. Access token stored in `localStorage.accessToken`
3. Refresh token stored in `localStorage.refreshToken`
4. All API calls include: `Authorization: Bearer {accessToken}`
5. On 401 error → auto-refresh using refresh token
6. If refresh fails → redirect to `/login`

### **Protected Routes:**
- `/dashboard` - Requires authentication
- `/checkout` - Requires authentication
- `/api/tickets/my/` - Requires authentication
- `/api/vendors/dashboard/` - Requires VENDOR role

---

## 📱 QR Code Validation (Event Entry)

### **Scanning App Flow:**
1. Staff uses scanning app (separate mobile app)
2. Scans attendee's QR code
3. App calls: `POST /api/scanning/validate/`
4. Backend checks:
   - Ticket exists and is valid
   - Not already scanned (prevents re-entry)
   - Correct event and date
   - Not transferred or upgraded
5. Returns: `VALID`, `INVALID`, or `ALREADY_SCANNED`
6. Logs scan in `TicketScanLog` model

---

## 🚀 Deployment

### **Railway Backend:**
- Auto-deploys from `main` branch
- Runs migrations on deploy: `python manage.py migrate`
- Seeds EventConfig: `python manage.py seed_event_config`
- Environment variables required:
  - `DATABASE_URL` (PostgreSQL)
  - `STRIPE_SECRET_KEY` (optional - enables live mode)
  - `SENDGRID_API_KEY` (for emails)
  - `SECRET_KEY` (Django secret)

### **Cloudflare Pages Frontend:**
- Auto-deploys from `main` branch
- Build command: `npm run build`
- Environment variable: `REACT_APP_API_URL`

---

## 📊 Complete API Reference

### **Tickets:**
```
GET    /api/tickets/types/              # List available ticket types
GET    /api/tickets/my/                 # User's tickets
GET    /api/tickets/{id}/               # Ticket details
GET    /api/tickets/{id}/qr/            # QR code image
```

### **Transfers:**
```
GET    /api/tickets/transfers/          # Transfer history
POST   /api/tickets/transfers/create/   # Create transfer
POST   /api/tickets/transfers/{id}/cancel/  # Cancel transfer
POST   /api/tickets/transfers/accept/   # Accept transfer
```

### **Upgrades:**
```
GET    /api/tickets/upgrades/available/ # Available upgrades
POST   /api/tickets/upgrades/create/    # Request upgrade
```

### **Payments:**
```
POST   /api/payments/checkout/create-intent/  # Create payment
POST   /api/payments/checkout/confirm/        # Confirm payment
GET    /api/payments/checkout/demo-mode/      # Check demo mode
GET    /api/payments/orders/                  # User's orders
GET    /api/payments/orders/{id}/             # Order details
```

### **Vendors:**
```
GET    /api/vendors/list/               # Public vendor list
POST   /api/vendors/register/           # Register as vendor
GET    /api/vendors/profile/            # Vendor profile
GET    /api/vendors/dashboard/          # Vendor dashboard
PATCH  /api/vendors/profile/            # Update profile
```

### **Auth:**
```
POST   /api/auth/register/              # Create account
POST   /api/auth/login/                 # Login
POST   /api/auth/logout/                # Logout
POST   /api/auth/token/refresh/         # Refresh token
GET    /api/auth/me/                    # Current user
PATCH  /api/auth/me/                    # Update profile
```

---

## ✅ Testing the Complete Cycle

### **End-to-End Test:**

1. **Purchase Tickets:**
   - Go to `/tickets`
   - Select quantities
   - Click "Get Tickets"
   - Login/Register
   - Complete checkout
   - ✅ Verify order created

2. **View QR Codes:**
   - Go to `/dashboard`
   - Click "Tickets"
   - ✅ See QR codes for each ticket

3. **Transfer Ticket:**
   - Click "Transfer" on a ticket
   - Enter friend's email
   - ✅ Friend receives email
   - Friend accepts transfer
   - ✅ Ticket appears in friend's dashboard

4. **Upgrade Ticket:**
   - Click "Upgrade" on 1-Day ticket
   - Select 3-Day upgrade
   - Pay difference
   - ✅ New 3-Day ticket with new QR code

5. **Purchase Vendor Booth:**
   - Go to `/vendor-booths`
   - Select booth type
   - Fill registration form
   - Complete checkout
   - ✅ Vendor dashboard unlocked

6. **Vendor Dashboard:**
   - Go to `/dashboard` → "Vendor Booth"
   - ✅ See booth details
   - ✅ See vendor QR code
   - ✅ See 4 included guest tickets

---

## 🐛 Troubleshooting

### **500 Error on `/api/tickets/types/`:**
- **Cause:** EventConfig not seeded in database
- **Fix:** Run `python manage.py seed_event_config`
- **Prevention:** Added to Railway startup command

### **Cart Lost After Login:**
- **Cause:** Cart not persisted to localStorage
- **Fix:** Cart saved to `localStorage.pendingCart` before redirect
- **Restore:** Retrieved after login in checkout useEffect

### **QR Code Not Displaying:**
- **Cause:** Missing ticket_code or QR generation failed
- **Fix:** Check ticket has valid `ticket_code` field
- **Backend:** QR generated in `TicketQRView`

### **Transfer Email Not Sending:**
- **Cause:** SendGrid not configured
- **Fix:** Set `SENDGRID_API_KEY` environment variable
- **Fallback:** Transfer still works, manual notification needed

---

## 📝 Summary

The OC MENA Festival ticketing system provides a complete solution for:
- ✅ Ticket sales (attendee & vendor)
- ✅ QR code generation and validation
- ✅ Ticket transfers between users
- ✅ Ticket upgrades to higher tiers
- ✅ Vendor booth management
- ✅ Demo mode for testing
- ✅ Mobile-responsive dashboard
- ✅ Secure JWT authentication
- ✅ Stripe payment integration

All backend APIs are wired and ready. Frontend pages display data from backend. The complete purchase → QR → transfer → vendor cycle is functional.
