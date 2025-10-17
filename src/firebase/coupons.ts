import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

export interface Coupon {
  id: string;
  code: string;              // e.g., "WELCOME10"
  type: 'percentage' | 'fixed'; // percentage off or fixed amount off
  value: number;             // e.g., 10 for 10%, or 1500 for $15.00 in cents
  minPurchase?: number;      // minimum purchase in cents (optional)
  maxDiscount?: number;      // maximum discount in cents (for percentage coupons)
  usageLimit?: number;       // how many times it can be used (optional)
  usageCount: number;        // how many times it has been used
  active: boolean;           // whether coupon is active
  expiresAt?: Date;          // expiration date (optional)
  createdAt: Date;
  updatedAt: Date;
}

const COUPONS_COLLECTION = 'coupons';

// Get all coupons
export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const snapshot = await getDocs(couponsRef);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
    })) as Coupon[];
  } catch (error) {
    console.error('Error getting coupons:', error);
    return [];
  }
}

// Get single coupon by code
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
    } as Coupon;
  } catch (error) {
    console.error('Error getting coupon:', error);
    return null;
  }
}

// Validate coupon
export async function validateCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: Coupon;
}> {
  try {
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }
    
    if (!coupon.active) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active' };
    }
    
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'This coupon has reached its usage limit' };
    }
    
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      const minAmount = (coupon.minPurchase / 100).toFixed(2);
      return { valid: false, discount: 0, message: `Minimum purchase of $${minAmount} required` };
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
    
    return { 
      valid: true, 
      discount, 
      coupon,
      message: `Coupon applied! You save $${(discount / 100).toFixed(2)}`
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, discount: 0, message: 'Error validating coupon' };
  }
}

// Create or update coupon
export async function saveCoupon(coupon: Omit<Coupon, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, coupon.id);
    const existingDoc = await getDoc(couponRef);
    
    const now = new Date();
    
    if (existingDoc.exists()) {
      // Update existing
      await updateDoc(couponRef, {
        ...coupon,
        updatedAt: now,
      });
    } else {
      // Create new
      await setDoc(couponRef, {
        ...coupon,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error saving coupon:', error);
    throw error;
  }
}

// Delete coupon
export async function deleteCoupon(couponId: string): Promise<void> {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
}

// Increment usage count
export async function incrementCouponUsage(couponId: string): Promise<void> {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    const couponDoc = await getDoc(couponRef);
    
    if (couponDoc.exists()) {
      const currentCount = couponDoc.data().usageCount || 0;
      await updateDoc(couponRef, {
        usageCount: currentCount + 1,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    throw error;
  }
}

