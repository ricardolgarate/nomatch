import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Subscriber {
  id: string;
  email: string;
  source: 'newsletter' | 'checkout' | 'other';
  createdAt?: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const SUBSCRIBERS_COLLECTION = 'subscribers';
const MESSAGES_COLLECTION = 'contact_messages';

function emailToId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
}

/* ---------- Subscribers ---------- */

export async function saveSubscriber(
  email: string,
  source: Subscriber['source'] = 'newsletter',
): Promise<void> {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned) throw new Error('Email is required');
  const id = emailToId(cleaned);
  const ref = doc(db, SUBSCRIBERS_COLLECTION, id);
  await setDoc(
    ref,
    {
      email: cleaned,
      source,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  try {
    const q = query(
      collection(db, SUBSCRIBERS_COLLECTION),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: String(data.email ?? d.id),
        source: (data.source as Subscriber['source']) || 'newsletter',
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : undefined,
      };
    });
  } catch (err) {
    console.error('Error loading subscribers:', err);
    return [];
  }
}

export async function deleteSubscriber(id: string): Promise<void> {
  await deleteDoc(doc(db, SUBSCRIBERS_COLLECTION, id));
}

/* ---------- Contact messages ---------- */

export async function saveContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = collection(db, MESSAGES_COLLECTION);
  const created = await addDoc(ref, {
    ...data,
    status: 'new' as ContactStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: data.phone ? String(data.phone) : undefined,
        message: String(data.message ?? ''),
        status: (data.status as ContactStatus) || 'new',
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : undefined,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : undefined,
      };
    });
  } catch (err) {
    console.error('Error loading contact messages:', err);
    return [];
  }
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
): Promise<void> {
  const ref = doc(db, MESSAGES_COLLECTION, id);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getContactMessage(
  id: string,
): Promise<ContactMessage | null> {
  const ref = doc(db, MESSAGES_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    phone: data.phone ? String(data.phone) : undefined,
    message: String(data.message ?? ''),
    status: (data.status as ContactStatus) || 'new',
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt:
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  };
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
}
