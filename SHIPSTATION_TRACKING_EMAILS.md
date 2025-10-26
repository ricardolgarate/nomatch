# ShipStation Tracking Email Setup

## 🎯 Overview

Automatically send tracking emails to customers when you create shipping labels in ShipStation!

---

## ✨ What Happens

When you create a shipping label in ShipStation:
1. 🏷️ You create label in ShipStation
2. 📡 ShipStation sends webhook to your site
3. 📧 Customer automatically receives tracking email
4. 📦 Customer can track their package
5. 💾 Order updated in Firestore with tracking info

---

## 🔧 Setup Instructions

### Step 1: Configure Webhook in ShipStation

1. **Log in to ShipStation**
2. Click **Settings** (⚙️ gear icon)
3. Click **Account Settings**
4. Scroll to **Webhooks** section
5. Click **"Add Webhook"** or **"Subscribe to Webhook"**

### Step 2: Configure Webhook Details

**Webhook URL:**
```
https://www.preneurbank.com/api/shipstation-webhook
```

**Events to Subscribe:**
- ✅ **SHIP_NOTIFY** (Label created / Item shipped)

Leave these unchecked (we don't need them):
- ⬜ ORDER_NOTIFY
- ⬜ ITEM_ORDER_NOTIFY
- ⬜ ITEM_SHIP_NOTIFY

### Step 3: Save and Test

1. Click **"Save"** or **"Subscribe"**
2. ShipStation will show the webhook as "Active"
3. Ready to test!

---

## 🧪 Testing the Integration

### Test Flow:

1. **Make a Test Purchase**
   - Go to preneurbank.com
   - Buy any item (use WELCOME coupon for discount)
   - Complete checkout

2. **Create Shipping Label in ShipStation**
   - Go to ShipStation → Orders → Awaiting Shipment
   - Find order starting with `NM-20251026-`
   - Click **"Create Label"**
   - Choose USPS (or your carrier)
   - Print label

3. **Check Email**
   - Customer receives tracking email within seconds
   - Email includes tracking number and "Track Package" button
   - Clickable link goes to carrier's tracking page

4. **Verify in Firestore**
   - Firebase Console → Firestore → `orders` collection
   - Find the order
   - Should now have:
     - `trackingNumber`: The tracking #
     - `carrier`: Carrier code
     - `shippedAt`: Timestamp
     - `status`: "shipped"

---

## 📧 Tracking Email Features

The email customers receive includes:

✅ **NoMatch branded header** with logo
✅ **Shipping confirmation** message
✅ **Tracking number** (large, easy to copy)
✅ **"Track Your Package" button** (links to carrier site)
✅ **Carrier name** (USPS, FedEx, UPS, etc.)
✅ **Order number** for reference
✅ **Delivery timeline** (7-21 business days)
✅ **What to expect** bullet points
✅ **Support contact** info

### Supported Carriers:

- **USPS** → tools.usps.com tracking
- **UPS** → ups.com tracking
- **FedEx** → fedex.com tracking
- **DHL** → dhl.com tracking
- **Others** → Google search for tracking

---

## 🔍 Monitoring

### Check if Webhook is Working:

**Vercel Logs:**
1. Vercel Dashboard → Deployments → Functions
2. Click **shipstation-webhook**
3. Look for:
   ```
   📦 ShipStation webhook received
   🚢 Ship notification received
   📦 Shipment info: { orderNumber: 'NM-...', trackingNumber: '...', carrier: 'usps' }
   ✅ Tracking notification sent for order: NM-...
   ```

**ShipStation Activity:**
1. Settings → Webhooks
2. Click on your webhook
3. View **Recent Deliveries**
4. Should show successful deliveries (200 status)

**Firestore:**
1. Orders collection
2. Find shipped order
3. Check for `trackingNumber` and `shippedAt` fields

---

## ⚙️ Advanced Configuration

### Customize Email Template:

Edit `src/emails/ShippingNotification.tsx` to change:
- Email content/copy
- Colors and styling
- Add promotional content
- Include product recommendations

### Different Emails by Carrier:

You can customize the message based on carrier:

```typescript
const deliveryMessage = carrier === 'USPS' 
  ? '3-5 business days'
  : carrier === 'FedEx'
    ? '2-3 business days'
    : '5-7 business days';
```

---

## 🚫 Important: WooCommerce Orders

The webhook is smart and only sends tracking emails for preneurbank.com orders (starting with `NM-`).

**WooCommerce orders** (from nomatch.us) are skipped because they have their own tracking email system.

This prevents duplicate tracking emails! ✅

---

## 📊 Order Status Updates

Orders progress through these statuses:

1. **paid** - Payment received
2. **shipped** - Label created, tracking email sent
3. (Future) **delivered** - Can add delivery confirmation

---

## 🆘 Troubleshooting

### Webhook not triggering?

1. Check webhook URL is correct in ShipStation
2. Verify webhook is set to "Active"
3. Check you selected **SHIP_NOTIFY** event
4. Look at ShipStation webhook delivery logs

### Email not sending?

1. Check Vercel logs for errors
2. Verify RESEND_API_KEY is set
3. Check customer email in order data
4. Verify Firestore has order with matching number

### Tracking URL not working?

1. Wait 1-2 hours after label creation
2. Carrier systems need time to update
3. Tracking becomes active when carrier scans package

---

## ✅ Setup Checklist

- [ ] Added SHIPSTATION_API_KEY to Vercel
- [ ] Added SHIPSTATION_API_SECRET to Vercel  
- [ ] Added webhook in ShipStation settings
- [ ] Webhook URL: https://www.preneurbank.com/api/shipstation-webhook
- [ ] Selected SHIP_NOTIFY event
- [ ] Webhook status: Active
- [ ] Made test purchase
- [ ] Created test label in ShipStation
- [ ] Customer received tracking email
- [ ] Tracking link works

---

## 🎉 Benefits

✅ **Automatic notifications** - No manual emails needed!
✅ **Professional branding** - Beautiful NoMatch-branded emails
✅ **Instant updates** - Customer knows immediately when shipped
✅ **Direct tracking links** - One-click to carrier site
✅ **Order history** - Tracking stored in Firestore
✅ **Reduces support** - Fewer "where's my order?" questions

Your customers will love getting instant shipping notifications! 📧📦

---

## 📞 Need Help?

- Check Vercel function logs
- Check ShipStation webhook delivery logs
- Verify environment variables are set
- Test with a real purchase and label creation

Happy shipping! 🚀

