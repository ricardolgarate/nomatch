import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

// Export coupon management functions
export { createCoupon, listCoupons, deleteCoupon } from './coupons';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2025-09-30.clover',
});

// Email transporter
const getEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: functions.config().smtp.host || 'smtp.gmail.com',
    port: parseInt(functions.config().smtp.port || '587'),
    secure: false,
    auth: {
      user: functions.config().smtp.user,
      pass: functions.config().smtp.pass,
    },
  });
};

// ============================================
// 1. CREATE CHECKOUT SESSION
// ============================================
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { items, couponCode, customerEmail } = data;

  try {
    // Convert cart items to Stripe line items
    const lineItems = items.map((item: any) => {
      const unitAmount = Math.round(parseFloat(item.price.replace('$', '')) * 100);
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.size ? `Size: ${item.size}` : undefined,
            images: [item.image],
            metadata: {
              product_id: item.id,
              category: item.category,
              size: item.size || '',
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${functions.config().website.url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${functions.config().website.url}/checkout`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      metadata: {
        items: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
        }))),
      },
    };

    // Add coupon if provided
    if (couponCode) {
      try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon.valid) {
          sessionParams.discounts = [{ coupon: couponCode }];
        }
      } catch (error) {
        console.log('Invalid coupon code:', couponCode);
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});

// ============================================
// 2. VALIDATE COUPON
// ============================================
export const validateCoupon = functions.https.onCall(async (data, context) => {
  const { code } = data;

  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'Coupon code is required');
  }

  try {
    const coupon = await stripe.coupons.retrieve(code);
    
    return {
      id: coupon.id,
      percent_off: coupon.percent_off,
      amount_off: coupon.amount_off,
      currency: coupon.currency,
      valid: coupon.valid,
      max_redemptions: coupon.max_redemptions,
      times_redeemed: coupon.times_redeemed,
    };
  } catch (error) {
    return { valid: false, error: 'Invalid coupon code' };
  }
});

// ============================================
// 3. STRIPE WEBHOOK HANDLER
// ============================================
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  try {
    const items = JSON.parse(session.metadata?.items || '[]');
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create order in Firestore
    await db.collection('orders').doc(orderId).set({
      stripeSessionId: session.id,
      customerEmail: session.customer_details?.email || '',
      customerName: session.customer_details?.name || null,
      items: items,
      subtotal: (session.amount_subtotal || 0) / 100,
      discount: session.total_details?.amount_discount ? (session.total_details.amount_discount / 100) : null,
      total: (session.amount_total || 0) / 100,
      paymentStatus: 'succeeded',
      fulfillmentStatus: 'pending',
      shippingAddress: session.shipping_details?.address || null,
      emailSent: false,
      invoiceGenerated: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Update inventory
    for (const item of items) {
      const productRef = db.collection('products').doc(item.id);
      const productSnap = await productRef.get();
      
      if (productSnap.exists) {
        if (item.size) {
          await productRef.update({
            [`sizes.${item.size}`]: admin.firestore.FieldValue.increment(-item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          // Check updated stock
          const updated = await productRef.get();
          const newStock = updated.data()?.sizes?.[item.size] || 0;
          
          // Send low stock alert
          if (newStock <= 5 && newStock > 0) {
            await sendLowInventoryAlert(item.id, item.name, newStock, item.size);
          }
        } else {
          await productRef.update({
            stock: admin.firestore.FieldValue.increment(-item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }
    
    // Send order confirmation email
    await sendOrderConfirmationEmail(orderId, session, items);
    
    // Mark email as sent
    await db.collection('orders').doc(orderId).update({
      emailSent: true,
      invoiceGenerated: true,
    });
    
    console.log('Order processing completed:', orderId);
  } catch (error) {
    console.error('Error processing checkout:', error);
    // Send admin alert
    await sendAdminErrorAlert(session, error);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });
    
    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      const items = JSON.parse(session.metadata?.items || '[]');
      const orderId = `FAILED-${Date.now()}`;
      
      // Create failed order record
      await db.collection('orders').doc(orderId).set({
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntent.id,
        customerEmail: session.customer_details?.email || '',
        customerName: session.customer_details?.name || null,
        items: items,
        subtotal: paymentIntent.amount / 100,
        total: paymentIntent.amount / 100,
        paymentStatus: 'failed',
        fulfillmentStatus: 'cancelled',
        emailSent: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Send failure notifications
      await sendPaymentFailedNotification(session, paymentIntent, items);
      
      // Update order as email sent
      await db.collection('orders').doc(orderId).update({ emailSent: true });
    }
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}

// Email helper functions
async function sendOrderConfirmationEmail(orderId: string, session: Stripe.Checkout.Session, items: any[]) {
  const transporter = getEmailTransporter();
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        ${item.size ? `Size: ${item.size}<br>` : ''}
        Qty: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(parseFloat(item.price?.replace('$', '') || '0') * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 20px; font-weight: bold; color: #667eea; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Thank You for Your Order!</h1>
      </div>
      <div class="content">
        <p>Your order has been confirmed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <h3>Order Summary:</h3>
        <table>${itemsHtml}</table>
        <p class="total">Total: $${((session.amount_total || 0) / 100).toFixed(2)}</p>
        <p>We'll send you tracking information once your order ships (3-5 business days).</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"NoMatch" <${functions.config().smtp.user}>`,
    to: session.customer_details?.email,
    subject: `Order Confirmation - ${orderId}`,
    html: emailHtml,
  });
}

async function sendPaymentFailedNotification(session: Stripe.Checkout.Session, paymentIntent: Stripe.PaymentIntent, items: any[]) {
  const transporter = getEmailTransporter();
  
  // Email to customer
  await transporter.sendMail({
    from: `"NoMatch" <${functions.config().smtp.user}>`,
    to: session.customer_details?.email,
    subject: 'Payment Failed - Please Try Again',
    html: `
      <h2>⚠️ Payment Failed</h2>
      <p>We were unable to process your payment.</p>
      <p><strong>Reason:</strong> ${paymentIntent.last_payment_error?.message || 'Unknown error'}</p>
      <p>Your items are still available. <a href="${functions.config().website.url}/checkout">Try again</a></p>
    `,
  });
  
  // Alert admin if high value (over $100)
  if (paymentIntent.amount >= 10000) {
    await transporter.sendMail({
      from: `"NoMatch System" <${functions.config().smtp.user}>`,
      to: functions.config().admin.email,
      subject: `🚨 High-Value Payment Failed: $${(paymentIntent.amount / 100).toFixed(2)}`,
      html: `
        <h2>Failed Payment Alert</h2>
        <p><strong>Amount:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
        <p><strong>Customer:</strong> ${session.customer_details?.email}</p>
        <p><strong>Error:</strong> ${paymentIntent.last_payment_error?.message}</p>
      `,
    });
  }
}

async function sendLowInventoryAlert(productId: string, productName: string, stock: number, size?: string) {
  const transporter = getEmailTransporter();
  
  await transporter.sendMail({
    from: `"NoMatch Inventory" <${functions.config().smtp.user}>`,
    to: functions.config().admin.email,
    subject: `📦 Low Inventory: ${productName}`,
    html: `
      <h3>Low Stock Alert</h3>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>ID:</strong> ${productId}</p>
      ${size ? `<p><strong>Size:</strong> ${size}</p>` : ''}
      <p><strong>Remaining:</strong> ${stock} units</p>
      <p>Consider restocking soon!</p>
    `,
  });
}

async function sendAdminErrorAlert(session: Stripe.Checkout.Session, error: any) {
  const transporter = getEmailTransporter();
  
  await transporter.sendMail({
    from: `"NoMatch System" <${functions.config().smtp.user}>`,
    to: functions.config().admin.email,
    subject: '🚨 Order Processing Error',
    html: `
      <h2>Error Processing Order</h2>
      <p><strong>Session ID:</strong> ${session.id}</p>
      <p><strong>Customer:</strong> ${session.customer_details?.email}</p>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Please check the system logs for more details.</p>
    `,
  });
}

