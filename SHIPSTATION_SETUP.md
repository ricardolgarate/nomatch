# ShipStation Integration Guide

## 🎯 Overview

Your NoMatch website now automatically sends orders to ShipStation for fulfillment when customers complete payment.

---

## 📋 What Happens Automatically

When a customer completes an order:
1. ✅ Payment processes through Stripe
2. ✅ Order saved to Firestore
3. ✅ Inventory updated
4. ✅ Confirmation email sent to customer
5. ✅ **Order automatically created in ShipStation**
6. ✅ Ready for you to print shipping labels!

---

## 🔧 Setup Instructions

### Step 1: Create ShipStation Account

1. Go to [ShipStation.com](https://www.shipstation.com)
2. Sign up for an account
3. Choose your plan (30-day free trial available)
4. Complete account setup

### Step 2: Get API Credentials

1. Log in to ShipStation
2. Go to **Settings** (gear icon)
3. Click **Account** → **API Settings**
4. Click **"Generate New API Keys"**
5. Copy both:
   - **API Key** (starts with letters/numbers)
   - **API Secret** (starts with letters/numbers)

⚠️ **Important:** Save these somewhere safe - you won't be able to see the secret again!

### Step 3: Add to Vercel Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **2 new variables**:

| Variable | Value |
|----------|-------|
| `SHIPSTATION_API_KEY` | Your API Key from ShipStation |
| `SHIPSTATION_API_SECRET` | Your API Secret from ShipStation |

Click **"Add"** for each, then click **"Redeploy"** in Vercel.

---

## 📦 What Gets Sent to ShipStation

For each order, we send:

### Order Information:
- **Order Number**: `NM-20251024-8384`
- **Order Date**: ISO timestamp
- **Status**: `awaiting_shipment`
- **Customer Email**: For notifications

### Billing Address:
- Customer name
- Street address (line 1 & 2)
- City, State, ZIP
- Country
- Phone (if provided)

### Shipping Address:
- Same as billing (unless customer specifies different)
- Full address details
- Customer contact info

### Order Items:
- **SKU**: Product SKU (e.g., `01-002-M-BL`)
- **Product Name**: Full name
- **Quantity**: Number ordered
- **Unit Price**: Price per item
- **Product Image**: Direct URL to product photo
- **Weight**: Default 16 oz (1 lb) per pair

### Payment Information:
- **Amount Paid**: Total charge (in dollars)
- **Shipping**: $0 (free shipping)
- **Tax**: $0
- **Internal Notes**: Stripe Payment ID for reference

---

## 🚀 Using ShipStation

### View Orders:

1. Log in to ShipStation
2. Go to **Orders** → **Awaiting Shipment**
3. You'll see all paid orders from your website
4. Each order includes:
   - ✅ Customer details
   - ✅ Product images
   - ✅ Shipping address
   - ✅ Order notes

### Create Shipment:

1. Select order(s)
2. Click **"Create Shipping Label"**
3. Choose carrier (USPS, FedEx, UPS)
4. Select service (Priority Mail recommended)
5. Print label
6. Ship package!

### Tracking Updates:

When you mark an order as shipped in ShipStation:
- ✅ Tracking number automatically generated
- ✅ Customer gets tracking email (from ShipStation)
- ✅ Order status updates

---

## 🔄 Order Workflow

```
Customer Places Order
         ↓
Stripe Payment Success
         ↓
Webhook Triggered
         ↓
┌────────────────────────┐
│ 1. Save to Firestore   │
│ 2. Update Inventory    │
│ 3. Send Email          │
│ 4. Send to ShipStation │ ← NEW!
└────────────────────────┘
         ↓
ShipStation: Order Ready!
         ↓
You: Print Label & Ship
         ↓
Customer: Gets Tracking
```

---

## ⚙️ Configuration Options

### Change Default Weight (per item):

Edit `api/stripe-webhook.ts`:

```typescript
weight: {
  value: 16,  // ← Change this (in ounces)
  units: 'ounces' as const,
}
```

Common weights:
- Light items: 8 oz
- Shoes: 16 oz (1 lb)
- Heavy items: 32 oz (2 lbs)

### Change Default Shipping Service:

```typescript
requestedShippingService: 'USPS Priority Mail',  // ← Change this
```

Options:
- `'USPS Priority Mail'` (2-3 days)
- `'USPS First Class'` (3-5 days, cheaper)
- `'FedEx Ground'`
- `'UPS Ground'`

---

## 🧪 Testing

### Test the Integration:

1. Make a test purchase on your website
2. Check Vercel logs for:
   ```
   📦 Creating ShipStation order: NM-20251024-8384
   ✅ ShipStation order created! Order ID: 123456
   ```
3. Log in to ShipStation
4. Go to **Orders** → **Awaiting Shipment**
5. Verify your test order appears

### Test ShipStation API Directly:

You can test your credentials using the separate API endpoint:

```bash
curl -X POST https://preneurbank.com/api/shipstation-create-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "TEST-001",
    "orderDate": "2025-10-26T12:00:00Z",
    "orderStatus": "awaiting_shipment",
    "customerEmail": "test@example.com",
    "billTo": {
      "name": "Test Customer",
      "street1": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "US"
    },
    "shipTo": {
      "name": "Test Customer",
      "street1": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "US"
    },
    "items": [{
      "sku": "TEST-SKU",
      "name": "Test Product",
      "quantity": 1,
      "unitPrice": 100.00
    }],
    "amountPaid": 100.00,
    "shippingAmount": 0,
    "taxAmount": 0
  }'
```

---

## 📊 Monitoring

### Check Integration Status:

**Vercel Logs:**
- Functions → `stripe-webhook`
- Look for: `✅ ShipStation order created!`
- Or errors: `❌ ShipStation API error`

**ShipStation Dashboard:**
- Orders → Awaiting Shipment
- Check if orders appear after purchases

**Firestore:**
- Orders collection has all order data
- Use order number to cross-reference

---

## ⚠️ Important Notes

### Shipping Address:

- Currently uses **billing address** as shipping address
- Both `billTo` and `shipTo` are set to customer's address
- If you want separate shipping addresses, update checkout form

### Order Status:

All orders sent as `awaiting_shipment`:
- Ready for you to create labels
- Won't auto-ship (requires manual label creation)
- You control when orders ship

### API Rate Limits:

ShipStation limits:
- **40 requests per minute**
- More than enough for typical order volume
- Errors logged but don't stop orders

---

## 🔐 Security

✅ API credentials stored securely in Vercel environment variables
✅ Never exposed to frontend
✅ Only webhook can create ShipStation orders
✅ Basic Auth over HTTPS

---

## 🆘 Troubleshooting

### Orders not appearing in ShipStation?

1. Check Vercel logs for ShipStation errors
2. Verify API credentials are correct
3. Test credentials with curl command above
4. Check ShipStation API status

### ShipStation returns 401 Unauthorized?

- API Key or Secret is wrong
- Regenerate keys in ShipStation
- Update in Vercel
- Redeploy

### Orders created but missing information?

- Check order data in Firestore
- Verify customer fills out all required fields
- Update address mapping in webhook if needed

---

## 📧 ShipStation Notifications

ShipStation can automatically email customers when:
- Order shipped (with tracking)
- Shipment delivered
- Shipment delayed

**To enable:**
1. ShipStation → Settings → Notifications
2. Enable customer notifications
3. Customize email templates (optional)

**Note:** You may want to disable these to avoid duplicate emails with your custom Resend emails.

---

## 💡 Next Steps

1. ✅ **Set up ShipStation account**
2. ✅ **Get API credentials**
3. ✅ **Add to Vercel environment variables**
4. ✅ **Test with a real order**
5. ⏭️ **Configure shipping carriers** (USPS, FedEx, UPS)
6. ⏭️ **Connect your scale** (if using one)
7. ⏭️ **Print your first label!**

---

## 🎉 Benefits

✅ **Automatic order import** - No manual entry!
✅ **Batch label printing** - Ship multiple orders at once
✅ **Automatic tracking emails** - Customers stay informed
✅ **Multi-carrier support** - Compare rates, choose best option
✅ **Branded packing slips** - Professional touch
✅ **Inventory sync** - Know what's in stock
✅ **Analytics** - Track shipping costs and times

Your fulfillment process is now automated! 🚀📦

---

## 📖 Resources

- [ShipStation API Documentation](https://www.shipstation.com/docs/api/)
- [ShipStation Support](https://help.shipstation.com/)
- [Carrier Integration Guides](https://help.shipstation.com/hc/en-us/sections/200403817)

Need help? Contact support@shipstation.com or check the Vercel logs!

