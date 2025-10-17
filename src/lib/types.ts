// Stripe-compatible cart item
export type StripeCartItem = {
  id: string;             // your product id
  name: string;
  image: string;          // URL for email + checkout
  unitAmount: number;     // in cents, e.g., 12900 for $129.00
  quantity: number;
  currency: 'usd' | 'mxn';
  sku?: string;
  size?: string;          // for shoes and clothing
  category?: string;
};

// Helper to convert price string to cents
export function priceStringToCents(priceString: string): number {
  // Remove $ and convert to number, then to cents
  const dollars = parseFloat(priceString.replace('$', ''));
  return Math.round(dollars * 100);
}

// Helper to convert cents to price string
export function centsToString(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

// Convert existing CartItem to StripeCartItem
export function toStripeCartItem(item: {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
  category: string;
  sku?: string;
}): StripeCartItem {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    unitAmount: priceStringToCents(item.price),
    quantity: item.quantity,
    currency: 'usd', // Change to 'mxn' if selling in Mexico
    sku: item.sku,
    size: item.size,
    category: item.category,
  };
}

