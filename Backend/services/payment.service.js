import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../config/env.js";

/**
 * Initialize Razorpay instance safely
 */
function getRazorpayInstance() {
    if (!env.razorpay.keyId || !env.razorpay.keySecret) {
        return null;
    }
    return new Razorpay({
        key_id: env.razorpay.keyId,
        key_secret: env.razorpay.keySecret,
    });
}




/**
 * Create a Razorpay Order
 * @param {number} amountInRupees Amount in INR (will be converted to paise)
 * @param {string} receipt Unique receipt ID
 * @param {object} notes Additional metadata/notes
 */
async function createRazorpayOrder(amountInRupees, receipt, notes = {}) {
    const instance = getRazorpayInstance();

    // Dev fallback if keys are missing
    if (!instance) {
        console.log(`\n--- [RAZORPAY DEV MOCK ORDER] ---`);
        console.log(`Amount: INR ${amountInRupees} (${Math.round(amountInRupees * 100)} paise)`);
        console.log(`Receipt: ${receipt}`);
        console.log(`Notes:`, notes);
        console.log(`---------------------------------\n`);
        return {
            id: `order_mock_${Date.now()}`,
            entity: "order",
            amount: Math.round(amountInRupees * 100),
            amount_paid: 0,
            amount_due: Math.round(amountInRupees * 100),
            currency: "INR",
            receipt: String(receipt),
            status: "created",
            attempts: 0,
            notes: notes,
            created_at: Math.floor(Date.now() / 1000)
        };
    }

    const options = {
        amount: Math.round(amountInRupees * 100), // Amount in paise
        currency: "INR",
        receipt: String(receipt),
        notes: notes
    };

    return await instance.orders.create(options);
}




/**
 * Verify client payment signature (HMAC-SHA256 of razorpay_order_id + "|" + razorpay_payment_id)
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
    if (!env.razorpay.keySecret) {
        // Dev fallback if keys are missing
        console.warn("RAZORPAY_KEY_SECRET is not set. Skipping signature verification in DEV mode.");
        return true;
    }

    const hmac = crypto.createHmac("sha256", env.razorpay.keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature.length !== signature.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signature)
    );
}





/**
 * Verify Razorpay Webhook signature (HMAC-SHA256 of raw request body)
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
    if (!env.razorpay.webhookSecret) {
        console.warn("RAZORPAY_WEBHOOK_SECRET is not set. Skipping webhook signature verification.");
        return true;
    }

    const hmac = crypto.createHmac("sha256", env.razorpay.webhookSecret);
    hmac.update(rawBody);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature.length !== signatureHeader.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signatureHeader)
    );
}




export default {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature
};