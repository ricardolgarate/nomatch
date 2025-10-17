"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.validateCoupon = exports.createCheckoutSession = exports.deleteCoupon = exports.listCoupons = exports.createCoupon = void 0;
const functions = __importStar(require("firebase-functions"));
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
// Export coupon management functions
var coupons_1 = require("./coupons");
Object.defineProperty(exports, "createCoupon", { enumerable: true, get: function () { return coupons_1.createCoupon; } });
Object.defineProperty(exports, "listCoupons", { enumerable: true, get: function () { return coupons_1.listCoupons; } });
Object.defineProperty(exports, "deleteCoupon", { enumerable: true, get: function () { return coupons_1.deleteCoupon; } });
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Initialize Stripe
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
});
// Email transporter
const getEmailTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};
// ============================================
// 1. CREATE CHECKOUT SESSION
// ============================================
exports.createCheckoutSession = (0, https_1.onCall)({ cors: true }, async (request) => {
    const data = request.data;
    const items = data.items;
    const couponCode = data.couponCode;
    const customerEmail = data.customerEmail;
    try {
        // Convert cart items to Stripe line items
        const lineItems = items.map((item) => {
            const unitAmount = Math.round(parseFloat(item.price.replace('$', '')) * 100);
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.size ? `Size: ${item.size}` : undefined,
                        images: [item.image],
                        metadata: {
                            product_id: item.id,
                            category: item.category,
                            size: item.size || '',
                        },
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });
        // Create checkout session parameters
        const sessionParams = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.WEBSITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.WEBSITE_URL}/checkout`,
            customer_email: customerEmail,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'usd',
                        },
                        display_name: 'Free Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 3 },
                            maximum: { unit: 'business_day', value: 5 },
                        },
                    },
                },
            ],
            metadata: {
                items: JSON.stringify(items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    size: item.size,
                }))),
            },
        };
        // Add coupon if provided
        if (couponCode) {
            try {
                const coupon = await stripe.coupons.retrieve(couponCode);
                if (coupon.valid) {
                    sessionParams.discounts = [{ coupon: couponCode }];
                }
            }
            catch (error) {
                console.log('Invalid coupon code:', couponCode);
            }
        }
        // Create the checkout session
        const session = await stripe.checkout.sessions.create(sessionParams);
        return { sessionId: session.id, url: session.url };
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
    }
});
// ============================================
// 2. VALIDATE COUPON
// ============================================
exports.validateCoupon = (0, https_1.onCall)({ cors: true }, async (request) => {
    const data = request.data;
    const code = data.code;
    if (!code) {
        throw new functions.https.HttpsError('invalid-argument', 'Coupon code is required');
    }
    try {
        const coupon = await stripe.coupons.retrieve(code);
        return {
            id: coupon.id,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            currency: coupon.currency,
            valid: coupon.valid,
            max_redemptions: coupon.max_redemptions,
            times_redeemed: coupon.times_redeemed,
        };
    }
    catch (error) {
        return { valid: false, error: 'Invalid coupon code' };
    }
});
// ============================================
// 3. STRIPE WEBHOOK HANDLER
// ============================================
exports.stripeWebhook = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});
// Handle successful checkout
async function handleCheckoutCompleted(session) {
    var _a, _b, _c, _d, _e, _f, _g;
    console.log('Checkout completed:', session.id);
    try {
        const items = JSON.parse(((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.items) || '[]');
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Create order in Firestore
        await db.collection('orders').doc(orderId).set({
            stripeSessionId: session.id,
            customerEmail: ((_b = session.customer_details) === null || _b === void 0 ? void 0 : _b.email) || '',
            customerName: ((_c = session.customer_details) === null || _c === void 0 ? void 0 : _c.name) || null,
            items: items,
            subtotal: (session.amount_subtotal || 0) / 100,
            discount: ((_d = session.total_details) === null || _d === void 0 ? void 0 : _d.amount_discount) ? (session.total_details.amount_discount / 100) : null,
            total: (session.amount_total || 0) / 100,
            paymentStatus: 'succeeded',
            fulfillmentStatus: 'pending',
            shippingAddress: ((_e = session.shipping_details) === null || _e === void 0 ? void 0 : _e.address) || null,
            emailSent: false,
            invoiceGenerated: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update inventory
        for (const item of items) {
            const productRef = db.collection('products').doc(item.id);
            const productSnap = await productRef.get();
            if (productSnap.exists) {
                if (item.size) {
                    await productRef.update({
                        [`sizes.${item.size}`]: admin.firestore.FieldValue.increment(-item.quantity),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    // Check updated stock
                    const updated = await productRef.get();
                    const newStock = ((_g = (_f = updated.data()) === null || _f === void 0 ? void 0 : _f.sizes) === null || _g === void 0 ? void 0 : _g[item.size]) || 0;
                    // Send low stock alert
                    if (newStock <= 5 && newStock > 0) {
                        await sendLowInventoryAlert(item.id, item.name, newStock, item.size);
                    }
                }
                else {
                    await productRef.update({
                        stock: admin.firestore.FieldValue.increment(-item.quantity),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }
        }
        // Send order confirmation email
        await sendOrderConfirmationEmail(orderId, session, items);
        // Mark email as sent
        await db.collection('orders').doc(orderId).update({
            emailSent: true,
            invoiceGenerated: true,
        });
        console.log('Order processing completed:', orderId);
    }
    catch (error) {
        console.error('Error processing checkout:', error);
        // Send admin alert
        await sendAdminErrorAlert(session, error);
    }
}
// Handle failed payment
async function handlePaymentFailed(paymentIntent) {
    var _a, _b, _c;
    console.log('Payment failed:', paymentIntent.id);
    try {
        const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
        });
        if (sessions.data.length > 0) {
            const session = sessions.data[0];
            const items = JSON.parse(((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.items) || '[]');
            const orderId = `FAILED-${Date.now()}`;
            // Create failed order record
            await db.collection('orders').doc(orderId).set({
                stripeSessionId: session.id,
                stripePaymentIntentId: paymentIntent.id,
                customerEmail: ((_b = session.customer_details) === null || _b === void 0 ? void 0 : _b.email) || '',
                customerName: ((_c = session.customer_details) === null || _c === void 0 ? void 0 : _c.name) || null,
                items: items,
                subtotal: paymentIntent.amount / 100,
                total: paymentIntent.amount / 100,
                paymentStatus: 'failed',
                fulfillmentStatus: 'cancelled',
                emailSent: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Send failure notifications
            await sendPaymentFailedNotification(session, paymentIntent, items);
            // Update order as email sent
            await db.collection('orders').doc(orderId).update({ emailSent: true });
        }
    }
    catch (error) {
        console.error('Error processing failed payment:', error);
    }
}
// Email helper functions
async function sendOrderConfirmationEmail(orderId, session, items) {
    var _a;
    const transporter = getEmailTransporter();
    const itemsHtml = items.map(item => {
        var _a;
        return `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        ${item.size ? `Size: ${item.size}<br>` : ''}
        Qty: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(parseFloat(((_a = item.price) === null || _a === void 0 ? void 0 : _a.replace('$', '')) || '0') * item.quantity).toFixed(2)}
      </td>
    </tr>
  `;
    }).join('');
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 20px; font-weight: bold; color: #667eea; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Thank You for Your Order!</h1>
      </div>
      <div class="content">
        <p>Your order has been confirmed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <h3>Order Summary:</h3>
        <table>${itemsHtml}</table>
        <p class="total">Total: $${((session.amount_total || 0) / 100).toFixed(2)}</p>
        <p>We'll send you tracking information once your order ships (3-5 business days).</p>
      </div>
    </body>
    </html>
  `;
    if ((_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
        await transporter.sendMail({
            from: `"NoMatch" <${process.env.SMTP_USER}>`,
            to: session.customer_details.email,
            subject: `Order Confirmation - ${orderId}`,
            html: emailHtml,
        });
    }
}
async function sendPaymentFailedNotification(session, paymentIntent, items) {
    var _a, _b, _c, _d;
    const transporter = getEmailTransporter();
    // Email to customer
    if ((_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email) {
        await transporter.sendMail({
            from: `"NoMatch" <${process.env.SMTP_USER}>`,
            to: session.customer_details.email,
            subject: 'Payment Failed - Please Try Again',
            html: `
        <h2>⚠️ Payment Failed</h2>
        <p>We were unable to process your payment.</p>
        <p><strong>Reason:</strong> ${((_b = paymentIntent.last_payment_error) === null || _b === void 0 ? void 0 : _b.message) || 'Unknown error'}</p>
        <p>Your items are still available. <a href="${process.env.WEBSITE_URL}/checkout">Try again</a></p>
      `,
        });
    }
    // Alert admin if high value (over $100)
    if (paymentIntent.amount >= 10000) {
        await transporter.sendMail({
            from: `"NoMatch System" <${functions.config().smtp.user}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 High-Value Payment Failed: $${(paymentIntent.amount / 100).toFixed(2)}`,
            html: `
        <h2>Failed Payment Alert</h2>
        <p><strong>Amount:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
        <p><strong>Customer:</strong> ${(_c = session.customer_details) === null || _c === void 0 ? void 0 : _c.email}</p>
        <p><strong>Error:</strong> ${(_d = paymentIntent.last_payment_error) === null || _d === void 0 ? void 0 : _d.message}</p>
      `,
        });
    }
}
async function sendLowInventoryAlert(productId, productName, stock, size) {
    const transporter = getEmailTransporter();
    await transporter.sendMail({
        from: `"NoMatch Inventory" <${functions.config().smtp.user}>`,
        to: functions.config().admin.email,
        subject: `📦 Low Inventory: ${productName}`,
        html: `
      <h3>Low Stock Alert</h3>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>ID:</strong> ${productId}</p>
      ${size ? `<p><strong>Size:</strong> ${size}</p>` : ''}
      <p><strong>Remaining:</strong> ${stock} units</p>
      <p>Consider restocking soon!</p>
    `,
    });
}
async function sendAdminErrorAlert(session, error) {
    var _a;
    const transporter = getEmailTransporter();
    await transporter.sendMail({
        from: `"NoMatch System" <${functions.config().smtp.user}>`,
        to: functions.config().admin.email,
        subject: '🚨 Order Processing Error',
        html: `
      <h2>Error Processing Order</h2>
      <p><strong>Session ID:</strong> ${session.id}</p>
      <p><strong>Customer:</strong> ${(_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email}</p>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Please check the system logs for more details.</p>
    `,
    });
}
//# sourceMappingURL=index.js.map