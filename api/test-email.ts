import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    console.log('Testing email...');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ 
        error: 'RESEND_API_KEY not set',
        hasKey: false,
      });
    }

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NoMatch <onboarding@resend.dev>',
      to: req.query.email as string || 'test@example.com',
      subject: 'NoMatch Test Email',
      html: '<h1>Test Email</h1><p>If you receive this, Resend is working!</p>',
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return res.status(500).json({ 
        error: result.error,
        hasKey: true,
      });
    }

    console.log('Email sent!', result.data?.id);
    
    return res.status(200).json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Email sent! Check your inbox.',
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: error.toString(),
    });
  }
}

