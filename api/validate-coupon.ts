import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
let db: ReturnType<typeof getFirestore> | null = null;

function initializeFirebase() {
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
        console.error('Missing Firebase Admin credentials:', {
          hasProjectId: !!projectId,
          hasClientEmail: !!clientEmail,
          hasPrivateKey: !!privateKey,
        });
        throw new Error('Missing Firebase Admin credentials');
      }

      console.log('Initializing Firebase Admin with project:', projectId);

      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
      
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  
  if (!db) {
    db = getFirestore();
  }
  
  return db;
}

// Validate coupon server-side
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, subtotal } = req.body as { code: string; subtotal: number };

    if (!code) {
      return res.status(400).json({ error: 'Coupon code required' });
    }

    console.log('Validating coupon:', code, 'for subtotal:', subtotal);

    // Initialize Firebase
    const database = initializeFirebase();
    
    if (!database) {
      console.error('Firestore not initialized');
      return res.status(500).json({ 
        valid: false, 
        discount: 0, 
        message: 'Database connection error' 
      });
    }

    // Get coupon from Firestore
    const couponsRef = database.collection('coupons');
    const snapshot = await couponsRef.where('code', '==', code.toUpperCase()).limit(1).get();

    console.log('Coupon query result:', snapshot.empty ? 'not found' : 'found');

    if (snapshot.empty) {
      return res.status(404).json({ 
        valid: false, 
        discount: 0, 
        message: 'Invalid coupon code' 
      });
    }

    const couponDoc = snapshot.docs[0];
    const coupon = couponDoc.data();

    // Validate active status
    if (!coupon.active) {
      return res.status(400).json({ 
        valid: false, 
        discount: 0, 
        message: 'This coupon is no longer active' 
      });
    }

    // Validate expiration
    if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
      return res.status(400).json({ 
        valid: false, 
        discount: 0, 
        message: 'This coupon has expired' 
      });
    }

    // Validate usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        valid: false, 
        discount: 0, 
        message: 'This coupon has reached its usage limit' 
      });
    }

    // Validate minimum purchase
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      const minAmount = (coupon.minPurchase / 100).toFixed(2);
      return res.status(400).json({ 
        valid: false, 
        discount: 0, 
        message: `Minimum purchase of $${minAmount} required` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.floor(subtotal * (coupon.value / 100));
      
      // Apply max discount if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // Fixed amount
      discount = coupon.value;
      
      // Don't let discount exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    res.status(200).json({
      valid: true,
      discount,
      couponId: couponDoc.id,
      message: `Coupon applied! You save $${(discount / 100).toFixed(2)}`,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (err: any) {
    console.error('Error validating coupon:', err);
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack?.substring(0, 200)
    });
    
    return res.status(500).json({ 
      valid: false,
      discount: 0,
      message: 'Error validating coupon',
      error: err.message || 'Unknown error'
    });
  }
}

