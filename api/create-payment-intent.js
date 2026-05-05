import { createPaymentIntent } from '../server/stripe-checkout.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    const result = await createPaymentIntent({ body });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Payment intent error:', error);
    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Could not prepare payment. Please try again.',
    });
  }
}
