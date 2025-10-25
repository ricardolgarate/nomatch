import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const db = getFirestore();

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

// Validate coupon directly from Firestore
async function validateCustomCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  discount: number;
  couponId?: string;
}> {
  if (!code || !db) {
    return { valid: false, discount: 0 };
  }

  try {
    // Get coupon from Firestore
    const couponsRef = db.collection('coupons');
    const snapshot = await couponsRef.where('code', '==', code.toUpperCase()).limit(1).get();

    if (snapshot.empty) {
      return { valid: false, discount: 0 };
    }

    const couponDoc = snapshot.docs[0];
    const coupon = couponDoc.data();

    // Validate active status
    if (!coupon.active) {
      return { valid: false, discount: 0 };
    }

    // Validate expiration
    if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
      return { valid: false, discount: 0 };
    }

    // Validate usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0 };
    }

    // Validate minimum purchase
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return { valid: false, discount: 0 };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.floor(subtotal * (coupon.value / 100));
      
      // Apply max discount if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // Fixed amount
      discount = coupon.value;
      
      // Don't let discount exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    return {
      valid: true,
      discount,
      couponId: couponDoc.id,
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, discount: 0 };
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
    const couponResult = await validateCustomCoupon(promoCode || '', subtotal);
    const discount = couponResult.discount;
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
        couponId: couponResult.couponId || '',
        discount: discount.toString(),
        subtotal: subtotal.toString(),
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

