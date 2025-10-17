import { toStripeCartItem, type StripeCartItem } from './types';

export type CustomerInfo = {
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

/**
 * Create a Stripe Checkout Session and redirect to payment
 */
export async function createCheckoutSession(
  cartItems: Array<{
    id: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
    size?: string;
    category: string;
    sku?: string;
  }>,
  customerInfo?: CustomerInfo
): Promise<{ orderNumber: string; url: string }> {
  try {
    // Convert cart items to Stripe format
    const stripeItems: StripeCartItem[] = cartItems.map(item => toStripeCartItem(item));

    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: stripeItems,
        customerInfo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { url, orderNumber } = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
      return { orderNumber, url };
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Calculate total amount in cents
 */
export function calculateTotal(items: StripeCartItem[]): number {
  return items.reduce((total, item) => total + (item.unitAmount * item.quantity), 0);
}

/**
 * Format cents to currency string
 */
export function formatAmount(cents: number, currency: 'usd' | 'mxn' = 'usd'): string {
  const dollars = cents / 100;
  const symbol = currency === 'usd' ? '$' : 'MX$';
  return `${symbol}${dollars.toFixed(2)}`;
}

