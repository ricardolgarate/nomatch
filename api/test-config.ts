import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const config = {
      hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasViteFirebaseProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasAppUrl: !!process.env.APP_URL,
      hasEmailFrom: !!process.env.EMAIL_FROM,
      
      // Show lengths (not actual values)
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    };

    return res.status(200).json(config);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

