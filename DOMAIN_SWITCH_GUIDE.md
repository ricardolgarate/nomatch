# Domain Switch Guide: NoMatch.us → PreneurBank.com

## 🎯 Quick Summary

To test with `preneurbank.com` before using `nomatch.us`, you need to change domains in:
- Environment variables (critical)
- Stripe webhook URLs (critical)  
- Firebase authorized domains (critical)
- Email templates (critical)
- Meta tags (optional but recommended)

---

## 🔴 CRITICAL CHANGES (Required for Functionality)

### 1. **Vercel Environment Variables**

Go to: **Vercel Dashboard → Settings → Environment Variables**

#### Change:
```env
APP_URL=https://preneurbank.com
```

#### Keep These (they're fine):
```env
RESEND_API_KEY=re_fR1ZiXYw_H8sqpFzXAYLZEza6Z2DD3f1T
EMAIL_FROM=NoMatch <support@preneurbank.com>
```

---

### 2. **Stripe Webhook Configuration**

**Go to:** https://dashboard.stripe.com/webhooks

1. Click on your webhook endpoint
2. Click **"Update details"**
3. Change **Endpoint URL** to:
   ```
   https://preneurbank.com/api/stripe-webhook
   ```
4. Click **"Update endpoint"**

---

### 3. **Firebase Authorized Domains**

**Go to:** https://console.firebase.google.com/project/nomatch-df763/authentication/settings

1. Scroll to **Authorized domains**
2. Click **"Add domain"**
3. Add: `preneurbank.com`
4. Add: `www.preneurbank.com`
5. Click **Add**

---

### 4. **Resend Email Domain**

**Go to:** https://resend.com/domains

1. Click **"Add Domain"**
2. Enter: `preneurbank.com`
3. Follow DNS setup instructions:
   - Add TXT record for verification
   - Add MX records for receiving
   - Add SPF, DKIM records
4. Wait for verification (~5-30 minutes)

---

## 🟡 CODE CHANGES (Files to Update)

### Email Templates (Critical - for logo display):

**Already updated by you:**
- ✅ `src/emails/OrderConfirmation.tsx` - Logo URL
- ✅ `src/emails/PaymentFailed.tsx` - Logo URL and checkout link

---

### Meta Tags in `index.html`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:url" content="https://preneurbank.com/" />
<meta property="og:image" content="https://preneurbank.com/Logo-NoMatch.webp" />

<!-- Twitter -->
<meta property="twitter:url" content="https://preneurbank.com/" />
<meta property="twitter:image" content="https://preneurbank.com/Logo-NoMatch.webp" />
```

---

### API Files (Fallback URLs):

**These files have fallback URLs - update if you want:**

**`api/create-payment-intent.ts` (line ~90):**
```typescript
success_url: `${process.env.APP_URL || 'https://preneurbank.com'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
cancel_url: `${process.env.APP_URL || 'https://preneurbank.com'}/checkout?canceled=1`,
```

**`api/create-checkout-session.ts` (similar):**
```typescript
success_url: `${process.env.APP_URL || 'https://preneurbank.com'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
cancel_url: `${process.env.APP_URL || 'https://preneurbank.com'}/checkout?canceled=1`,
```

**`api/validate-coupon.ts` (line ~50):**
```typescript
const response = await fetch(`${process.env.APP_URL || 'https://preneurbank.com'}/api/validate-coupon`, {
```

---

## 🟢 OPTIONAL CHANGES (Display/Branding Only)

These won't affect functionality but improve consistency:

### Contact Page:
- `src/pages/Contact.tsx` - Email address displays
- `src/components/Footer.tsx` - Email links

### Admin Pages:
- `src/pages/AdminLogin.tsx` - Login page text

### Documentation:
- `RESEND_EMAIL_SETUP.md`
- `EMBEDDED_CHECKOUT_GUIDE.md`
- `WEBHOOK_SETUP.md`

---

## 🚀 Quick Switch Commands

I can run these commands to update all domain references:

```bash
# Replace nomatch.us with preneurbank.com
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/nomatch\.us/preneurbank.com/g' {} +

# Replace nomatch.vercel.app with preneurbank.com  
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/nomatch\.vercel\.app/preneurbank.com/g' {} +
```

**Want me to run these commands to update all files automatically?**

---

## 📋 Verification Checklist

After making changes:

### In Vercel:
- [ ] Updated `APP_URL` environment variable
- [ ] Updated `EMAIL_FROM` to use preneurbank.com
- [ ] Redeployed

### In Stripe:
- [ ] Webhook URL changed to preneurbank.com
- [ ] Tested webhook (Send test event)

### In Firebase:
- [ ] Added preneurbank.com to authorized domains
- [ ] Can login to admin dashboard

### In Resend:
- [ ] Added preneurbank.com domain
- [ ] DNS records configured
- [ ] Domain verified
- [ ] Test email sent successfully

### In Your DNS (preneurbank.com):
- [ ] Domain points to Vercel (A record or CNAME)
- [ ] Resend DNS records added (MX, TXT, DKIM)

---

## 🔄 Switch Back to nomatch.us Later

When ready to switch to nomatch.us:

1. Reverse all domain changes (use nomatch.us instead)
2. Update Vercel environment variables
3. Update Stripe webhook URL
4. Add nomatch.us to Firebase authorized domains
5. Add nomatch.us to Resend
6. Redeploy

---

## ⚡ Fast Track (Just for Testing):

**Minimum changes for preneurbank.com to work:**

1. ✅ Vercel: `APP_URL=https://preneurbank.com`
2. ✅ Stripe: Webhook URL → `https://preneurbank.com/api/stripe-webhook`
3. ✅ Firebase: Add `preneurbank.com` to authorized domains
4. ✅ Resend: Add `preneurbank.com` domain
5. ✅ Code: Email templates already updated by you!

The rest will work through the `APP_URL` environment variable.

---

**Would you like me to automatically update all the code file references for you?**

