import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  increment
} from 'firebase/firestore';

export interface ProductInventory {
  id: string;
  name: string;
  price: string;
  sku: string;
  category: string;
  subcategory?: string; // For clothing items (e.g., 'Hoodie', 'Hat')
  categories?: string[]; // For multi-category items like accessories
  description: string;
  details?: string; // Extended product details
  material?: string; // For accessories
  finish?: string; // For accessories
  features?: string; // For accessories
  compatibility?: string; // For accessories
  images: string[];
  sizes?: {
    [size: string]: number; // size: quantity (for shoes: '6', '7', etc; for clothing: 'XS', 'S', 'M', 'L')
  };
  stock?: number; // For non-shoe items without sizes
  createdAt: Date;
  updatedAt: Date;
}

// Collection references
const PRODUCTS_COLLECTION = 'products';

// Get all products
export async function getAllProducts(): Promise<ProductInventory[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ProductInventory[];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

// Get single product
export async function getProduct(productId: string): Promise<ProductInventory | null> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const snapshot = await getDoc(productRef);
    if (snapshot.exists()) {
      return {
        ...snapshot.data(),
        id: snapshot.id,
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate(),
      } as ProductInventory;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

// Create or update product
export async function saveProduct(product: Omit<ProductInventory, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const existingProduct = await getDoc(productRef);
    
    if (existingProduct.exists()) {
      // Update existing product
      await updateDoc(productRef, {
        ...product,
        updatedAt: new Date(),
      });
    } else {
      // Create new product
      await setDoc(productRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Update stock for a specific size
export async function updateStock(
  productId: string, 
  size: string | undefined, 
  quantity: number
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    
    if (size) {
      // Update specific size stock
      await updateDoc(productRef, {
        [`sizes.${size}`]: increment(quantity),
        updatedAt: new Date(),
      });
    } else {
      // Update general stock for non-shoe items
      await updateDoc(productRef, {
        stock: increment(quantity),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
}

// Check if product/size is in stock
export async function isInStock(productId: string, size?: string): Promise<boolean> {
  try {
    const product = await getProduct(productId);
    if (!product) return false;
    
    if (size && product.sizes) {
      return (product.sizes[size] || 0) > 0;
    } else if (product.stock !== undefined) {
      return product.stock > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking stock:', error);
    return false;
  }
}

// Get stock quantity
export async function getStockQuantity(productId: string, size?: string): Promise<number> {
  try {
    const product = await getProduct(productId);
    if (!product) return 0;
    
    if (size && product.sizes) {
      return product.sizes[size] || 0;
    } else if (product.stock !== undefined) {
      return product.stock;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting stock quantity:', error);
    return 0;
  }
}

// Initialize products (seed data) - only for first time setup
export async function initializeProducts(): Promise<void> {
  const initialProducts: Omit<ProductInventory, 'createdAt' | 'updatedAt'>[] = [
    // Shoes
    {
      id: 'nomatch-classic',
      name: 'NoMatch Classic',
      price: '$170',
      sku: '01-001-M-WL',
      category: 'Shoes',
      description: 'Your everyday pair, with a twist.',
      details: 'Handcrafted in 100% leather, the Classic sneaker features clean lines, a soft leather lining, and 100% rubber soles for all-day comfort. A stitched X-heart embroidery on the toe adds a playful touch, while our signature mismatched soles make it unmistakably NoMatch.',
      images: [
        'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 10, '6.5': 12, '7': 15, '7.5': 15, '8': 20, '8.5': 18, '9': 20, '9.5': 18, '10': 15, '10.5': 12, '11': 10 },
    },
    {
      id: 'bloom-color-changing',
      name: 'Bloom (Color Changing)',
      price: '$230',
      sku: '01-002-M-BL',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 8, '6.5': 10, '7': 12, '7.5': 12, '8': 15, '8.5': 14, '9': 18, '9.5': 16, '10': 12, '10.5': 10, '11': 8 },
    },
    {
      id: 'bloom-silver',
      name: 'Bloom Silver (Color Changing)',
      price: '$240',
      sku: '01-003-M-BS',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 6, '6.5': 8, '7': 10, '7.5': 10, '8': 12, '8.5': 12, '9': 15, '9.5': 14, '10': 10, '10.5': 8, '11': 6 },
    },
    {
      id: 'daisy-dream-silver',
      name: 'Daisy Dream Silver (Color Changing)',
      price: '$240',
      sku: '01-004-M-DS',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 7, '6.5': 9, '7': 11, '7.5': 11, '8': 14, '8.5': 13, '9': 16, '9.5': 15, '10': 11, '10.5': 9, '11': 7 },
    },
    {
      id: 'daisy-dream',
      name: 'Daisy Dream (Color Changing)',
      price: '$230',
      sku: '01-005-M-DD',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 9, '6.5': 11, '7': 13, '7.5': 13, '8': 16, '8.5': 15, '9': 18, '9.5': 17, '10': 13, '10.5': 11, '11': 9 },
    },
    {
      id: 'floral-snake',
      name: 'Floral Snake',
      price: '$220',
      sku: '01-006-M-FS',
      category: 'Shoes',
      description: 'Classic shape, with details that don\'t match on purpose.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for everyday comfort, and mismatched embroidery with our signature mismatched soles—designed to feel special with every step.',
      images: [
        'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 8, '6.5': 10, '7': 12, '7.5': 12, '8': 15, '8.5': 14, '9': 17, '9.5': 16, '10': 12, '10.5': 10, '11': 8 },
    },
    {
      id: 'graffiti',
      name: 'Graffiti',
      price: '$220',
      sku: '01-007-M-GR',
      category: 'Shoes',
      description: 'Classic shape, with details that don\'t match on purpose.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for everyday comfort, and mismatched embroidery with our signature mismatched soles—designed to feel special with every step.',
      images: [
        'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 10, '6.5': 12, '7': 14, '7.5': 14, '8': 18, '8.5': 17, '9': 20, '9.5': 19, '10': 14, '10.5': 12, '11': 10 },
    },
    {
      id: 'graffiti-color-changing',
      name: 'Graffiti (Color Changing)',
      price: '$230',
      sku: '01-008-M-GC',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/3076787/pexels-photo-3076787.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3189024/pexels-photo-3189024.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 7, '6.5': 9, '7': 11, '7.5': 11, '8': 14, '8.5': 13, '9': 16, '9.5': 15, '10': 11, '10.5': 9, '11': 7 },
    },
    {
      id: 'graffiti-silver',
      name: 'Graffiti Silver',
      price: '$240',
      sku: '01-009-M-GS',
      category: 'Shoes',
      description: 'Classic shape, with details that don\'t match on purpose.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for everyday comfort, and mismatched embroidery with our signature mismatched soles—designed to feel special with every step.',
      images: [
        'https://images.pexels.com/photos/2300333/pexels-photo-2300333.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 6, '6.5': 7, '7': 9, '7.5': 9, '8': 12, '8.5': 11, '9': 14, '9.5': 13, '10': 9, '10.5': 7, '11': 6 },
    },
    {
      id: 'monogram-bold',
      name: 'Monogram Bold',
      price: '$220',
      sku: '01-010-M-MB',
      category: 'Shoes',
      description: 'Classic shape, with details that don\'t match on purpose.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for everyday comfort, and mismatched embroidery with our signature mismatched soles—designed to feel special with every step.',
      images: [
        'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1456713/pexels-photo-1456713.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 9, '6.5': 11, '7': 13, '7.5': 13, '8': 16, '8.5': 15, '9': 18, '9.5': 17, '10': 13, '10.5': 11, '11': 9 },
    },
    {
      id: 'monogram-metallic',
      name: 'Monogram Metallic (Color Changing)',
      price: '$230',
      sku: '01-011-M-MM',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2300335/pexels-photo-2300335.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 7, '6.5': 9, '7': 11, '7.5': 11, '8': 14, '8.5': 13, '9': 16, '9.5': 15, '10': 11, '10.5': 9, '11': 7 },
    },
    {
      id: 'good-luck',
      name: 'Good Luck',
      price: '$220',
      sku: '01-012-M-GL',
      category: 'Shoes',
      description: 'Classic shape, with details that don\'t match on purpose.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for everyday comfort, and mismatched embroidery with our signature mismatched soles—designed to feel special with every step.',
      images: [
        'https://images.pexels.com/photos/2529153/pexels-photo-2529153.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1456715/pexels-photo-1456715.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 10, '6.5': 12, '7': 14, '7.5': 14, '8': 17, '8.5': 16, '9': 19, '9.5': 18, '10': 14, '10.5': 12, '11': 10 },
    },
    {
      id: 'xoxo-color-changing',
      name: 'XOXO (Color Changing)',
      price: '$240',
      sku: '01-013-M-XO',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 6, '6.5': 8, '7': 10, '7.5': 10, '8': 13, '8.5': 12, '9': 15, '9.5': 14, '10': 10, '10.5': 8, '11': 6 },
    },
    {
      id: 'graffiti-pink',
      name: 'Graffiti Pink',
      price: '$240',
      sku: '01-014-M-GP',
      category: 'Shoes',
      description: 'Classic shape, with details that don\'t match on purpose.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for everyday comfort, and mismatched embroidery with our signature mismatched soles—designed to feel special with every step.',
      images: [
        'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 8, '6.5': 10, '7': 12, '7.5': 12, '8': 15, '8.5': 14, '9': 17, '9.5': 16, '10': 12, '10.5': 10, '11': 8 },
    },
    {
      id: 'love-color-changing',
      name: 'LOVE (Color Changing)',
      price: '$230',
      sku: '01-015-M-LV',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 9, '6.5': 11, '7': 13, '7.5': 13, '8': 16, '8.5': 15, '9': 18, '9.5': 17, '10': 13, '10.5': 11, '11': 9 },
    },
    {
      id: 'text-me-color-changing',
      name: 'Text Me (Color Changing)',
      price: '$230',
      sku: '01-016-M-TM',
      category: 'Shoes',
      description: 'Built like a classic. Designed to surprise.',
      details: 'Handcrafted in 100% premium leather, this style features a smooth leather lining, durable rubber soles for all-day comfort, UV-activated embroidery that changes in the sun, and our signature mismatched soles—an everyday pair with an unexpected twist.',
      images: [
        'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 7, '6.5': 9, '7': 11, '7.5': 11, '8': 14, '8.5': 13, '9': 16, '9.5': 15, '10': 11, '10.5': 9, '11': 7 },
    },
    {
      id: 'pillow-wedge-limited',
      name: 'Pillow Wedge – Limited Edition',
      price: '$250',
      sku: '01-017-M-PW',
      category: 'Shoes',
      description: 'Walk on sparkle. Float on comfort.',
      details: 'Premium silver raffia wedge with mismatched leather straps. Handmade in Italy.',
      images: [
        'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: { '6': 5, '6.5': 6, '7': 8, '7.5': 8, '8': 10, '8.5': 9, '9': 12, '9.5': 11, '10': 8, '10.5': 6, '11': 5 },
    },
    // Accessories
    {
      id: 'gold-signature-charm',
      name: 'Gold Signature Charm',
      price: '$20',
      sku: 'A06GD',
      category: 'Accessories',
      categories: ['Accessories', 'Charm'],
      description: 'Stainless steel charms plated in gold and silver.',
      details: 'Add them to your sneakers, necklace, or bracelet for a personalized NoMatch touch.',
      material: '100% Stainless Steel',
      finish: 'Gold or Silver Plated',
      features: 'Waterproof and durable',
      compatibility: 'Perfect fit for NoMatch sneakers',
      images: [
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      stock: 50,
    },
    {
      id: 'silver-signature-charm',
      name: 'Silver Signature Charm',
      price: '$15',
      sku: 'A06SL',
      category: 'Accessories',
      categories: ['Accessories', 'Charm'],
      description: 'Stainless steel charms plated in silver.',
      details: 'Add them to your sneakers, necklace, or bracelet for a personalized NoMatch touch.',
      material: '100% Stainless Steel',
      finish: 'Silver Plated',
      features: 'Waterproof and durable',
      compatibility: 'Perfect fit for NoMatch sneakers',
      images: [
        'https://images.pexels.com/photos/1457843/pexels-photo-1457843.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1457840/pexels-photo-1457840.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      stock: 50,
    },
    // Clothing
    {
      id: 'bloom-cap-pink',
      name: 'Bloom UV-Activated Cap in Light Pink',
      price: '$38',
      sku: 'CAP-BLM-PK',
      category: 'Clothing',
      description: 'A cap that blooms in the sun.',
      details: 'The Bloom UV-Activated Cap in Light Pink features soft, flexible fabric, premium embroidery, and color-changing flowers that shift from white to pink — unique, sporty, and perfectly NoMatch.',
      images: [
        'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      stock: 30,
    },
    {
      id: 'daisy-cap-yellow',
      name: 'Daisy Dreams UV Activated Cap in Yellow',
      price: '$38',
      sku: 'CAP-DSY-YL',
      category: 'Clothing',
      description: 'Watch your daisies come to life in the sun.',
      details: 'The Daisys UV-Activated Cap in Yellow features soft, flexible fabric, premium embroidery, and color-changing details that appear in sunlight — sporty, playful, and perfectly NoMatch.',
      images: [
        'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/984620/pexels-photo-984620.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      stock: 28,
    },
    {
      id: 'signature-cap-dark-pink',
      name: 'Signature "Made to NoMatch" UV-Activated Cap in Dark Pink',
      price: '$38',
      sku: 'CAP-SIG-DPK',
      category: 'Clothing',
      description: 'Stand out in our Signature "Made to NoMatch" UV-Activated Cap in Dark Pink.',
      details: 'Featuring color-changing embroidery and our Made to NoMatch slogan on the side — soft, sporty, and perfectly you.',
      images: [
        'https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1124467/pexels-photo-1124467.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      stock: 25,
    },
    {
      id: 'xoxo-cap-purple',
      name: 'XOXO UV-Activated Cap in Purple',
      price: '$38',
      sku: 'CAP-XO-PUR',
      category: 'Clothing',
      description: 'Step outside and watch the magic happen.',
      details: 'The XOXO UV-Activated Cap in Purple features color-changing embroidery that shifts from white details to bright pinks and purples — soft, sporty, and perfectly matched to your NoMatch sneakers.',
      images: [
        'https://images.pexels.com/photos/1646647/pexels-photo-1646647.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1646648/pexels-photo-1646648.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      stock: 22,
    },
    {
      id: 'graffiti-hoodie',
      name: 'NoMatch Graffiti Hoodie',
      price: '$60',
      sku: 'HOD-GRF',
      category: 'Clothing',
      subcategory: 'Hoodie',
      description: 'Stand out in comfort.',
      details: 'This 100% cotton hoodie features our signature graffiti puff print sleeve—bold, playful, and unmistakably NoMatch.',
      images: [
        'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: {
        'XS': 5,
        'S': 8,
        'M': 10,
        'L': 7,
      },
    },
    {
      id: 'pink-signature-hoodie',
      name: 'NoMatch Pink Signature Hoodie',
      price: '$60',
      sku: 'HOD-SIG-PK',
      category: 'Clothing',
      subcategory: 'Hoodie',
      description: 'The iconic pink signature hoodie—where comfort meets statement style.',
      details: 'Made to match your sneakers (or not).',
      images: [
        'https://images.pexels.com/photos/3755708/pexels-photo-3755708.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3755709/pexels-photo-3755709.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      sizes: {
        'XS': 4,
        'S': 7,
        'M': 9,
        'L': 6,
      },
    },
  ];

  try {
    // First, delete all existing products to remove old/fake ones
    console.log('Deleting old products...');
    const existingProducts = await getAllProducts();
    for (const product of existingProducts) {
      await deleteProduct(product.id);
    }
    console.log(`Deleted ${existingProducts.length} old products`);
    
    // Then add all new products
    console.log('Adding new products...');
    for (const product of initialProducts) {
      await saveProduct(product);
    }
    console.log(`Products initialized successfully: ${initialProducts.length} products added`);
  } catch (error) {
    console.error('Error initializing products:', error);
    throw error;
  }
}

