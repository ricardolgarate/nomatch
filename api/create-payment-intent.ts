import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

type CartItem = {
  id: string;
  name: string;
  image: string;
  unitAmount: number;     // in cents
  quantity: number;
  currency?: 'usd' | 'mxn';
  sku?: string;
  size?: string;
  category?: string;
};

type CustomerInfo = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  country: string;
};

// Calculate subtotal in cents
function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.unitAmount * item.quantity), 0);
}

// Calculate discount based on promo code
async function getDiscountCents(promoCode: string | undefined, subtotal: number): Promise<number> {
  if (!promoCode) return 0;

  try {
    // Option A: Validate against your own promo table in Firestore
    // (recommended for full control)
    
    // Option B: Validate with Stripe promotion codes
    const promos = await stripe.promotionCodes.list({
      code: promoCode,
      active: true,
      limit: 1,
    });

    if (!promos.data.length) {
      console.log('Promo code not found:', promoCode);
      return 0;
    }

    const promo = promos.data[0];
    const coupon = promo.coupon;

    // Calculate discount
    if (coupon.percent_off) {
      return Math.floor(subtotal * (coupon.percent_off / 100));
    }
    if (coupon.amount_off) {
      return coupon.amount_off; // already in cents
    }

    return 0;
  } catch (error) {
    console.error('Error validating promo code:', error);
    return 0;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, promoCode, orderNumber, customerInfo, currency = 'usd' } = req.body as {
      items: CartItem[];
      promoCode?: string;
      orderNumber: string;
      customerInfo?: CustomerInfo;
      currency?: 'usd' | 'mxn';
    };

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate amounts
    const subtotal = computeSubtotal(items);
    const discount = await getDiscountCents(promoCode, subtotal);
    const shipping = 0;  // Free shipping or calculate based on your logic
    const tax = 0;       // Calculate if needed
    const total = Math.max(subtotal - discount + shipping + tax, 0);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency,
      automatic_payment_methods: {
        enabled: true, // Supports cards, Apple Pay, Google Pay, etc.
      },
      metadata: {
        orderNumber,
        promoCode: promoCode || '',
        cartItems: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          sku: item.sku,
          category: item.category,
        }))),
        customerInfo: customerInfo ? JSON.stringify({
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address,
            line2: customerInfo.apartment || '',
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.zipCode,
            country: customerInfo.country,
          },
        }) : '',
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
      total,
      discount,
      subtotal,
    });
  } catch (err: any) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: err.message,
    });
  }
}

