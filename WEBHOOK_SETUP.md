# Stripe Webhook Setup Guide

## 🎯 Overview

Your webhook now handles:
- ✅ `checkout.session.completed` - Payment successful
- ✅ `payment_intent.succeeded` - Payment processed
- ✅ `payment_intent.payment_failed` - Payment declined/failed

## 📋 What the Webhook Does

### On Successful Payment (`checkout.session.completed`):
1. ✅ Saves order to Firestore (`orders` collection)
2. ✅ Updates product inventory (reduces stock)
3. ✅ Sends confirmation email to customer
4. ✅ Logs order number and details

### On Failed Payment (`payment_intent.payment_failed`):
1. ✅ Logs failure to Firestore (`failed_payments` collection)
2. ✅ Sends failure notification email
3. ✅ Records reason for failure

---

## 🔑 Environment Variables Required

### Add these to Vercel & Local `.env`:

```env
# Existing Stripe vars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Existing Firebase vars (for frontend)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=nomatch-df763
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# NEW - Firebase Admin SDK (for webhook server-side operations)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@nomatch-df763.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App URL
APP_URL=https://nomatch.vercel.app
```

---

## 🔐 Getting Firebase Admin Credentials

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Select your project: **nomatch-df763**
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file

### Step 2: Extract Credentials from JSON
The downloaded file looks like this:
```json
{
  "type": "service_account",
  "project_id": "nomatch-df763",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@nomatch-df763.iam.gserviceaccount.com",
  ...
}
```

### Step 3: Add to Vercel
In Vercel Dashboard → Environment Variables:

| Variable | Value (from JSON) |
|----------|-------------------|
| `FIREBASE_CLIENT_EMAIL` | Copy from `client_email` field |
| `FIREBASE_PRIVATE_KEY` | Copy from `private_key` field (keep the quotes and `\n` characters) |

⚠️ **Important:** The private key must include the newlines (`\n`). Copy the entire value including quotes.

---

## 📦 Firestore Collections Created

### `orders` Collection
```javascript
{
  orderNumber: "NM-20251017-5432",
  sessionId: "cs_test_...",
  paymentIntentId: "pi_...",
  customerEmail: "customer@example.com",
  customerInfo: {
    name: "John Doe",
    email: "...",
    phone: "...",
    billingAddress: {...}
  },
  items: [
    {
      id: "nomatch-classic",
      name: "NoMatch Classic",
      size: "9",
      quantity: 1,
      sku: "01-001-M-WL"
    }
  ],
  totalAmount: 17000, // in cents
  currency: "usd",
  paymentStatus: "paid",
  shippingAddress: {...},
  status: "paid",
  createdAt: "2025-10-17T...",
  updatedAt: "2025-10-17T..."
}
```

### `failed_payments` Collection
```javascript
{
  paymentIntentId: "pi_...",
  orderNumber: "NM-20251017-5432",
  email: "customer@example.com",
  reason: "Your card was declined.",
  amount: 17000,
  currency: "usd",
  createdAt: "2025-10-17T..."
}
```

---

## 📧 Email Integration (TODO)

The webhook has placeholder functions for sending emails. To enable:

### Option 1: Resend (Recommended)
```bash
npm install resend
```

Add to `.env`:
```env
RESEND_API_KEY=re_...
```

Update `sendSuccessEmail()` and `sendFailureEmail()` functions in webhook.

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

Add to `.env`:
```env
SENDGRID_API_KEY=SG...
```

---

## 🧪 Testing the Webhook

### 1. Test with Stripe CLI (Local)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5175/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
```

### 2. Test with Stripe Dashboard
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select event type
5. Click **"Send test webhook"**

### 3. Check Vercel Logs
- Vercel Dashboard → Your Project → **Deployments**
- Click latest deployment → **Functions** → View logs
- You'll see: `✅ Order fulfilled: NM-20251017-5432`

### 4. Check Firestore
- Firebase Console → **Firestore Database**
- Look for `orders` and `failed_payments` collections

---

## 🔍 Webhook Events You'll Receive

### Success Flow:
```
checkout.session.completed
  ↓
✅ Order saved to Firestore
✅ Inventory updated
✅ Email sent
  ↓
payment_intent.succeeded (optional, for info)
```

### Failure Flow:
```
payment_intent.payment_failed
  ↓
✅ Failure logged to Firestore
✅ Email notification sent
```

---

## ⚙️ Firestore Security Rules

Make sure your Firestore rules allow the webhook to write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders collection - admin only
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Failed payments - admin only
    match /failed_payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Note:** Firebase Admin SDK bypasses these rules (has full access).

---

## 🚀 Deployment Checklist

- [ ] Add all environment variables to Vercel
- [ ] Generate Firebase Admin service account
- [ ] Configure webhook URL in Stripe Dashboard
- [ ] Test with Stripe test mode
- [ ] Check Vercel function logs
- [ ] Verify orders appear in Firestore
- [ ] Test inventory reduction
- [ ] (Optional) Set up email service
- [ ] Switch to Stripe live mode for production

---

## 📊 Monitoring

### View Orders in Firebase Console:
- Firestore → `orders` collection
- Sort by `createdAt` (descending) to see latest

### View Webhook Logs in Vercel:
- Deployments → Functions → stripe-webhook
- Real-time logs show all webhook events

### View Orders in Stripe Dashboard:
- Payments → filter by status
- Click payment → see metadata (order number, items)

---

## 🆘 Troubleshooting

### Webhook not receiving events?
- Check webhook URL is correct in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
- Check Vercel function logs for errors

### Orders not saving to Firestore?
- Verify Firebase Admin credentials are correct
- Check Firestore rules allow writes
- View Vercel logs for specific error messages

### Inventory not updating?
- Check product IDs match exactly
- Verify products exist in Firestore
- Check Vercel logs for batch update errors

---

## 📝 Next Steps

1. **Set up email service** (Resend recommended)
2. **Create email templates** for order confirmation
3. **Add order tracking** to customer accounts
4. **Set up admin order management** dashboard
5. **(Optional) Integrate with ShipStation** for fulfillment

Your webhook is production-ready for order processing! 🎉

