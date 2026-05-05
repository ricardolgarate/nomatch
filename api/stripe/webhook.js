import { handleStripeWebhook } from '../../server/stripe-checkout.mjs';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    const result = await handleStripeWebhook({ rawBody, signature });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res
      .status(400)
      .send(error instanceof Error ? error.message : 'Webhook failed.');
  }
}
