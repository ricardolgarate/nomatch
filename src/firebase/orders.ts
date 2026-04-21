import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export type OrderStatus =
  | 'new'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
  category: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  country: string;
  orderNote?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: CustomerInfo;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

const ORDERS_COLLECTION = 'orders';

function toOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    orderNumber: String(data.orderNumber ?? id),
    items: (data.items as OrderItem[]) || [],
    customer: data.customer as CustomerInfo,
    subtotal: (data.subtotal as number) || 0,
    shipping: (data.shipping as number) || 0,
    total: (data.total as number) || 0,
    status: (data.status as OrderStatus) || 'new',
    paymentStatus:
      (data.paymentStatus as Order['paymentStatus']) || 'pending',
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : undefined,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : undefined,
  };
}

export async function saveOrder(
  order: Omit<Order, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, order.id);
  await setDoc(
    ref,
    {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toOrder(d.id, d.data()));
  } catch (err) {
    console.error('Error loading orders:', err);
    return [];
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const ref = doc(db, ORDERS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toOrder(snap.id, snap.data());
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, id);
  await deleteDoc(ref);
}
