import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

// Webhook signature secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Handle different private key formats
    if (privateKey) {
      // Remove quotes if present
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      // Replace literal \n with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin credentials for webhook');
      throw new Error('Missing Firebase Admin credentials');
    }

    initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
    
    console.log('Firebase Admin initialized for webhook');
  } catch (error) {
    console.error('Error initializing Firebase Admin in webhook:', error);
    throw error;
  }
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

// Increment coupon usage count
async function incrementCouponUsage(couponId: string) {
  if (!couponId) return;
  
  try {
    const couponRef = db.collection('coupons').doc(couponId);
    const couponDoc = await couponRef.get();
    
    if (couponDoc.exists) {
      const currentCount = couponDoc.data()?.usageCount || 0;
      await couponRef.update({
        usageCount: currentCount + 1,
        updatedAt: new Date(),
      });
      console.log('✅ Coupon usage incremented:', couponId);
    }
  } catch (error) {
    console.error('❌ Error incrementing coupon usage:', error);
    // Don't throw - coupon increment shouldn't block order
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

// Send confirmation email using Resend
async function sendSuccessEmail(
  email: string,
  orderNumber: string,
  items: any[],
  totalAmount: number,
  orderData: any
) {
  try {
    console.log('📧 Sending success email to:', email);
    console.log('   Order:', orderNumber);
    console.log('   Total:', totalAmount / 100);

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not set - skipping email');
      return;
    }

    // Parse customer info and address
    const customerInfo = orderData.customerInfo || {};
    const customerName = customerInfo.name || 'Valued Customer';
    const billingAddress = customerInfo.address || customerInfo.billingAddress || {};
    
    // Get payment method info
    let paymentMethod = 'Card';
    if (orderData.paymentMethod) {
      const pm = await stripe.paymentMethods.retrieve(orderData.paymentMethod as string);
      if (pm.card) {
        paymentMethod = `${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}`;
      }
    }

    // Get line items from order for accurate pricing
    const lineItems = orderData.lineItems || [];
    
    // Format items for email
    const emailItems = items.map((item: any, index: number) => {
      // Get line item for accurate price
      const lineItem = lineItems[index];
      const unitPrice = lineItem?.price?.unit_amount || (totalAmount / items.length);
      
      return {
        id: item.id,
        name: item.name,
        image: lineItem?.price?.product?.images?.[0] || `https://preneurbank.com/Logo-NoMatch.webp`,
        size: item.size,
        quantity: item.quantity,
        price: `$${(unitPrice / 100).toFixed(2)}`,
        sku: item.sku,
      };
    });

    // Calculate amounts from metadata (already in cents)
    const subtotal = parseInt(orderData.metadata?.subtotal || String(totalAmount));
    const discount = parseInt(orderData.metadata?.discount || '0');
    const shipping = 0;
    const promoCode = orderData.metadata?.promoCode || undefined;

    console.log('📧 Rendering email template...');
    console.log('Email data:', { orderNumber, customerName, itemCount: emailItems.length });

    // Dynamically import email template
    const { default: OrderConfirmation } = await import('../src/emails/OrderConfirmation');

    // Render email HTML
    const emailHtml = await renderAsync(
      OrderConfirmation({
        orderNumber,
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        customerName,
        items: emailItems,
        subtotal,
        discount,
        shipping,
        total: totalAmount,
        paymentMethod,
        billingAddress,
        promoCode,
      })
    );

    console.log('✅ Email template rendered successfully');

    // Send email
    const from = process.env.EMAIL_FROM || 'NoMatch <support@preneurbank.com>';
    console.log('📤 Sending email from:', from, 'to:', email);

    const result = await resend.emails.send({
      from,
      to: email,
      subject: `NoMatch – Order #${orderNumber} Confirmed!`,
      html: emailHtml,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      throw new Error(result.error.message);
    }

    console.log('✅ Email sent successfully! ID:', result.data?.id);
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 500),
    });
    // Don't throw - email failure shouldn't block order completion
  }
}

// Send order to ShipStation
async function sendToShipStation(
  orderNumber: string,
  orderData: any,
  items: any[],
  totalAmount: number
) {
  try {
    if (!process.env.SHIPSTATION_API_KEY || !process.env.SHIPSTATION_API_SECRET) {
      console.warn('⚠️ ShipStation credentials not set - skipping order creation');
      return;
    }

    console.log('📦 Creating ShipStation order:', orderNumber);

    const customerInfo = orderData.customerInfo || {};
    const shippingAddress = orderData.shippingAddress || customerInfo.address || {};
    const billingAddress = customerInfo.address || {};

    // Prepare ShipStation order
    const shipStationOrder = {
      orderNumber,
      orderDate: new Date().toISOString(),
      orderStatus: 'awaiting_shipment',
      customerEmail: customerInfo.email || orderData.customerEmail || '',
      billTo: {
        name: customerInfo.name || 'Customer',
        street1: billingAddress.line1 || '',
        street2: billingAddress.line2 || '',
        city: billingAddress.city || '',
        state: billingAddress.state || '',
        postalCode: billingAddress.postal_code || billingAddress.zipCode || '',
        country: billingAddress.country || 'US',
        phone: customerInfo.phone || '',
      },
      shipTo: {
        name: customerInfo.name || shippingAddress.name || 'Customer',
        street1: shippingAddress.line1 || billingAddress.line1 || '',
        street2: shippingAddress.line2 || billingAddress.line2 || '',
        city: shippingAddress.city || billingAddress.city || '',
        state: shippingAddress.state || billingAddress.state || '',
        postalCode: shippingAddress.postal_code || billingAddress.postal_code || '',
        country: shippingAddress.country || billingAddress.country || 'US',
        phone: customerInfo.phone || shippingAddress.phone || '',
      },
      items: items.map(item => ({
        sku: item.sku || item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat((item.price || '0').replace('$', '')),
        imageUrl: item.image,
        weight: {
          value: 16, // Default 1 lb per pair of shoes
          units: 'ounces' as const,
        },
      })),
      amountPaid: totalAmount / 100,
      shippingAmount: 0,
      taxAmount: 0,
      internalNotes: `Order from preneurbank.com. Stripe Payment ID: ${orderData.paymentIntentId}`,
      requestedShippingService: 'USPS Priority Mail',
    };

    // Create Basic Auth header
    const auth = Buffer.from(`${process.env.SHIPSTATION_API_KEY}:${process.env.SHIPSTATION_API_SECRET}`).toString('base64');

    const response = await fetch('https://ssapi.shipstation.com/orders/createorder', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipStationOrder),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ShipStation API error:', response.status, errorText);
      throw new Error(`ShipStation error: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ ShipStation order created! Order ID:', result.orderId);
    
    return result;
  } catch (error: any) {
    console.error('❌ Error sending to ShipStation:', error);
    console.error('Error details:', error?.message);
    // Don't throw - ShipStation failure shouldn't block order completion
  }
}

// Send failed payment email
async function sendFailureEmail(
  email: string,
  orderNumber: string,
  reason: string,
  totalAmount: number,
  customerName: string = 'Valued Customer'
) {
  try {
    console.log('📧 Sending failure email to:', email);
    console.log('   Order:', orderNumber);
    console.log('   Reason:', reason);

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not set - skipping failure email');
      return;
    }

    console.log('📧 Rendering failure email template...');

    // Dynamically import email template
    const { default: PaymentFailed } = await import('../src/emails/PaymentFailed');

    // Render email HTML
    const emailHtml = await renderAsync(
      PaymentFailed({
        orderNumber,
        customerName,
        reason,
        total: totalAmount,
      })
    );

    console.log('✅ Failure email template rendered');

    // Send email
    const from = process.env.EMAIL_FROM || 'NoMatch <support@preneurbank.com>';
    console.log('📤 Sending failure email from:', from, 'to:', email);

    const result = await resend.emails.send({
      from,
      to: email,
      subject: `NoMatch – Payment Failed for Order #${orderNumber}`,
      html: emailHtml,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      throw new Error(result.error.message);
    }

    console.log('✅ Failure email sent! ID:', result.data?.id);
  } catch (error: any) {
    console.error('❌ Error sending failure email:', error);
    console.error('Error details:', error?.message);
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
            paymentMethod: (fullSession.payment_intent as any)?.payment_method,
            shippingAddress: (fullSession as any).shipping_details?.address || fullSession.customer_details?.address,
            metadata: session.metadata, // Include all metadata (subtotal, discount, promoCode, etc.)
            status: 'paid',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Save order to Firestore
          await saveOrder(orderData);
          
          // Update inventory
          await updateInventory(cartItems);
          
          // Increment coupon usage if a coupon was used
          if (session.metadata?.couponId) {
            await incrementCouponUsage(session.metadata.couponId);
          }
          
          // Send confirmation email
          await sendSuccessEmail(email, orderNumber, cartItems, session.amount_total || 0, orderData);
          
          // Send to ShipStation
          await sendToShipStation(orderNumber, orderData, cartItems, session.amount_total || 0);
          
          console.log('✅ Order fulfilled:', orderNumber);
        }
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 PaymentIntent succeeded:', paymentIntent.id);
        
        // Extract metadata from payment intent
        const orderNumber = paymentIntent.metadata?.orderNumber || `NM-${paymentIntent.id.slice(-8)}`;
        const cartItemsJson = paymentIntent.metadata?.cartItems;
        const customerInfoJson = paymentIntent.metadata?.customerInfo;
        
        if (cartItemsJson) {
          const cartItems = JSON.parse(cartItemsJson);
          const customerInfo = customerInfoJson ? JSON.parse(customerInfoJson) : {};
          
          console.log('📦 Order items:', cartItems);
          
          // Prepare order data
          const orderData = {
            orderNumber,
            paymentIntentId: paymentIntent.id,
            customerEmail: customerInfo.email || '',
            customerInfo,
            items: cartItems,
            totalAmount: paymentIntent.amount,
            currency: paymentIntent.currency,
            paymentStatus: paymentIntent.status,
            paymentMethod: paymentIntent.payment_method,
            metadata: paymentIntent.metadata, // Include all metadata (subtotal, discount, promoCode, etc.)
            status: 'paid',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Save order to Firestore
          await saveOrder(orderData);
          
          // Update inventory
          await updateInventory(cartItems);
          
          // Increment coupon usage if a coupon was used
          if (paymentIntent.metadata?.couponId) {
            await incrementCouponUsage(paymentIntent.metadata.couponId);
          }
          
          // Send confirmation email
          await sendSuccessEmail(customerInfo.email || '', orderNumber, cartItems, paymentIntent.amount, orderData);
          
          // Send to ShipStation
          await sendToShipStation(orderNumber, orderData, cartItems, paymentIntent.amount);
          
          console.log('✅ Order fulfilled (PaymentIntent):', orderNumber);
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        // Get order number from metadata
        const orderNumber = paymentIntent.metadata?.orderNumber || `NM-${paymentIntent.id.slice(-8)}`;
        const customerInfoJson = paymentIntent.metadata?.customerInfo;
        const customerInfo = customerInfoJson ? JSON.parse(customerInfoJson) : {};
        const email = customerInfo.email || (paymentIntent as any).receipt_email || '';
        const customerName = customerInfo.name || 'Valued Customer';
        const failureReason = paymentIntent.last_payment_error?.message || 'Your card was declined.';
        
        // Log failed payment
        await db.collection('failed_payments').add({
          paymentIntentId: paymentIntent.id,
          orderNumber,
          email,
          customerName,
          reason: failureReason,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          createdAt: new Date(),
        });
        
        // Send failure notification email
        if (email) {
          await sendFailureEmail(email, orderNumber, failureReason, paymentIntent.amount, customerName);
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

