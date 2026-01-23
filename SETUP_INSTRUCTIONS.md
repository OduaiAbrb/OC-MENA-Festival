# Setup Instructions for New Features

## 1. Install jsQR Library

The Scanner component now uses jsQR for automatic QR code detection. You need to install it:

```bash
npm install jsqr
```

## 2. Run Django Migrations

New database tables need to be created for vendor registrations:

```bash
cd backend

# Activate virtual environment first (if you have one)
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Create migrations
python manage.py makemigrations vendors

# Apply migrations
python manage.py migrate
```

This will create two new tables:
- `bazaar_vendor_registrations` - Stores bazaar vendor form submissions
- `food_vendor_registrations` - Stores food vendor form submissions

## 3. Test the Scanner

1. Navigate to `/scanner` in your browser
2. Allow camera permissions when prompted
3. Point the camera at a QR code
4. The scanner will automatically detect and validate the QR code
5. If valid, you'll be redirected to the success page
6. If invalid or not a QR code, an error message will display

## 4. What's New

### Scanner Features:
- ✅ Automatic QR code detection (no manual button needed)
- ✅ Error handling for invalid/non-QR images
- ✅ Visual feedback (error messages, scanning status)
- ✅ Flashlight toggle for low-light conditions
- ✅ Test scan button for development
- ✅ Scans every 300ms for quick detection
- ✅ Prevents duplicate scans within 3 seconds

### Vendor Registration:
- ✅ Bazaar vendor registration form at `/bazaar-vendor`
- ✅ Food vendor registration form at `/food-vendor`
- ✅ Both forms submit to backend API
- ✅ Full validation on frontend and backend

### Removed:
- ❌ Old QRScanner.jsx and QRScanner.css (replaced by new Scanner)
- ❌ Old `/scan` route (now uses `/scanner`)

## 5. API Endpoints Added

### Vendor Registration:
- `POST /api/vendors/bazaar-registration/` - Submit bazaar vendor registration
- `POST /api/vendors/food-registration/` - Submit food vendor registration

### Scanner:
- `POST /api/scanning/quick-scan/` - Quick QR validation (no auth)
- `POST /api/scanning/validate/` - Full scan validation (auth required)
- `POST /api/scanning/commit/` - Mark ticket as used
- `GET /api/scanning/logs/` - Get scan history
- `GET /api/scanning/stats/` - Get scan statistics

## 6. Error Handling

The scanner now properly handles:
- **Invalid QR codes** - Shows error message
- **Non-QR images** (floor, random objects) - No action, continues scanning
- **Network errors** - Shows "Failed to validate ticket" message
- **Duplicate scans** - Prevents scanning same code within 3 seconds
- **Camera errors** - Logs to console

## 7. Testing Checklist

- [ ] Install jsQR: `npm install jsqr`
- [ ] Run migrations: `python manage.py makemigrations vendors && python manage.py migrate`
- [ ] Test scanner at `/scanner`
- [ ] Test bazaar vendor form at `/bazaar-vendor`
- [ ] Test food vendor form at `/food-vendor`
- [ ] Verify error messages appear for invalid QR codes
- [ ] Test flashlight toggle
- [ ] Test "Scan next ticket" flow on success page
