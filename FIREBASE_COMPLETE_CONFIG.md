# 🔥 Complete Firebase Configuration Guide

## 📍 WHERE EVERYTHING GOES

---

## **1️⃣ ALREADY IN CODE** ✅ (No Action Needed)

### **File: `src/firebase/config.ts`**

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDhf20Nwx3QP8AXzOyHjbrc7bbaET5K-v8",
  authDomain: "nomatch-df763.firebaseapp.com",
  projectId: "nomatch-df763",
  storageBucket: "nomatch-df763.firebasestorage.app",
  messagingSenderId: "616287301053",
  appId: "1:616287301053:web:8b5f844ecd72e833f5b6d4",
  measurementId: "G-B7F6RGEZPT"
};
```

**✅ This is ALREADY working!**
- Used for: Firestore, Analytics, Auth, Storage
- No need to duplicate in `.env.local`
- Safe to commit to GitHub (these are public config values)

---

## **2️⃣ LOCAL DEVELOPMENT** (.env.local)

### **File: `.env.local` (on your computer)**

```bash
# Only need this for frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx

# ⚠️ DO NOT ADD FIREBASE CONFIG HERE - already in config.ts!
```

**That's it!** Just 1 variable for local development.

---

## **3️⃣ VERCEL DEPLOYMENT** (Production Frontend)

### **Location: Vercel Dashboard → Settings → Environment Variables**

Add these in Vercel's UI:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_your_live_key` | Production |

**❌ DO NOT add Firebase config to Vercel** - it's already in your code!

### **How to Add:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. **Settings** → **Environment Variables**
4. Click **Add New**
5. Name: `VITE_STRIPE_PUBLISHABLE_KEY`
6. Value: `pk_live_xxx` or `pk_test_xxx`
7. Environment: Select **Production** (and optionally Preview, Development)
8. Click **Save**

---

## **4️⃣ FIREBASE CLOUD FUNCTIONS** (Backend)

### **Set via Firebase CLI Commands:**

Run these commands in your terminal:

```bash
# Stripe Configuration
firebase functions:config:set stripe.secret_key="sk_live_YOUR_SECRET_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"

# Email Configuration (Gmail example)
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.pass="your-16-char-app-password"

# Admin Configuration
firebase functions:config:set admin.email="admin@nomatch.com"
firebase functions:config:set website.url="https://nomatch.vercel.app"

# Deploy after configuring
firebase deploy --only functions
```

These are **stored in Firebase Cloud**, not in any file!

---

## **5️⃣ FIREBASE SERVICE ACCOUNT** (Cloud Functions Only)

### **Automatic Setup:**

When you run `firebase init functions`, Firebase automatically sets up the service account. You don't need to manually configure it!

**The service account JSON you have is NOT needed anywhere** - Firebase handles it internally.

---

## **📊 COMPLETE SUMMARY TABLE**

| What | Where | How to Set | Example |
|------|-------|------------|---------|
| **Firebase Web Config** | `src/firebase/config.ts` | ✅ Already there | `apiKey: "AIzaSy..."` |
| **Stripe Publishable (Local)** | `.env.local` | Add manually | `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx` |
| **Stripe Publishable (Vercel)** | Vercel Dashboard | Add in UI | `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx` |
| **Stripe Secret** | Firebase Functions | `firebase functions:config:set` | `stripe.secret_key="sk_live_xxx"` |
| **Email SMTP** | Firebase Functions | `firebase functions:config:set` | `smtp.user="email@gmail.com"` |
| **Webhook Secret** | Firebase Functions | `firebase functions:config:set` | `stripe.webhook_secret="whsec_xxx"` |

---

## **🎯 QUICK START COMMANDS**

### **Local Development:**
```bash
# 1. Add to .env.local
echo 'VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key' > .env.local

# 2. Run locally
npm run dev
```

### **Production Deployment:**

```bash
# 1. Configure Firebase Functions
firebase functions:config:set \
  stripe.secret_key="sk_live_xxx" \
  smtp.user="your-email@gmail.com" \
  smtp.pass="your-app-password" \
  admin.email="admin@nomatch.com" \
  website.url="https://your-site.vercel.app"

# 2. Deploy Functions to Firebase
firebase deploy --only functions

# 3. Deploy Frontend to Vercel (via dashboard or CLI)
vercel --prod
# Or connect GitHub repo in Vercel dashboard

# 4. Add env var in Vercel UI
# VITE_STRIPE_PUBLISHABLE_KEY = pk_live_xxx
```

---

## **❓ COMMON QUESTIONS**

### **Q: Do I need Firebase variables in Vercel?**
**A:** NO! They're already in `src/firebase/config.ts`

### **Q: Do I need Firebase variables in `.env.local`?**
**A:** NO! They're already in `src/firebase/config.ts`

### **Q: Where does the service account JSON go?**
**A:** Nowhere! Firebase Functions handle it automatically.

### **Q: What if I want to change Firebase project?**
**A:** Edit `src/firebase/config.ts` (that's the only place)

---

## **✅ FINAL CHECKLIST**

### **For Local Development:**
- [x] Firebase config in `src/firebase/config.ts` ✅ Already there
- [ ] Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env.local`
- [ ] Run `npm run dev`

### **For Production:**
- [x] Firebase config in `src/firebase/config.ts` ✅ Already there
- [ ] Add `VITE_STRIPE_PUBLISHABLE_KEY` to Vercel
- [ ] Configure Firebase Functions (8 variables)
- [ ] Deploy Firebase Functions
- [ ] Deploy to Vercel
- [ ] Update Stripe webhook URL

---

**That's everything! Your Firebase setup is cleaner than most production apps.** 🎉

