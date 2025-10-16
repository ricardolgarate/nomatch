import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Types for our Stripe integration
export interface CartItem {
  id: string;
  name: string;
  price: string; // e.g., "$170"
  image: string;
  size?: string;
  category: string;
  quantity: number;
}

export interface CheckoutSessionData {
  items: CartItem[];
  couponCode?: string;
  customerEmail?: string;
}

export interface CouponData {
  id: string;
  percent_off?: number; // 10 for 10%
  amount_off?: number; // 1000 for $10.00 (in cents)
  currency?: string;
  valid: boolean;
  max_redemptions?: number;
  times_redeemed?: number;
}
