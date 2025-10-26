import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ShipStationResponse {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  orderDate: string;
  orderStatus: string;
}

interface ShipStationOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  weight?: {
    value: number;
    units: 'ounces' | 'pounds' | 'grams';
  };
}

interface ShipStationOrderData {
  orderNumber: string;
  orderDate: string;
  orderStatus: 'awaiting_shipment' | 'shipped' | 'cancelled';
  customerEmail: string;
  billTo: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  shipTo: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: ShipStationOrderItem[];
  amountPaid: number;
  shippingAmount: number;
  taxAmount: number;
  customerNotes?: string;
  internalNotes?: string;
  requestedShippingService?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    const apiSecret = process.env.SHIPSTATION_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('ShipStation credentials not configured');
      return res.status(500).json({ 
        error: 'ShipStation not configured',
        message: 'Please add SHIPSTATION_API_KEY and SHIPSTATION_API_SECRET to environment variables'
      });
    }

    const orderData: ShipStationOrderData = req.body;

    // Create Basic Auth header
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    console.log('Creating ShipStation order:', orderData.orderNumber);

    // Send order to ShipStation
    const response = await fetch('https://ssapi.shipstation.com/orders/createorder', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ShipStation API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'ShipStation API error',
        details: errorText,
      });
    }

    const result = await response.json() as ShipStationResponse;
    console.log('✅ ShipStation order created:', result.orderId);

    res.status(200).json({
      success: true,
      orderId: result.orderId,
      orderNumber: orderData.orderNumber,
    });
  } catch (err: any) {
    console.error('Error creating ShipStation order:', err);
    res.status(500).json({
      error: 'Failed to create ShipStation order',
      message: err.message,
    });
  }
}

