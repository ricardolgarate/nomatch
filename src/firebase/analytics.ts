import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './config';

export interface UserSession {
  sessionId: string;
  userId?: string;
  email?: string;
  timestamp: Date;
  lastActivity: Date;
  events: UserEvent[];
  status: 'browsing' | 'shopping' | 'product_view' | 'cart' | 'checkout' | 'payment_failed' | 'completed';
}

export interface UserEvent {
  type: 'page_visit' | 'shop_visit' | 'product_view' | 'add_to_cart' | 'checkout_initiated' | 'payment_failed' | 'purchase_completed';
  timestamp: Date;
  metadata?: any;
}

export interface AnalyticsMetrics {
  totalTraffic: number;
  shopVisits: number;
  productViews: number;
  abandonedCarts: number;
  initiatedCheckouts: number;
  paymentFailed: number;
  successfulPurchases: number;
  conversionRate: number;
  checkoutConversionRate: number;
}

// Generate a unique session ID
export function generateSessionId(): string {
  const stored = localStorage.getItem('nomatch_session_id');
  if (stored) return stored;
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('nomatch_session_id', sessionId);
  return sessionId;
}

// Remove undefined values from object (Firestore doesn't accept undefined)
function removeUndefined(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

// Track a user event
export async function trackEvent(
  eventType: UserEvent['type'],
  metadata?: any
): Promise<void> {
  try {
    const sessionId = generateSessionId();
    
    // Remove undefined values from metadata
    const cleanMetadata = removeUndefined(metadata || {});
    
    // Create or update session
    const sessionsRef = collection(db, 'analytics_sessions');
    const q = query(sessionsRef, where('sessionId', '==', sessionId));
    const snapshot = await getDocs(q);
    
    const event: UserEvent = {
      type: eventType,
      timestamp: new Date(),
      metadata: cleanMetadata
    };
    
    if (snapshot.empty) {
      // Create new session
      await addDoc(sessionsRef, {
        sessionId,
        timestamp: Timestamp.fromDate(new Date()),
        lastActivity: Timestamp.fromDate(new Date()),
        events: [event],
        status: getStatusFromEventType(eventType),
        metadata: cleanMetadata
      });
    } else {
      // Update existing session
      const sessionDoc = snapshot.docs[0];
      const sessionData = sessionDoc.data();
      const events = sessionData.events || [];
      
      await updateDoc(doc(db, 'analytics_sessions', sessionDoc.id), {
        lastActivity: Timestamp.fromDate(new Date()),
        events: [...events, event],
        status: getStatusFromEventType(eventType),
        metadata: removeUndefined({
          ...sessionData.metadata,
          ...cleanMetadata
        })
      });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Get status based on event type
function getStatusFromEventType(eventType: UserEvent['type']): UserSession['status'] {
  switch (eventType) {
    case 'shop_visit':
      return 'shopping';
    case 'product_view':
      return 'product_view';
    case 'add_to_cart':
      return 'cart';
    case 'checkout_initiated':
      return 'checkout';
    case 'payment_failed':
      return 'payment_failed';
    case 'purchase_completed':
      return 'completed';
    default:
      return 'browsing';
  }
}

// Get analytics metrics with proper funnel logic
export async function getAnalyticsMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsMetrics> {
  try {
    const sessionsRef = collection(db, 'analytics_sessions');
    let q = query(sessionsRef, orderBy('timestamp', 'desc'));
    
    const snapshot = await getDocs(q);
    let sessions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sessionId: data.sessionId,
        timestamp: data.timestamp?.toDate(),
        lastActivity: data.lastActivity?.toDate(),
        events: data.events || [],
        status: data.status,
        metadata: data.metadata || {}
      };
    });
    
    // Filter by date range if provided
    if (startDate || endDate) {
      sessions = sessions.filter(session => {
        const sessionDate = session.timestamp;
        if (startDate && sessionDate < startDate) return false;
        if (endDate && sessionDate > endDate) return false;
        return true;
      });
    }
    
    // Calculate metrics based on final status (no double counting)
    const totalTraffic = sessions.length;
    
    // Count unique sessions per category based on their final status
    const statusCounts = {
      completed: 0,
      payment_failed: 0,
      checkout: 0,
      cart: 0,
      product_view: 0,
      shopping: 0,
      browsing: 0
    };
    
    sessions.forEach(session => {
      if (session.status in statusCounts) {
        statusCounts[session.status as keyof typeof statusCounts]++;
      }
    });
    
    // Count sessions that visited shop, viewed products (at any point)
    const shopVisits = sessions.filter(s => 
      s.events.some((e: UserEvent) => e.type === 'shop_visit' || e.type === 'product_view' || 
                         e.type === 'add_to_cart' || e.type === 'checkout_initiated' ||
                         e.type === 'payment_failed' || e.type === 'purchase_completed')
    ).length;
    
    const productViews = sessions.filter(s =>
      s.events.some((e: UserEvent) => e.type === 'product_view' || e.type === 'add_to_cart' ||
                         e.type === 'checkout_initiated' || e.type === 'payment_failed' ||
                         e.type === 'purchase_completed')
    ).length;
    
    // Final status metrics (mutually exclusive)
    const successfulPurchases = statusCounts.completed;
    const paymentFailed = statusCounts.payment_failed;
    const initiatedCheckouts = statusCounts.checkout;
    const abandonedCarts = statusCounts.cart;
    
    // Calculate conversion rates
    const conversionRate = totalTraffic > 0 ? (successfulPurchases / totalTraffic) * 100 : 0;
    const checkoutConversionRate = initiatedCheckouts + paymentFailed + successfulPurchases > 0
      ? (successfulPurchases / (initiatedCheckouts + paymentFailed + successfulPurchases)) * 100
      : 0;
    
    return {
      totalTraffic,
      shopVisits,
      productViews,
      abandonedCarts,
      initiatedCheckouts,
      paymentFailed,
      successfulPurchases,
      conversionRate: Math.round(conversionRate * 100) / 100,
      checkoutConversionRate: Math.round(checkoutConversionRate * 100) / 100
    };
  } catch (error) {
    console.error('Error getting analytics metrics:', error);
    return {
      totalTraffic: 0,
      shopVisits: 0,
      productViews: 0,
      abandonedCarts: 0,
      initiatedCheckouts: 0,
      paymentFailed: 0,
      successfulPurchases: 0,
      conversionRate: 0,
      checkoutConversionRate: 0
    };
  }
}

// Clear old sessions (optional cleanup function)
export async function clearOldSessions(daysOld: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const sessionsRef = collection(db, 'analytics_sessions');
    const q = query(
      sessionsRef,
      where('timestamp', '<', Timestamp.fromDate(cutoffDate))
    );
    
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} old sessions to clean up`);
  } catch (error) {
    console.error('Error clearing old sessions:', error);
  }
}

