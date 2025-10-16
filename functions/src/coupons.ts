import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2025-09-30.clover',
});

// Create a new coupon
export const createCoupon = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated (admin)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { 
    code, 
    type, // 'percent' or 'amount'
    value, // percentage (10 for 10%) or amount in dollars (20 for $20)
    duration, // 'once', 'repeating', or 'forever'
    maxRedemptions,
    expiresAt // optional: timestamp
  } = data;

  try {
    const couponParams: Stripe.CouponCreateParams = {
      id: code.toUpperCase(),
      duration: duration || 'once',
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
export const listCoupons = functions.https.onCall(async (data, context) => {
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
export const deleteCoupon = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { couponId } = data;

  try {
    await stripe.coupons.del(couponId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

