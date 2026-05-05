import type { CustomerInfo } from '../firebase/orders';

interface CheckoutLineItem {
  id: string;
  quantity: number;
  size?: string;
}

interface CreateCheckoutSessionPayload {
  orderNumber: string;
  items: CheckoutLineItem[];
  customer: CustomerInfo;
}

interface CreateCheckoutSessionResponse {
  url: string;
  orderNumber: string;
}

export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload,
): Promise<CreateCheckoutSessionResponse> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : 'Could not start checkout. Please try again.',
    );
  }

  if (typeof data.url !== 'string') {
    throw new Error('Stripe did not return a checkout URL.');
  }

  return data as CreateCheckoutSessionResponse;
}
