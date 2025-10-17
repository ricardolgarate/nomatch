# Embedded Stripe Checkout Guide

## 🎯 Overview

Your checkout now uses **Stripe Payment Element** - customers complete payment directly on your site without being redirected to Stripe's hosted checkout page.

## ✨ Features

- ✅ **Embedded payment** - No redirect, stays on nomatch.us
- ✅ **Automatic payment methods** - Cards, Apple Pay, Google Pay, etc.
- ✅ **Promo code support** - Custom promo code input with server-side validation
- ✅ **3D Secure** - Automatically handled by Stripe
- ✅ **Order numbers** - Format: `NM-YYYYMMDD-XXXX`
- ✅ **Customer info preservation** - All form data passed to Stripe
- ✅ **Real-time validation** - Secure payment processing

---

## 🔄 Checkout Flow

### User Journey:

1. **Customer fills out checkout form**
   - Email, name, address, phone
   - All validated before proceeding

2. **Clicks "Continue to Payment"**
   - Form data is validated
   - Payment section appears below
   - Page auto-scrolls to payment

3. **Enters payment details**
   - Optional: Enters promo code
   - Fills in card/payment info in Stripe Element
   - Stripe handles card validation

4. **Clicks "Pay Now"**
   - PaymentIntent created with final amount (after discount)
   - Stripe processes payment
   - 3D Secure popup if needed

5. **Success/Failure**
   - Success → Redirected to `/checkout/success`
   - Failure → Error message shown, can retry

6. **Webhook fires**
   - `payment_intent.succeeded` → Order saved, inventory updated
   - `payment_intent.payment_failed` → Failure logged

---

## 🔧 Environment Variables

### Required Variables (add to Vercel & `.env`):

```env
# ===== Stripe (Frontend - Publishable Key) =====
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Get from: https://dashboard.stripe.com/apikeys

# ===== Stripe (Backend - Secret Key) =====
STRIPE_SECRET_KEY=sk_test_...
# Get from: https://dashboard.stripe.com/apikeys

# ===== Stripe Webhook Secret =====
STRIPE_WEBHOOK_SECRET=whsec_...
# Get from: https://dashboard.stripe.com/webhooks

# ===== Application URL =====
APP_URL=https://nomatch.vercel.app
# Change to https://nomatch.us in production

# ===== Firebase Frontend =====
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# ===== Firebase Admin (Backend) =====
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 💰 Promo Code System

### How It Works:

1. **Customer enters promo code** in the payment form
2. **Server validates** the code via Stripe API
3. **Discount calculated** (percentage or fixed amount)
4. **PaymentIntent created** with final discounted amount

### Creating Promo Codes in Stripe:

1. **Stripe Dashboard** → **Products** → **Coupons**
2. Click **"Create coupon"**
3. Choose:
   - **Percentage discount** (e.g., 10% off)
   - **Fixed amount** (e.g., $5 off)
4. Click **"Create"**
5. Create **Promotion Code**:
   - Enter code (e.g., `WELCOME10`)
   - Set restrictions if needed
   - Click **"Create promotion code"**

### Example Promo Codes:

```javascript
// In Stripe Dashboard:
WELCOME10     → 10% off entire order
FIRSTORDER    → $15 off
SPRING25      → 25% off
FREESHIP      → Free shipping (handle in your code)
```

### Testing Promo Codes:

```
1. Create test promo code in Stripe (test mode)
2. Enter code in payment form
3. Verify discount is applied
4. Complete test payment
5. Check webhook logs for correct amount
```

---

## 🎨 Payment Element Customization

The payment form is styled to match your brand:

```typescript
appearance: {
  theme: 'stripe',
  variables: {
    colorPrimary: '#ec4899',      // Pink-500 (your brand color)
    colorBackground: '#ffffff',    // White
    colorText: '#1f2937',         // Gray-900
    colorDanger: '#ef4444',       // Red for errors
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
  },
}
```

To customize further, update `src/components/StripePaymentForm.tsx`.

---

## 📋 API Endpoints

### `/api/create-payment-intent` (POST)

**Request:**
```json
{
  "items": [
    {
      "id": "nomatch-classic",
      "name": "NoMatch Classic",
      "image": "https://...",
      "unitAmount": 17000,
      "quantity": 1,
      "currency": "usd",
      "sku": "01-001-M-WL",
      "size": "9",
      "category": "Shoes"
    }
  ],
  "promoCode": "WELCOME10",
  "orderNumber": "NM-20251017-5432",
  "customerInfo": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    ...
  },
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "orderNumber": "NM-20251017-5432",
  "total": 15300,
  "discount": 1700,
  "subtotal": 17000
}
```

### `/api/stripe-webhook` (POST)

Receives Stripe webhook events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed` (still supported)

---

## 🧪 Testing

### Test Cards (Stripe Test Mode):

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any valid code  

### Test with Promo Codes:

1. Create test promo in Stripe test mode
2. Enter code `WELCOME10` during checkout
3. Verify discount is applied
4. Use test card `4242 4242 4242 4242`
5. Check webhook logs in Vercel

### Local Testing:

```bash
# Start dev server
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:5175/api/stripe-webhook

# Trigger test payment
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

## 🔍 Troubleshooting

### Payment Element not loading?
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Verify key starts with `pk_test_` or `pk_live_`
- Check browser console for errors

### Promo code not working?
- Verify promo code exists in Stripe Dashboard
- Check it's active and not expired
- View API logs for validation errors

### Webhook not firing?
- Verify webhook URL in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` is correct
- View Vercel function logs for errors

### Order not saving to Firestore?
- Check Firebase Admin credentials are set
- Verify Firestore rules allow writes
- View webhook logs in Vercel

---

## 📊 Monitoring

### View Orders:
- **Firestore**: `orders` collection
- **Stripe Dashboard**: Payments → filter by status
- **Vercel Logs**: Functions → stripe-webhook

### View Failed Payments:
- **Firestore**: `failed_payments` collection
- **Stripe Dashboard**: Payments → Declined

### Analytics:
- Tracked in Firebase Analytics
- View in Admin Dashboard
- Events: `checkout_initiated`, `payment_failed`, `purchase_completed`

---

## 🚀 Going Live

### Checklist:

- [ ] Add all environment variables to Vercel
- [ ] Switch Stripe keys to live mode (`pk_live_`, `sk_live_`)
- [ ] Update webhook URL to production domain
- [ ] Test with real card in test mode first
- [ ] Create production promo codes
- [ ] Set up email service (Resend/SendGrid)
- [ ] Monitor first few orders closely
- [ ] Add order management to Admin Dashboard

---

## 🎁 Differences from Hosted Checkout

### ✅ Advantages:
- User stays on your site
- Fully branded experience
- More control over UX
- Custom promo code UI

### ⚠️ Considerations:
- Must handle promo code logic yourself
- Need to style payment element
- Requires more frontend code
- PCI compliance (Stripe handles this via Elements)

---

## 🔐 Security

- ✅ Payment details never touch your server
- ✅ Stripe Elements are PCI compliant
- ✅ Webhook signature verification
- ✅ HTTPS required (enforced by Vercel)
- ✅ Customer data encrypted in transit

---

Your embedded checkout is ready! Customers can now pay directly on nomatch.us with a seamless experience. 🎉

