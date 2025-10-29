import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const db = getFirestore();

// Send tracking email
async function sendTrackingEmail(
  email: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string,
  customerName: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not set - skipping tracking email');
      return;
    }

    console.log('📧 Sending tracking email to:', email);

    // Dynamically import email template
    const { default: ShippingNotification } = await import('../src/emails/ShippingNotification');

    // Get tracking URL based on carrier
    const trackingUrl = getTrackingUrl(carrier, trackingNumber);

    // Render email HTML
    const emailHtml = await renderAsync(
      ShippingNotification({
        orderNumber,
        trackingNumber,
        carrier,
        trackingUrl,
        customerName,
      })
    );

    // Send email
    const from = process.env.EMAIL_FROM || 'NoMatch <onboarding@resend.dev>';
    const result = await resend.emails.send({
      from,
      to: email,
      subject: `Your NoMatch Order #${orderNumber} Has Shipped! 📦`,
      html: emailHtml,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      throw new Error(result.error.message);
    }

    console.log('✅ Tracking email sent! ID:', result.data?.id);
  } catch (error: any) {
    console.error('❌ Error sending tracking email:', error);
    console.error('Error details:', error?.message);
  }
}

// Get tracking URL by carrier
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierLower = carrier.toLowerCase();
  
  if (carrierLower.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  } else if (carrierLower.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  } else if (carrierLower.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  } else if (carrierLower.includes('dhl')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
  }
  
  return `https://www.google.com/search?q=${trackingNumber}+tracking`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📦 ShipStation webhook received');
    console.log('📦 Full webhook body:', JSON.stringify(req.body, null, 2));

    const webhook = req.body;
    const resourceType = webhook.resource_type;
    const resourceUrl = webhook.resource_url;

    console.log('Webhook type:', resourceType);
    console.log('Resource URL:', resourceUrl);

    // Handle SHIP_NOTIFY event (when label is created)
    if (resourceType === 'SHIP_NOTIFY') {
      console.log('🚢 Ship notification received');

      // ShipStation sends shipment data directly in the webhook body
      // The resourceUrl points to the full shipment details we can fetch
      
      const apiKey = process.env.SHIPSTATION_API_KEY;
      const apiSecret = process.env.SHIPSTATION_API_SECRET;

      if (!apiKey || !apiSecret) {
        console.error('ShipStation credentials not configured');
        return res.status(200).json({ received: true });
      }

      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

      // Fetch full shipment details from the resource URL
      let shipment: any = {};
      
      if (resourceUrl) {
        try {
          const shipmentResponse = await fetch(resourceUrl, {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          });

          if (shipmentResponse.ok) {
            shipment = await shipmentResponse.json();
            console.log('📦 Fetched shipment data from URL:', JSON.stringify(shipment, null, 2));
          } else {
            console.error('Failed to fetch from resource URL, status:', shipmentResponse.status);
          }
        } catch (err) {
          console.error('Error fetching shipment details:', err);
        }
      }
      
      // Extract data - try multiple possible field names
      // ShipStation API returns { shipments: [...] }, so get the first shipment
      const shipmentData = shipment.shipments?.[0] || shipment;
      const orderNumber = shipmentData.orderNumber || shipmentData.order_number || webhook.order_number;
      const trackingNumber = shipmentData.trackingNumber || shipmentData.tracking_number || webhook.tracking_number;
      const carrier = shipmentData.carrierCode || shipmentData.carrier_code || webhook.carrier_code || shipmentData.serviceCode;

      console.log('📦 Extracted info:', { orderNumber, trackingNumber, carrier });

      // Only process our custom orders (not WooCommerce)
      if (orderNumber && orderNumber.startsWith('NM-')) {
        // Get order from Firestore to get customer email
        const orderRef = db.collection('orders').doc(orderNumber);
        const orderDoc = await orderRef.get();

        if (orderDoc.exists) {
          const orderData = orderDoc.data();
          const customerEmail = orderData?.customerEmail || orderData?.customerInfo?.email;
          const customerName = orderData?.customerInfo?.name || 'Valued Customer';

          if (customerEmail && trackingNumber) {
            // Update order with tracking info
            await orderRef.update({
              trackingNumber,
              carrier,
              shippedAt: new Date(),
              status: 'shipped',
              updatedAt: new Date(),
            });

            // Send tracking email
            await sendTrackingEmail(customerEmail, orderNumber, trackingNumber, carrier, customerName);
            
            console.log('✅ Tracking notification sent for order:', orderNumber);
          } else {
            console.warn('⚠️ Missing email or tracking number');
          }
        } else {
          console.warn('⚠️ Order not found in Firestore:', orderNumber);
        }
      } else {
        console.log('ℹ️ Skipping non-custom order:', orderNumber);
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error processing ShipStation webhook:', err);
    res.status(200).json({ received: true }); // Always return 200 to ShipStation
  }
}

