import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// Create a new coupon
export const createCoupon = functions.https.onCall(async (data: any, context: any) => {
  // Check if user is authenticated (admin)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const code: string = data.code;
  const type: string = data.type;
  const value: number = data.value;
  const duration: string = data.duration;
  const maxRedemptions: number | undefined = data.maxRedemptions;
  const expiresAt: number | undefined = data.expiresAt;

  try {
    const couponParams: Stripe.CouponCreateParams = {
      id: code.toUpperCase(),
      duration: (duration || 'once') as Stripe.CouponCreateParams.Duration,
    };

    if (type === 'percent') {
      couponParams.percent_off = value;
    } else if (type === 'amount') {
      couponParams.amount_off = Math.round(value * 100); // Convert to cents
      couponParams.currency = 'usd';
    }

    if (maxRedemptions) {
      couponParams.max_redemptions = maxRedemptions;
    }

    if (expiresAt) {
      couponParams.redeem_by = Math.floor(expiresAt / 1000); // Convert to Unix timestamp
    }

    const coupon = await stripe.coupons.create(couponParams);

    return {
      success: true,
      coupon: {
        id: coupon.id,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        valid: coupon.valid,
        max_redemptions: coupon.max_redemptions,
        times_redeemed: coupon.times_redeemed,
        redeem_by: coupon.redeem_by,
      },
    };
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// List all coupons
export const listCoupons = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    const coupons = await stripe.coupons.list({ limit: 100 });

    return {
      coupons: coupons.data.map(c => ({
        id: c.id,
        percent_off: c.percent_off,
        amount_off: c.amount_off,
        currency: c.currency,
        valid: c.valid,
        max_redemptions: c.max_redemptions,
        times_redeemed: c.times_redeemed,
        redeem_by: c.redeem_by,
        created: c.created,
      })),
    };
  } catch (error: any) {
    console.error('Error listing coupons:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Delete a coupon
export const deleteCoupon = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const couponId: string = data.couponId;

  try {
    await stripe.coupons.del(couponId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

