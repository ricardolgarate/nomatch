import { CartItem, CheckoutSessionData, CouponData } from './stripe';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import app from '../firebase/config';

const functions = getFunctions(app, 'us-central1');

// Convert price string to cents (e.g., "$170" -> 17000)
export function priceTocents(priceString: string): number {
  const numericPrice = parseFloat(priceString.replace('$', ''));
  return Math.round(numericPrice * 100);
}

// Create checkout session using Firebase Function
export async function createCheckoutSession(data: CheckoutSessionData) {
  try {
    const createSession = httpsCallable(functions, 'createCheckoutSession');
    const result = await createSession(data);
    return result.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Validate coupon using Firebase Function
export async function validateCoupon(couponCode: string): Promise<CouponData | null> {
  try {
    const validate = httpsCallable(functions, 'validateCoupon');
    const result = await validate({ code: couponCode });
    return result.data as CouponData;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return null;
  }
}

// Calculate discount amount
export function calculateDiscount(
  subtotal: number, 
  coupon: CouponData | null
): number {
  if (!coupon || !coupon.valid) return 0;

  if (coupon.percent_off) {
    return Math.round(subtotal * (coupon.percent_off / 100));
  }

  if (coupon.amount_off) {
    return Math.min(coupon.amount_off, subtotal);
  }

  return 0;
}

// Calculate cart totals
export function calculateCartTotals(items: CartItem[], coupon: CouponData | null = null) {
  const subtotal = items.reduce((total, item) => {
    return total + (priceTocents(item.price) * item.quantity);
  }, 0);

  const discount = calculateDiscount(subtotal, coupon);
  const total = subtotal - discount;

  return {
    subtotal: subtotal / 100, // Convert back to dollars
    discount: discount / 100,
    total: total / 100,
    subtotalCents: subtotal,
    discountCents: discount,
    totalCents: total,
  };
}
