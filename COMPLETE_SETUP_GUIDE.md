# 🚀 Complete Setup Guide for NoMatch E-Commerce

## ✅ What You Have Now

Your `.env.local` file has been configured with Firebase credentials. Now you need to add the remaining keys.

---

## 📝 Step-by-Step Setup

### **Step 1: Get Stripe API Keys** (REQUIRED)

1. Go to https://dashboard.stripe.com/register (create account if needed)
2. Go to **Developers → API Keys**
3. Copy your keys and **update `.env.local`**:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx  (copy from Stripe)
   STRIPE_SECRET_KEY=sk_test_51xxxxx  (copy from Stripe)
   ```

---

### **Step 2: Set Up Email for Invoices** (REQUIRED)

You have **3 options**:

#### **Option A: Gmail (Easiest for Testing)** ⭐ RECOMMENDED FOR NOW

1. **Enable 2-Step Verification**:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" → Turn it on

2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

3. **Update `.env.local`**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  (no spaces!)
   ADMIN_EMAIL=your-email@gmail.com
   ```

#### **Option B: SendGrid (Best for Production)**

1. Sign up at https://sendgrid.com (FREE: 100 emails/day)
2. Create API Key: **Settings → API Keys → Create API Key**
3. Update `.env.local`:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.your_api_key_here
   ADMIN_EMAIL=your-email@gmail.com
   ```

#### **Option C: Resend (Modern, Developer-Friendly)**

1. Sign up at https://resend.com (FREE: 3,000 emails/month)
2. Much simpler than SendGrid
3. Better deliverability than Gmail

---

### **Step 3: Deploy Firebase Cloud Functions**

1. **Install Firebase CLI** (if not done):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**:
   ```bash
   firebase login
   ```

3. **Install function dependencies**:
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Set Firebase Function Config** (copy these exact commands):
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY"
   firebase functions:config:set smtp.host="smtp.gmail.com"
   firebase functions:config:set smtp.port="587"
   firebase functions:config:set smtp.user="your-email@gmail.com"
   firebase functions:config:set smtp.pass="your-app-password"
   firebase functions:config:set admin.email="your-email@gmail.com"
   firebase functions:config:set website.url="http://localhost:5175"
   ```

5. **Deploy functions**:
   ```bash
   firebase deploy --only functions
   ```

6. **Copy the webhook URL** (shown after deployment):
   ```
   Example: https://us-central1-nomatch-df763.cloudfunctions.net/stripeWebhook
   ```

---

### **Step 4: Create Stripe Webhook**

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: Paste your Cloud Function webhook URL from Step 3
4. **Events to send**:
   - Select `checkout.session.completed`
   - Select `payment_intent.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing Secret** (starts with `whsec_`)
7. **Add to Firebase**:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
   firebase deploy --only functions
   ```

---

### **Step 5: Create Test Coupons**

1. Go to https://dashboard.stripe.com/coupons
2. Click **"Create coupon"**
3. Create these for testing:
   - **WELCOME10**: 10% off
   - **SAVE20**: $20.00 off
   - **FIRSTORDER**: 15% off

---

### **Step 6: Deploy Firestore Rules**

```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Testing Your Setup

### **Test Successful Payment**:

1. Run your site: `npm run dev`
2. Add items to cart
3. Go to checkout
4. Enter email: `test@example.com`
5. Apply coupon: `WELCOME10` (if you created it)
6. Click "Place Order"
7. Use test card: `4242 4242 4242 4242`
8. Any future expiry, any CVC, any ZIP
9. Complete payment

### **What Should Happen**:
- ✅ Redirects to success page
- ✅ Email sent to customer (order confirmation + invoice)
- ✅ Inventory reduced in admin dashboard
- ✅ Order appears in admin "Orders" tab
- ✅ If stock ≤ 5, admin gets low inventory alert

### **Test Failed Payment**:

1. Use declined card: `4000 0000 0000 0002`
2. Payment should fail
3. **What Should Happen**:
   - ✅ Customer gets "Payment Failed" email
   - ✅ Admin gets alert (if amount > $100)
   - ✅ Order marked as "failed" in admin dashboard
   - ✅ Inventory NOT reduced

---

## 📧 Which Email Service Should You Use?

### **For Testing (Now)**:
👉 **Use Gmail** - Quick and easy

### **For Production (Later)**:
👉 **Use SendGrid** or **Resend**
- Better deliverability
- Professional sender reputation
- Higher limits
- Analytics

---

## 🔑 Summary of Accounts You Need

| Service | What For | Cost | Required? |
|---------|----------|------|-----------|
| **Stripe** | Payments | Free (2.9% + $0.30 per transaction) | ✅ YES |
| **Gmail or SendGrid** | Emails & Invoices | Free tier available | ✅ YES |
| **Firebase** | Backend & Database | Free tier (already have) | ✅ Already Set Up |

---

## ⚙️ Your Current `.env.local` Setup

```bash
# ✅ Firebase - Already configured
FIREBASE_PROJECT_ID=nomatch-df763
FIREBASE_PRIVATE_KEY=... (configured)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@nomatch-df763.iam.gserviceaccount.com

# ⚠️ STRIPE - YOU NEED TO ADD THESE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here  ← REPLACE THIS
STRIPE_SECRET_KEY=sk_test_your_key_here  ← REPLACE THIS

# ⚠️ EMAIL - YOU NEED TO ADD THESE
SMTP_USER=your-email@gmail.com  ← REPLACE THIS
SMTP_PASS=your-app-password  ← REPLACE THIS (16 chars from Gmail)
ADMIN_EMAIL=admin@nomatch.com  ← REPLACE THIS
```

---

## 🎯 Quick Start Commands

```bash
# 1. Install everything
npm install
cd functions && npm install && cd ..

# 2. Deploy functions
firebase deploy --only functions

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Run locally
npm run dev

# 5. Test checkout
# Visit: http://localhost:5175
# Add products → Checkout → Use test card: 4242 4242 4242 4242
```

---

## ✅ Final Checklist

Before going live, make sure you have:

### **Accounts Created**:
- [ ] Stripe account (test mode)
- [ ] Gmail App Password OR SendGrid account

### **Configuration Done**:
- [ ] `.env.local` updated with Stripe keys
- [ ] `.env.local` updated with email credentials
- [ ] Firebase Functions config set (all 8 variables)
- [ ] Functions deployed
- [ ] Stripe webhook created and configured
- [ ] Test coupons created in Stripe

### **Testing Completed**:
- [ ] Successful payment test (with test card)
- [ ] Failed payment test (with decline card)
- [ ] Coupon code works
- [ ] Email confirmation received
- [ ] Invoice received
- [ ] Admin dashboard shows order
- [ ] Inventory updated correctly

### **Production Ready**:
- [ ] Switch to live Stripe keys (`pk_live_` and `sk_live_`)
- [ ] Update website URL in Firebase config
- [ ] Deploy to production hosting
- [ ] Update webhook to production URL
- [ ] Test with real card (small amount!)

---

## 🆘 Need Help?

Check `STRIPE_SETUP.md` for detailed troubleshooting and advanced features.

**Your e-commerce system is production-ready!** 🎉

