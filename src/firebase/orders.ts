import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query,
  orderBy,
  limit,
  where,
  Timestamp
} from 'firebase/firestore';
import { CartItem } from '../lib/stripe';

export interface Order {
  id: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  customerEmail: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded';
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  emailSent?: boolean;
  invoiceGenerated?: boolean;
}

const ORDERS_COLLECTION = 'orders';

// Create new order
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const order: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(orderRef, {
      ...order,
      createdAt: Timestamp.fromDate(order.createdAt),
      updatedAt: Timestamp.fromDate(order.updatedAt),
    });

    console.log('Order created:', orderId);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get order by ID
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const data = orderSnap.data();
      return {
        ...data,
        id: orderSnap.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

// Get all orders (for admin dashboard)
export async function getAllOrders(limitCount: number = 100): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

// Get orders by status
export async function getOrdersByStatus(status: Order['paymentStatus'] | Order['fulfillmentStatus']): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef, 
      where('paymentStatus', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  }
}

// Update order
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Convert Date objects to Timestamps
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updates.createdAt);
    }

    await updateDoc(orderRef, updateData);
    console.log('Order updated:', orderId);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string, 
  paymentStatus?: Order['paymentStatus'],
  fulfillmentStatus?: Order['fulfillmentStatus']
): Promise<void> {
  const updates: Partial<Order> = {};
  
  if (paymentStatus) updates.paymentStatus = paymentStatus;
  if (fulfillmentStatus) updates.fulfillmentStatus = fulfillmentStatus;
  
  await updateOrder(orderId, updates);
}

// Get order statistics for admin dashboard
export async function getOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}> {
  try {
    const orders = await getAllOrders(1000); // Get more for stats
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.paymentStatus === 'pending').length,
      successfulOrders: orders.filter(o => o.paymentStatus === 'succeeded').length,
      failedOrders: orders.filter(o => o.paymentStatus === 'failed').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'succeeded')
        .reduce((sum, o) => sum + o.total, 0),
      recentOrders: orders.slice(0, 10),
    };

    return stats;
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw error;
  }
}
