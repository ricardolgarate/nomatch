# Email Troubleshooting Checklist

## ❌ You didn't receive an email after payment

### Step 1: Check Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Verify these variables are set:

| Variable | Required? | Example |
|----------|-----------|---------|
| `RESEND_API_KEY` | ✅ **REQUIRED** | `re_123abc...` |
| `EMAIL_FROM` | ✅ **REQUIRED** | `NoMatch <support@preneurbank.com>` |
| `STRIPE_WEBHOOK_SECRET` | ✅ **REQUIRED** | `whsec_...` |
| `STRIPE_SECRET_KEY` | ✅ **REQUIRED** | `sk_live_...` or `sk_test_...` |
| `FIREBASE_CLIENT_EMAIL` | ✅ **REQUIRED** | `firebase-adminsdk-...@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | ✅ **REQUIRED** | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

### Step 2: Check Vercel Function Logs

1. Go to **Vercel Dashboard → Deployments**
2. Click on latest deployment
3. Click **Functions** tab
4. Find `stripe-webhook` function
5. Click **View Logs**

Look for:
- ✅ `✅ Webhook received: payment_intent.succeeded`
- ✅ `📧 Sending confirmation email to: [email]`
- ✅ `✅ Email sent successfully! ID: [id]`

**OR** errors:
- ❌ `⚠️ RESEND_API_KEY not set - skipping email`
- ❌ `❌ Error sending email:`
- ❌ `⚠️ Webhook signature verification failed`

### Step 3: Check Stripe Webhook Status

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click on your webhook endpoint
3. Check **"Recent deliveries"**

Look for:
- Recent `payment_intent.succeeded` event
- Status should be **200** (success)
- If **400** or **500** = error in webhook

Click on the event to see:
- Request body
- Response from your webhook
- Error messages (if any)

### Step 4: Check Resend Dashboard

If you have Resend set up:

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Check **Emails** tab
3. Look for recent sent email
4. Check status:
   - ✅ Delivered
   - ⏳ Queued
   - ❌ Failed

### Step 5: Verify Webhook is Being Called

The webhook only sends emails when it receives a `payment_intent.succeeded` event from Stripe.

**Common issue:** If the webhook URL is wrong or not configured in Stripe, the email will never be sent.

---

## 🔧 Quick Fixes

### Fix 1: Add Missing Environment Variables

If `RESEND_API_KEY` or `EMAIL_FROM` are missing:

1. Create Resend account at [resend.com](https://resend.com)
2. Get API key from Resend Dashboard → API Keys
3. Add to Vercel:
   - `RESEND_API_KEY`: `re_your_key_here`
   - `EMAIL_FROM`: `NoMatch <support@preneurbank.com>`
4. **Redeploy** in Vercel

### Fix 2: Configure Stripe Webhook

If webhook doesn't exist or URL is wrong:

1. Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://preneurbank.com/api/stripe-webhook`
4. Events to send:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`
7. **Redeploy**

### Fix 3: Manually Resend Email (from webhook logs)

If the payment succeeded but email failed, you can manually trigger the webhook:

1. Stripe Dashboard → Webhooks → Your endpoint
2. Find the `payment_intent.succeeded` event for your order
3. Click **Resend**
4. Check Vercel logs again

---

## 🧪 Test Email System

### Test 1: Make a Test Purchase

1. Add item to cart on your website
2. Go to checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Check:
   - ✅ Payment succeeded in Stripe
   - ✅ Webhook received in Vercel logs
   - ✅ Email in inbox (or spam folder)

### Test 2: Manually Trigger Webhook

Use Stripe CLI to trigger a test webhook:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Trigger test event
stripe trigger payment_intent.succeeded
```

Then check Vercel logs for email sending.

---

## 📋 Most Common Issues

1. ❌ **RESEND_API_KEY not set** → Add in Vercel env vars
2. ❌ **Webhook not configured** → Add webhook endpoint in Stripe
3. ❌ **Wrong webhook URL** → Should be `https://preneurbank.com/api/stripe-webhook`
4. ❌ **Webhook secret mismatch** → Copy correct secret from Stripe
5. ❌ **Email lands in spam** → Check spam folder, verify domain in Resend

---

## ✅ When Everything Works

You should see in Vercel logs:
```
✅ Webhook received: payment_intent.succeeded
💰 PaymentIntent succeeded: pi_...
📦 Order items: [...]
✅ Order saved to Firestore: NM-20251024-1234
✅ Inventory updated for 2 items
📧 Sending confirmation email to: customer@example.com
📧 Rendering email template...
✅ Email template rendered successfully
📤 Sending email from: NoMatch <support@preneurbank.com> to: customer@example.com
✅ Email sent successfully! ID: abc123...
✅ Order fulfilled (PaymentIntent): NM-20251024-1234
```

---

Need help? Check the logs and let me know what you see!


