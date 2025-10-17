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
exports.deleteCoupon = exports.listCoupons = exports.createCoupon = void 0;
const functions = __importStar(require("firebase-functions"));
const https_1 = require("firebase-functions/v2/https");
const stripe_1 = __importDefault(require("stripe"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
});
// Create a new coupon
exports.createCoupon = (0, https_1.onCall)({ cors: true }, async (request) => {
    const data = request.data;
    const context = request;
    // Check if user is authenticated (admin)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const code = data.code;
    const type = data.type;
    const value = data.value;
    const duration = data.duration;
    const maxRedemptions = data.maxRedemptions;
    const expiresAt = data.expiresAt;
    try {
        const couponParams = {
            id: code.toUpperCase(),
            duration: (duration || 'once'),
        };
        if (type === 'percent') {
            couponParams.percent_off = value;
        }
        else if (type === 'amount') {
            couponParams.amount_off = Math.round(value * 100); // Convert to cents
            couponParams.currency = 'usd';
        }
        if (maxRedemptions) {
            couponParams.max_redemptions = maxRedemptions;
        }
        if (expiresAt) {
            couponParams.redeem_by = Math.floor(expiresAt / 1000); // Convert to Unix timestamp
        }
        const coupon = await stripe.coupons.create(couponParams);
        return {
            success: true,
            coupon: {
                id: coupon.id,
                percent_off: coupon.percent_off,
                amount_off: coupon.amount_off,
                currency: coupon.currency,
                valid: coupon.valid,
                max_redemptions: coupon.max_redemptions,
                times_redeemed: coupon.times_redeemed,
                redeem_by: coupon.redeem_by,
            },
        };
    }
    catch (error) {
        console.error('Error creating coupon:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// List all coupons
exports.listCoupons = (0, https_1.onCall)({ cors: true }, async (request) => {
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    try {
        const coupons = await stripe.coupons.list({ limit: 100 });
        return {
            coupons: coupons.data.map(c => ({
                id: c.id,
                percent_off: c.percent_off,
                amount_off: c.amount_off,
                currency: c.currency,
                valid: c.valid,
                max_redemptions: c.max_redemptions,
                times_redeemed: c.times_redeemed,
                redeem_by: c.redeem_by,
                created: c.created,
            })),
        };
    }
    catch (error) {
        console.error('Error listing coupons:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// Delete a coupon
exports.deleteCoupon = (0, https_1.onCall)({ cors: true }, async (request) => {
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const couponId = data.couponId;
    try {
        await stripe.coupons.del(couponId);
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting coupon:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=coupons.js.map