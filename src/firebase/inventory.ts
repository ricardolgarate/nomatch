import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

export type ProductCategory = 'Shoes' | 'Clothing' | 'Accessories' | 'Other';

export interface ProductInventory {
  id: string;
  name: string;
  price: string;
  sku?: string;
  category: ProductCategory | string;
  subcategory?: string;
  description: string;
  details?: string;
  images: string[];
  /** Per-size stock. Present on sized products (Shoes / sized Clothing). */
  sizes?: {
    [size: string]: number;
  };
  /** Flat stock count for products without sizes. */
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PRODUCTS_COLLECTION = 'products';
const LOCAL_PRODUCTS_KEY = 'bfab_local_products';

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function normalizeLocalProduct(product: Record<string, unknown>): ProductInventory {
  const createdAt = typeof product.createdAt === 'string' ? new Date(product.createdAt) : undefined;
  const updatedAt = typeof product.updatedAt === 'string' ? new Date(product.updatedAt) : undefined;
  return {
    ...(product as unknown as ProductInventory),
    createdAt,
    updatedAt,
  };
}

function getLocalProducts(): ProductInventory[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map(normalizeLocalProduct);
  } catch (error) {
    console.warn('Error reading local products cache:', error);
    return [];
  }
}

function setLocalProducts(products: ProductInventory[]): void {
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.warn('Error writing local products cache:', error);
  }
}

function upsertLocalProduct(product: Omit<ProductInventory, 'createdAt' | 'updatedAt'>): void {
  const existing = getLocalProducts();
  const now = new Date();
  const idx = existing.findIndex((p) => p.id === product.id);
  const nextProduct: ProductInventory = {
    ...product,
    createdAt: idx > -1 ? existing[idx].createdAt || now : now,
    updatedAt: now,
  };
  if (idx > -1) {
    existing[idx] = nextProduct;
  } else {
    existing.push(nextProduct);
  }
  setLocalProducts(existing);
}

function removeLocalProduct(productId: string): void {
  const existing = getLocalProducts();
  const next = existing.filter((p) => p.id !== productId);
  setLocalProducts(next);
}

function mergeUniqueById(primary: ProductInventory[], secondary: ProductInventory[]): ProductInventory[] {
  const byId = new Map<string, ProductInventory>();
  for (const item of primary) byId.set(item.id, item);
  for (const item of secondary) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

export async function getAllProducts(): Promise<ProductInventory[]> {
  const localProducts = getLocalProducts();
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    const firestoreProducts = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.(),
    })) as ProductInventory[];
    return mergeUniqueById(firestoreProducts, localProducts);
  } catch (error) {
    console.error('Error getting products:', error);
    return localProducts;
  }
}

export async function getProduct(productId: string): Promise<ProductInventory | null> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const snapshot = await getDoc(productRef);
    if (snapshot.exists()) {
      return {
        ...snapshot.data(),
        id: snapshot.id,
        createdAt: snapshot.data().createdAt?.toDate?.(),
        updatedAt: snapshot.data().updatedAt?.toDate?.(),
      } as ProductInventory;
    }
    const local = getLocalProducts().find((p) => p.id === productId);
    return local || null;
  } catch (error) {
    console.error('Error getting product:', error);
    const local = getLocalProducts().find((p) => p.id === productId);
    return local || null;
  }
}

export async function saveProduct(
  product: Omit<ProductInventory, 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(
      productRef,
      {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    // Keep local cache in sync after successful write too
    upsertLocalProduct(product);
  } catch (error) {
    console.error('Error saving product:', error);
    // If Firestore permissions are not configured yet, keep local edits unblocked.
    upsertLocalProduct(product);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
    removeLocalProduct(productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    removeLocalProduct(productId);
  }
}

export async function updateStock(
  productId: string,
  size: string | undefined,
  quantity: number
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);

    if (size) {
      await updateDoc(productRef, {
        [`sizes.${size}`]: increment(quantity),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(productRef, {
        stock: increment(quantity),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    // Local fallback stock update
    const localProducts = getLocalProducts();
    const idx = localProducts.findIndex((p) => p.id === productId);
    if (idx > -1) {
      const current = localProducts[idx];
      if (size) {
        const sizes = { ...(current.sizes || {}) };
        sizes[size] = (sizes[size] || 0) + quantity;
        current.sizes = sizes;
      } else {
        current.stock = (current.stock || 0) + quantity;
      }
      current.updatedAt = new Date();
      localProducts[idx] = current;
      setLocalProducts(localProducts);
    }
  }
}

export async function isInStock(productId: string, size?: string): Promise<boolean> {
  const product = await getProduct(productId);
  if (!product) return false;

  if (size && product.sizes) {
    return (product.sizes[size] || 0) > 0;
  }
  if (product.stock !== undefined) {
    return product.stock > 0;
  }
  return false;
}
