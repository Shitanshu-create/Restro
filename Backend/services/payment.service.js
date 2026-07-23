import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../config/env.js";

const razorpayInstance = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret
});

async function createRazorpayOrder(amount, receipt, notes = {}) {
    const orderOptions = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        notes
    };
    return await razorpayInstance.orders.create(orderOptions);
}

function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", env.razorpay.keySecret)
        .update(body)
        .digest("hex");
    return expectedSignature === razorpaySignature;
}

function verifyWebhookSignature(rawBody, signatureHeader) {
    const expectedSignature = crypto
        .createHmac("sha256", env.razorpay.webhookSecret)
        .update(rawBody)
        .digest("hex");
    return expectedSignature === signatureHeader;
}

export default {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature
};
