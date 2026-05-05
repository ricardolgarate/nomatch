import Stripe from 'stripe';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

let dbInstance;

function parseServiceAccount() {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT;

  if (raw) {
    const json = raw.trim().startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(json);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    return serviceAccount;
  }

  if (
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID)
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  throw new Error(
    'Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_KEY to the deployment environment.',
  );
}

function getDb() {
  if (dbInstance) return dbInstance;

  const app = getApps().length > 0 ? getApps()[0] : initializeApp({
    credential: cert(parseServiceAccount()),
  });
  dbInstance = getFirestore(app);
  dbInstance.settings({ ignoreUndefinedProperties: true });
  return dbInstance;
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to the deployment environment.');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `BFAB-${year}${month}${day}-${random}`;
}

function parsePriceToCents(value) {
  const amount = Number.parseFloat(String(value || '').replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid product price: ${value}`);
  }
  return Math.round(amount * 100);
}

function centsToPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error('Cart contains an invalid quantity.');
  }
  return quantity;
}

function normalizeCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const byLine = new Map();
  for (const item of items) {
    const id = String(item?.id || '').trim();
    if (!id) throw new Error('Cart contains an invalid product.');

    const size = item?.size ? String(item.size) : undefined;
    const key = `${id}:${size || ''}`;
    const quantity = normalizeQuantity(item?.quantity);
    const existing = byLine.get(key);
    byLine.set(key, {
      id,
      size,
      quantity: (existing?.quantity || 0) + quantity,
    });
  }

  return Array.from(byLine.values());
}

function normalizeCustomer(customer) {
  const normalized = {
    email: String(customer?.email || '').trim(),
    firstName: String(customer?.firstName || '').trim(),
    lastName: String(customer?.lastName || '').trim(),
    address: String(customer?.address || '').trim(),
    apartment: String(customer?.apartment || '').trim() || undefined,
    city: String(customer?.city || '').trim(),
    state: String(customer?.state || '').trim(),
    zipCode: String(customer?.zipCode || '').trim(),
    phone: String(customer?.phone || '').trim() || undefined,
    country: String(customer?.country || '').trim() || 'United States (US)',
    orderNote: String(customer?.orderNote || '').trim() || undefined,
  };

  if (
    !normalized.email ||
    !normalized.firstName ||
    !normalized.lastName ||
    !normalized.address ||
    !normalized.city ||
    !normalized.state ||
    !normalized.zipCode
  ) {
    throw new Error('Please complete the contact and shipping fields.');
  }

  return normalized;
}

function validStripeImages(images) {
  return Array.isArray(images)
    ? images.filter((url) => /^https?:\/\//.test(String(url))).slice(0, 1)
    : [];
}

async function getProduct(productId) {
  const snap = await getDb().collection('products').doc(productId).get();
  if (!snap.exists) {
    throw new Error('A product in your cart is no longer available.');
  }
  return { id: snap.id, ...snap.data() };
}

function assertStock(product, cartItem) {
  if (cartItem.size) {
    const stock = Number(product.sizes?.[cartItem.size] || 0);
    if (stock < cartItem.quantity) {
      throw new Error(`${product.name} in size ${cartItem.size} does not have enough stock.`);
    }
    return;
  }

  const stock = Number(product.stock || 0);
  if (stock < cartItem.quantity) {
    throw new Error(`${product.name} does not have enough stock.`);
  }
}

async function buildCheckoutOrder(cartItems, customer, orderNumber) {
  const lineItems = [];
  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cartItems) {
    const product = await getProduct(cartItem.id);
    assertStock(product, cartItem);

    const unitAmount = parsePriceToCents(product.price);
    subtotal += unitAmount * cartItem.quantity;

    const productName = cartItem.size ? `${product.name} - Size ${cartItem.size}` : product.name;
    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: unitAmount,
        product_data: {
          name: productName,
          images: validStripeImages(product.images),
          metadata: {
            productId: product.id,
            ...(cartItem.size ? { size: cartItem.size } : {}),
          },
        },
      },
      quantity: cartItem.quantity,
    });

    orderItems.push({
      id: product.id,
      name: product.name,
      price: centsToPrice(unitAmount),
      image: Array.isArray(product.images) ? product.images[0] : '',
      quantity: cartItem.quantity,
      size: cartItem.size,
      category: String(product.category || 'Other'),
    });
  }

  const shipping = 0;
  const total = subtotal + shipping;

  return {
    stripeLineItems: lineItems,
    order: {
      id: orderNumber,
      orderNumber,
      items: orderItems,
      customer,
      subtotal: subtotal / 100,
      shipping: shipping / 100,
      total: total / 100,
      status: 'new',
      paymentStatus: 'pending',
    },
  };
}

export async function createCheckoutSession({ body, siteUrl }) {
  const stripe = getStripe();
  const cartItems = normalizeCartItems(body?.items);
  const customer = normalizeCustomer(body?.customer);
  const orderNumber = String(body?.orderNumber || generateOrderNumber());
  const { stripeLineItems, order } = await buildCheckoutOrder(cartItems, customer, orderNumber);

  const successPath = new URL('/checkout/success', siteUrl).toString();
  const cancelPath = new URL('/checkout', siteUrl).toString();
  const successUrl = `${successPath}?order=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${cancelPath}?order=${encodeURIComponent(orderNumber)}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customer.email,
    line_items: stripeLineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderNumber,
    },
    payment_intent_data: {
      metadata: {
        orderNumber,
      },
    },
  });

  await getDb()
    .collection('orders')
    .doc(orderNumber)
    .set(
      {
        ...order,
        stripeCheckoutSessionId: session.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return { url: session.url, orderNumber };
}

async function markOrderPaid(orderNumber, session) {
  const orderRef = getDb().collection('orders').doc(orderNumber);

  await getDb().runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists) return;

    const order = orderSnap.data();
    if (order.stockAdjusted) {
      transaction.set(
        orderRef,
        {
          paymentStatus: 'paid',
          status: order.status === 'new' ? 'processing' : order.status,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
          paidAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return;
    }

    for (const item of order.items || []) {
      const productRef = getDb().collection('products').doc(item.id);
      const quantity = -Math.abs(Number(item.quantity || 0));
      if (quantity === 0) continue;

      if (item.size) {
        transaction.update(productRef, {
          [`sizes.${item.size}`]: FieldValue.increment(quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        transaction.update(productRef, {
          stock: FieldValue.increment(quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    transaction.set(
      orderRef,
      {
        paymentStatus: 'paid',
        status: order.status === 'new' ? 'processing' : order.status,
        stockAdjusted: true,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export async function handleStripeWebhook({ rawBody, signature }) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured.');
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object;
    const orderNumber = session.metadata?.orderNumber;
    if (orderNumber) {
      await markOrderPaid(orderNumber, session);
    }
  }

  return { received: true };
}
