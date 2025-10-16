# 🛒 Complete Stripe Integration Setup Guide

## Overview

Your NoMatch e-commerce site now has a **complete, professional payment system** with:
- ✅ Stripe Checkout with dynamic pricing
- ✅ Coupon/discount code support  
- ✅ Automatic inventory updates
- ✅ Email notifications (success & failure)
- ✅ Invoice generation
- ✅ Order management dashboard
- ✅ Low stock alerts

---

## 📋 Step-by-Step Setup

### **1. Get Your Stripe API Keys**

1. Create a Stripe account at https://dashboard.stripe.com/register
2. Go to **Developers → API Keys**
3. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

---

### **2. Set Up Gmail App Password (for emails)**

**Option A: Gmail (Recommended for testing)**

1. Go to your Google Account: https://myaccount.google.com/
2. Go to **Security → 2-Step Verification** (enable if not already)
3. Go to **Security → App Passwords**
4. Create a new app password for "Mail"
5. Copy the 16-character password

**Option B: SendGrid (Recommended for production)**

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API key
3. Use these settings:
   - SMTP_HOST: smtp.sendgrid.net
   - SMTP_PORT: 587
   - SMTP_USER: apikey
   - SMTP_PASS: your_sendgrid_api_key

---

### **3. Configure Environment Variables**

Edit `.env.local` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
ADMIN_EMAIL=admin@nomatch.com
WEBSITE_URL=http://localhost:5175
```

---

### **4. Set Up Firebase Cloud Functions**

1. **Install Firebase CLI** (if not already):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Functions** (select your existing project):
   ```bash
   firebase init functions
   ```
   - Select: Use existing project
   - Language: TypeScript
   - ESLint: No
   - Install dependencies: Yes

4. **Install dependencies in functions folder**:
   ```bash
   cd functions
   npm install
   cd ..
   ```

5. **Configure Firebase Function Environment Variables**:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_your_key"
   firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
   firebase functions:config:set smtp.host="smtp.gmail.com"
   firebase functions:config:set smtp.port="587"
   firebase functions:config:set smtp.user="your-email@gmail.com"
   firebase functions:config:set smtp.pass="your-app-password"
   firebase functions:config:set admin.email="admin@nomatch.com"
   firebase functions:config:set website.url="https://yourdomain.com"
   ```

6. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

---

### **5. Create Stripe Webhook**

1. **Deploy your functions first** (see step 4)
2. Get your Cloud Function URL: 
   - It will be printed after deployment
   - Format: `https://us-central1-nomatch-df763.cloudfunctions.net/stripeWebhook`
3. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
4. Click **Add endpoint**
5. **Endpoint URL**: Your Cloud Function webhook URL
6. **Events to listen for**:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
7. **Copy the Webhook Signing Secret** (starts with `whsec_`)
8. Add it to Firebase config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_your_secret"
   firebase deploy --only functions
   ```

---

### **6. Create Discount Coupons in Stripe**

1. Go to [Stripe Dashboard → Products → Coupons](https://dashboard.stripe.com/coupons)
2. Click **Create coupon**
3. Examples:
   - **Code**: WELCOME10 → 10% off
   - **Code**: SAVE20 → $20 off
   - **Code**: FIRSTORDER → 15% off

---

### **7. Test the Integration**

#### **Test Cards** (Stripe provides these):
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any:
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

#### **Testing Flow**:
1. Add items to cart
2. Go to checkout
3. Apply coupon code (if you created one)
4. Click "Place Order"
5. Use test card `4242 4242 4242 4242`
6. Complete payment
7. Check:
   - ✅ Redirects to success page
   - ✅ Email confirmation received
   - ✅ Invoice received
   - ✅ Inventory reduced in admin dashboard
   - ✅ Order appears in admin "Orders" tab

---

### **8. Testing Failed Payments**

1. Use declined card: `4000 0000 0000 0002`
2. Check:
   - ✅ Customer receives "Payment Failed" email
   - ✅ Admin receives alert (if over $100)
   - ✅ Order marked as failed in admin dashboard
   - ✅ Inventory NOT reduced

---

## 📧 Email Accounts You Need

### **Option 1: Gmail (Free - Good for Testing)**
- **What**: Use your existing Gmail
- **Cost**: FREE
- **Limit**: ~500 emails/day
- **Setup**: Create App Password (see step 2 above)

### **Option 2: SendGrid (Free - Best for Production)**
- **What**: Professional email service
- **Cost**: FREE tier (100 emails/day), $15/mo (40,000 emails)
- **Limit**: Scalable
- **Setup**: 
  1. Sign up at sendgrid.com
  2. Verify domain (optional but recommended)
  3. Create API key

### **Option 3: AWS SES (Pay-as-you-go)**
- **What**: Amazon email service
- **Cost**: $0.10 per 1,000 emails
- **Best for**: High volume

---

## 🔍 What Happens When a Customer Checks Out

### **Successful Payment Flow**:
1. Customer clicks "Place Order" → Redirects to Stripe Checkout
2. Customer pays → Stripe processes payment
3. **Webhook triggered** → Your Firebase Function runs:
   - ✅ Creates order in Firestore
   - ✅ Reduces inventory quantities
   - ✅ Sends confirmation email to customer
   - ✅ Generates and emails invoice
   - ✅ Checks for low stock → Alerts admin if needed
4. Customer redirected to success page

### **Failed Payment Flow**:
1. Payment fails on Stripe
2. **Webhook triggered** → Your Firebase Function runs:
   - ✅ Creates failed order record
   - ✅ Sends "Payment Failed" email to customer
   - ✅ Alerts admin (if high-value order)
   - ✅ Inventory NOT touched (nothing deducted)
3. Customer can retry payment

---

## 🎯 Admin Dashboard Features

Access at: `https://yourdomain.com/admin/dashboard`

### **Inventory Tab**:
- View all products
- Update stock quantities
- See real-time stock levels
- Initialize products

### **Orders Tab**:
- View all orders (successful & failed)
- See order details (customer, items, total)
- Track fulfillment status
- See which emails were sent
- Filter by payment status

### **Analytics Tab**:
- Total orders count
- Success/failure rates
- Total revenue
- Recent order activity

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Replace test Stripe keys with **live keys** (`pk_live_` and `sk_live_`)
- [ ] Update `WEBSITE_URL` in environment to your production domain
- [ ] Set up production email service (SendGrid recommended)
- [ ] Deploy Firebase Functions: `firebase deploy --only functions`
- [ ] Deploy website: `firebase deploy --only hosting` or deploy to Netlify/Vercel
- [ ] Update Stripe webhook URL to production Cloud Function URL
- [ ] Test with real card (small amount first!)
- [ ] Update company info in invoice generator (functions/src/index.ts)

---

## 📝 Important Notes

### **Stripe Test vs Live Mode**:
- **Test mode**: Use `pk_test_` and `sk_test_` keys
- **Live mode**: Use `pk_live_` and `sk_live_` keys
- Webhooks are separate for test and live mode!

### **Email Sending Limits**:
- Gmail: ~500/day (good for testing)
- SendGrid Free: 100/day
- SendGrid Paid: 40,000/day for $15/mo

### **Firebase Function Costs**:
- Free tier: 2 million invocations/month
- After that: $0.40 per million invocations
- Your volume: Probably free forever!

---

## 🐛 Troubleshooting

### **Webhook not working?**
- Check Firebase Function logs: `firebase functions:log`
- Verify webhook secret is set correctly
- Check Stripe webhook dashboard for delivery attempts

### **Emails not sending?**
- Verify SMTP credentials
- Check Gmail "Less secure apps" or use App Password
- Check Firebase Function logs for errors

### **Inventory not updating?**
- Check webhook is firing (Stripe dashboard)
- Check Firebase Function logs
- Verify Firestore rules allow writes

### **Local Testing**:
```bash
# Test functions locally
cd functions
npm run serve

# In another terminal, test with:
firebase emulators:start
```

---

## 💡 Next Steps (Optional Enhancements)

1. **Email Templates**: Make emails more beautiful
2. **Order Tracking**: Let customers track their orders
3. **Refund System**: Process refunds from admin dashboard
4. **Abandoned Cart**: Email customers who didn't complete checkout
5. **Multi-currency**: Support international customers
6. **Tax Calculation**: Use Stripe Tax for automatic tax
7. **Subscriptions**: Recurring payments for memberships

---

## ✅ You're All Set!

Once you complete the setup steps above, your NoMatch store will have:
- 💳 Professional payment processing
- 📧 Automatic email notifications
- 📊 Full order tracking
- 📦 Inventory management
- 🧾 Invoice generation

**You have a production-ready e-commerce platform!** 🎉

