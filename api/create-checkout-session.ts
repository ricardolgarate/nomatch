import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

type CartItem = {
  id: string;
  name: string;
  image: string;
  unitAmount: number;     // in cents
  quantity: number;
  currency: 'usd' | 'mxn';
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

// Generate order number (format: NM-YYYYMMDD-XXXX)
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `NM-${year}${month}${day}-${random}`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customerInfo } = req.body as {
      items: CartItem[];
      customerInfo?: CustomerInfo;
    };

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Convert cart items to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: item.currency || 'usd',
        product_data: {
          name: item.size ? `${item.name} (Size: ${item.size})` : item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            productId: item.id,
            sku: item.sku || '',
            size: item.size || '',
            category: item.category || '',
          },
        },
        unit_amount: item.unitAmount,
      },
      quantity: item.quantity,
    }));

    // Prepare session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      allow_promotion_codes: true, // Enable coupon/promo codes
      success_url: `${process.env.APP_URL || 'https://nomatch.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
      cancel_url: `${process.env.APP_URL || 'https://nomatch.vercel.app'}/checkout?canceled=1`,
      shipping_address_collection: {
        allowed_countries: ['US', 'MX', 'CA'],
      },
      metadata: {
        orderNumber,
        cartItems: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          sku: item.sku,
          category: item.category,
        }))),
      },
    };

    // Add customer email if provided
    if (customerInfo?.email) {
      sessionConfig.customer_email = customerInfo.email;
      
      // Add customer info to metadata
      sessionConfig.metadata!.customerInfo = JSON.stringify({
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
        phone: customerInfo.phone,
        billingAddress: {
          line1: customerInfo.address,
          line2: customerInfo.apartment || '',
          city: customerInfo.city,
          state: customerInfo.state,
          postal_code: customerInfo.zipCode,
          country: customerInfo.country,
        },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ 
      id: session.id,
      url: session.url,
      orderNumber 
    });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: err.message 
    });
  }
}

