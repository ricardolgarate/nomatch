# Resend Email Setup Guide

## 🎯 Overview

Your NoMatch website now sends beautiful, branded order confirmation emails using Resend with custom React Email templates.

---

## 📧 Email Templates

### 1. **Order Confirmation Email** (`OrderConfirmation.tsx`)

Sent when payment succeeds. Includes:
- ✅ NoMatch logo
- ✅ Thank you message
- ✅ Personalized greeting
- ✅ Order number and date
- ✅ Product images
- ✅ Product names and sizes
- ✅ Quantities and prices
- ✅ Subtotal
- ✅ Discount (if coupon used)
- ✅ Shipping (FREE)
- ✅ Total amount
- ✅ Payment method (e.g., "VISA •••• 4242")
- ✅ Billing address
- ✅ Shipping information (3-5 days)
- ✅ Support contact info

### 2. **Payment Failed Email** (`PaymentFailed.tsx`)

Sent when payment fails. Includes:
- ✅ NoMatch logo
- ✅ Alert about failed payment
- ✅ Failure reason
- ✅ What to do next
- ✅ Link to complete order
- ✅ Support contact

---

## 🔧 Setup Instructions

### Step 1: Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### Step 2: Get API Key

1. In Resend Dashboard, click **API Keys**
2. Click **"Create API Key"**
3. Name it: `NoMatch Production`
4. Select permissions: **Sending access**
5. Click **Create**
6. **Copy the API key** (starts with `re_...`)

### Step 3: Add Domain to Resend

1. In Resend Dashboard, click **Domains**
2. Click **"Add Domain"**
3. Enter: `nomatch.us` (or your domain)
4. Follow DNS setup instructions:
   - Add TXT record for domain verification
   - Add MX, TXT, and CNAME records for email sending
5. Wait for verification (usually 5-30 minutes)

### Step 4: Add Environment Variables to Vercel

Go to **Vercel Dashboard → Settings → Environment Variables**

Add these **2 new variables**:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_your_api_key_here` |
| `EMAIL_FROM` | `NoMatch <support@nomatch.us>` |

**Important:** 
- Use your actual domain email: `orders@nomatch.us`
- Must match the verified domain in Resend
- Format: `Your Name <email@domain.com>`

### Step 5: Redeploy

After adding variables, click **"Redeploy"** in Vercel.

---

## 🧪 Testing Emails

### Test in Resend Dashboard (Recommended):

1. Resend Dashboard → **Emails**
2. Send a test email to your personal email
3. Verify it looks good and lands in inbox (not spam)

### Test with Stripe Test Mode:

1. Make a test purchase with card `4242 4242 4242 4242`
2. Complete payment
3. Check your email for order confirmation
4. Check Resend Dashboard → **Logs** to see email status

### Test Failed Payment:

1. Use test card `4000 0000 0000 0002` (card declined)
2. Try to complete payment
3. Check email for failure notification

---

## 📋 Order Data Stored in Firebase

Every successful order saves to Firestore `orders` collection:

```javascript
{
  orderNumber: "NM-20251018-5432",
  sessionId: "cs_test_...",
  paymentIntentId: "pi_...",
  customerEmail: "customer@example.com",
  customerInfo: {
    name: "John Doe",
    email: "customer@example.com",
    phone: "+1234567890",
    address: {
      line1: "123 Main St",
      line2: "",
      city: "Austin",
      state: "TX",
      postal_code: "78701",
      country: "US"
    }
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
  paymentMethod: "pm_...", // Stripe payment method ID
  metadata: {
    orderNumber: "NM-20251018-5432",
    subtotal: "17000",
    discount: "0",
    promoCode: "",
    cartItems: "[...]",
    customerInfo: "{...}"
  },
  shippingAddress: {...},
  status: "paid",
  createdAt: Date,
  updatedAt: Date
}
```

**All this data is used to generate the email!**

---

## 🚫 Disable Stripe Confirmation Emails

To prevent customers from receiving duplicate emails (one from Stripe, one from you):

### Option 1: Disable in Stripe Dashboard (Recommended)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Settings** (gear icon)
3. Click **Email Settings** (under Product Settings)
4. Scroll to **Customer emails**
5. **Uncheck** these options:
   - ✅ "Successful payments" (Disable this!)
   - ✅ "Refunded payments" (Keep or disable)
6. Click **Save**

### Option 2: Disable Per PaymentIntent

In your `create-payment-intent.ts`, add:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: total,
  currency,
  automatic_payment_methods: { enabled: true },
  receipt_email: null, // ← Disable Stripe receipt
  // ... rest of config
});
```

---

## 📧 Email Workflow

### Success Flow:
```
1. Customer completes payment
   ↓
2. Stripe webhook: payment_intent.succeeded
   ↓
3. Save order to Firestore (with ALL data)
   ↓
4. Update inventory
   ↓
5. Increment coupon usage
   ↓
6. Send Resend email with:
   - Order details from Firestore
   - Product images
   - Customer info
   - Payment details
   - Billing address
   ↓
7. Customer receives beautiful branded email
```

### Failure Flow:
```
1. Payment fails
   ↓
2. Stripe webhook: payment_intent.payment_failed
   ↓
3. Save to failed_payments collection
   ↓
4. Send failure email with:
   - Reason for failure
   - Steps to fix
   - Link to retry
   ↓
5. Customer can fix and retry
```

---

## 🎨 Customizing Email Templates

Edit files in `src/emails/`:

### Change Logo:
```typescript
<Img
  src="https://nomatch.us/Logo-NoMatch.webp"  // ← Change URL here
  alt="NoMatch"
  width="180"
  height="60"
/>
```

### Change Colors:
```typescript
const header = {
  borderBottom: '3px solid #ec4899', // ← Pink color
};

const link = {
  color: '#ec4899', // ← Pink links
};
```

### Add More Content:
Edit the JSX in `OrderConfirmation.tsx` to add:
- Promotional messages
- Product recommendations
- Social media links
- Referral codes

---

## 📊 Monitoring Emails

### View Sent Emails:
- **Resend Dashboard** → Emails
- See delivery status
- View open rates (if enabled)
- Check bounce rates

### View in Firestore:
- Orders collection has all email data
- Check `customerEmail` field
- Verify metadata includes all info

### View in Vercel Logs:
- Functions → `stripe-webhook`
- Look for: `✅ Email sent successfully`
- Errors will show: `❌ Error sending email`

---

## ⚠️ Important Notes

### Sending Limits:
- **Free tier**: 100 emails/day
- **Pro tier**: 50,000 emails/month
- Monitor usage in Resend Dashboard

### Email Deliverability:
- Use verified domain (nomatch.us)
- Don't use generic Gmail/Yahoo for `from` address
- Include unsubscribe link (if sending marketing)
- Monitor spam reports

### SPAM Prevention:
- ✅ Use real domain email (orders@nomatch.us)
- ✅ Include physical address in footer (optional but recommended)
- ✅ Don't send too many emails too quickly
- ✅ Personalize emails (we do this!)

---

## 🔐 Security

- ✅ API key stored in environment variables (secure)
- ✅ Never exposed to frontend
- ✅ Only webhooks can send emails (server-side)
- ✅ Customer data encrypted in Firestore
- ✅ Emails sent over HTTPS

---

## 🚀 Go Live Checklist

- [ ] Create Resend account
- [ ] Get API key
- [ ] Add and verify custom domain
- [ ] Add `RESEND_API_KEY` to Vercel
- [ ] Add `EMAIL_FROM` to Vercel
- [ ] Disable Stripe confirmation emails
- [ ] Test with real email address
- [ ] Check spam folder
- [ ] Verify email looks good on mobile
- [ ] Monitor Resend Dashboard for deliverability

---

## 💡 Pro Tips

### 1. **Test Before Going Live**
Send test orders to multiple email providers:
- Gmail
- Yahoo
- Outlook
- Apple Mail

### 2. **Preview Emails Locally**
```bash
npm run email:dev
```
(You can add this script to preview emails in browser)

### 3. **A/B Test Subject Lines**
Try different subject lines to improve open rates:
- "Your NoMatch Order is Confirmed! 🎉"
- "Thank You for Your NoMatch Order #12345"
- "Order Confirmed – NoMatch Sneakers Coming Your Way!"

### 4. **Add Order Tracking**
When you integrate shipping:
```typescript
<Link href={`https://track.yourshipping.com/${trackingNumber}`}>
  Track Your Order
</Link>
```

---

Your email system is production-ready! 📧✨

