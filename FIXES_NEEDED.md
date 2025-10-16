# 🔧 Fixes Needed for Production

## Current Errors and Solutions

---

## **Error 1: CORS Blocked** ❌

**Problem:** Vercel can't access Firebase Cloud Functions

**Solution:** Firebase Functions with `httpsCallable` should auto-handle CORS, but you need to deploy them first.

---

## **Error 2: Invalid Admin Credentials** ❌

**Problem:** Login error: `auth/invalid-credential`

**Solution:** You need to create an admin user in Firebase

---

## **Error 3: Missing Permissions** ❌

**Problem:** Can't read orders from Firestore

**Solution:** Deploy updated Firestore rules

---

## 🚀 **COMPLETE FIX (Run These Commands):**

### **Step 1: Install Firebase CLI**

```bash
# Option A: Using sudo
sudo npm install -g firebase-tools

# Option B: Using Homebrew (recommended)
brew install firebase-cli
```

### **Step 2: Login to Firebase**

```bash
firebase login
```

### **Step 3: Deploy Firestore Rules**

```bash
cd "/Users/ricardogarate/Downloads/NoMatch Website"
firebase deploy --only firestore:rules
```

### **Step 4: Create Admin User**

You have 2 options:

#### **Option A: Using Firebase Console (Easiest)**

1. Go to https://console.firebase.google.com
2. Select your project: **nomatch-df763**
3. Go to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - **Email**: `admin@nomatch.com` (or your email)
   - **Password**: Create a secure password
6. Click **Add User**
7. **Save this password** - you'll use it to login!

#### **Option B: Using Command (After Firebase CLI installed)**

```bash
# Create admin user
firebase auth:import admin-user.json
```

Create `admin-user.json`:
```json
{
  "users": [{
    "localId": "admin123",
    "email": "admin@nomatch.com",
    "emailVerified": true,
    "passwordHash": "your-hashed-password",
    "salt": "salt",
    "createdAt": "1234567890123"
  }]
}
```

### **Step 5: Deploy Firebase Functions**

```bash
cd "/Users/ricardogarate/Downloads/NoMatch Website"

# Configure environment
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_KEY" \
  stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET" \
  smtp.host="smtp.gmail.com" \
  smtp.port="587" \
  smtp.user="your-email@gmail.com" \
  smtp.pass="your-app-password" \
  admin.email="admin@nomatch.com" \
  website.url="https://nomatch.vercel.app"

# Install dependencies
cd functions
npm install
cd ..

# Deploy
firebase deploy --only functions
```

---

## **Quick Fix (Do This Now):**

### **1. Create Admin User in Firebase Console**

👉 https://console.firebase.google.com/project/nomatch-df763/authentication/users

Click **"Add User"**:
- Email: `admin@nomatch.com`
- Password: `YourSecurePassword123!`
- Click **Save**

### **2. Install Firebase CLI**

```bash
# Using Homebrew (easiest)
brew install firebase-cli

# Then login
firebase login
```

### **3. Deploy Rules & Functions**

```bash
cd "/Users/ricardogarate/Downloads/NoMatch Website"

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy functions (after configuring env vars above)
firebase deploy --only functions
```

---

## **After Deployment:**

1. ✅ Firestore rules will allow orders access
2. ✅ Cloud Functions will have CORS enabled
3. ✅ You can login to admin dashboard
4. ✅ Coupons will work

---

## **Alternative: Simplify for Now (Skip Cloud Functions)**

If you want to test without deploying functions yet:

1. Create coupons directly in Stripe Dashboard:
   - https://dashboard.stripe.com/coupons
   - Click "Create coupon"
   - Customers can still use them at checkout

2. Cloud Functions are only needed for:
   - Creating coupons from admin dashboard
   - Automatic emails/invoices
   - Webhook processing

**Your site will still work for payments** - just without the admin coupon creation feature until you deploy functions.

---

## **Priority Fix Order:**

1. 🔴 **Create admin user** (5 min) - Do this first!
2. 🟡 **Install Firebase CLI** (5 min)
3. 🟡 **Deploy Firestore rules** (2 min)
4. 🟢 **Deploy Cloud Functions** (10 min) - Do when ready

**Start with creating the admin user - that will let you login!** 🎯

