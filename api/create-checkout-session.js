import { createCheckoutSession } from '../server/stripe-checkout.mjs';

function siteUrlFromRequest(req) {
  return (
    process.env.PUBLIC_SITE_URL ||
    req.headers.origin ||
    `https://${req.headers.host}`
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    const result = await createCheckoutSession({
      body,
      siteUrl: siteUrlFromRequest(req),
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Checkout session error:', error);
    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Could not start checkout. Please try again.',
    });
  }
}
