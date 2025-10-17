import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Webhook signature secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body
  },
};

async function buffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Save order to Firestore
async function saveOrder(orderData: any) {
  try {
    await db.collection('orders').doc(orderData.orderNumber).set(orderData);
    console.log('✅ Order saved to Firestore:', orderData.orderNumber);
  } catch (error) {
    console.error('❌ Error saving order:', error);
    throw error;
  }
}

// Update inventory after purchase
async function updateInventory(items: any[]) {
  try {
    const batch = db.batch();
    
    for (const item of items) {
      const productRef = db.collection('products').doc(item.id);
      
      if (item.size) {
        // Update specific size stock
        batch.update(productRef, {
          [`sizes.${item.size}`]: require('firebase-admin').firestore.FieldValue.increment(-item.quantity),
          updatedAt: new Date(),
        });
      } else {
        // Update general stock
        batch.update(productRef, {
          stock: require('firebase-admin').firestore.FieldValue.increment(-item.quantity),
          updatedAt: new Date(),
        });
      }
    }
    
    await batch.commit();
    console.log('✅ Inventory updated for', items.length, 'items');
  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    // Don't throw - inventory update shouldn't block order completion
  }
}

// Send confirmation email (placeholder - integrate with your email service)
async function sendSuccessEmail(email: string, orderNumber: string, items: any[], totalAmount: number) {
  try {
    console.log('📧 Sending success email to:', email);
    console.log('   Order:', orderNumber);
    console.log('   Total:', totalAmount / 100);
    
    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'orders@nomatch.us',
    //   to: email,
    //   subject: `NoMatch – Order #${orderNumber} Confirmed`,
    //   html: `<h1>Thank you for your order!</h1>...`
    // });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw - email failure shouldn't block order
  }
}

// Send failed payment email
async function sendFailureEmail(email: string, orderNumber: string, reason: string) {
  try {
    console.log('📧 Sending failure email to:', email);
    console.log('   Order:', orderNumber);
    console.log('   Reason:', reason);
    
    // TODO: Integrate with email service
    
  } catch (error) {
    console.error('❌ Error sending failure email:', error);
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
    // Get the signature from the header
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'No signature found' });
    }

    // Get the raw body
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    console.log('✅ Webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout Session completed:', session.id);
        
        // Get full session with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'payment_intent', 'customer_details'],
        });
        
        // Extract metadata
        const orderNumber = session.metadata?.orderNumber || `NM-${session.id.slice(-8)}`;
        const cartItemsJson = session.metadata?.cartItems;
        const customerInfoJson = session.metadata?.customerInfo;
        const email = fullSession.customer_details?.email || '';
        
        if (cartItemsJson) {
          const cartItems = JSON.parse(cartItemsJson);
          const customerInfo = customerInfoJson ? JSON.parse(customerInfoJson) : {};
          
          console.log('📦 Order items:', cartItems);
          
          // Prepare order data
          const orderData = {
            orderNumber,
            sessionId: session.id,
            paymentIntentId: (fullSession.payment_intent as any)?.id,
            customerId: session.customer,
            customerEmail: email,
            customerInfo,
            items: cartItems,
            lineItems: fullSession.line_items?.data || [],
            totalAmount: session.amount_total,
            currency: session.currency,
            paymentStatus: session.payment_status,
            shippingAddress: (fullSession as any).shipping_details?.address || fullSession.customer_details?.address,
            status: 'paid',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Save order to Firestore
          await saveOrder(orderData);
          
          // Update inventory
          await updateInventory(cartItems);
          
          // Send confirmation email
          await sendSuccessEmail(email, orderNumber, cartItems, session.amount_total || 0);
          
          console.log('✅ Order fulfilled:', orderNumber);
        }
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 PaymentIntent succeeded:', paymentIntent.id);
        
        // This event fires when a payment succeeds
        // If using Checkout, the checkout.session.completed event is more useful
        // This is mainly for manual payment intents
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        // Get order number from metadata
        const orderNumber = paymentIntent.metadata?.orderNumber || `NM-${paymentIntent.id.slice(-8)}`;
        const email = (paymentIntent as any).receipt_email || '';
        const failureReason = paymentIntent.last_payment_error?.message || 'Your card was declined.';
        
        // Log failed payment
        await db.collection('failed_payments').add({
          paymentIntentId: paymentIntent.id,
          orderNumber,
          email,
          reason: failureReason,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          createdAt: new Date(),
        });
        
        // Send failure notification email
        if (email) {
          await sendFailureEmail(email, orderNumber, failureReason);
        }
        
        console.log('📝 Failed payment logged:', orderNumber);
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

