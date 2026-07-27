import { OrderModel } from "../models/order.model.js";
import paymentService from "../services/payment.service.js";
import env from "../config/env.js";
/**
 * @desc    Initiate Razorpay Payment for an existing order
 * @route   POST /api/payment/initiate
 * @access  Private (Customer session required)
 */
async function initiatePaymentController(req, res, next) {
    try {
        const { customerId } = req.customer;
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "Please provide orderId" });
        }
        const order = await OrderModel.findOne({ orderId: Number(orderId) });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.customerId !== customerId) {
            return res.status(403).json({ message: "You are not authorized to pay for this order" });
        }
        if (order.paymentStatus === "Paid") {
            return res.status(400).json({ message: "Order has already been paid" });
        }
        if (order.paymentMode !== "Online" && order.paymentMode !== "UPI") {
            return res.status(400).json({ message: "This order is not configured for online payment" });
        }
        // Return existing Razorpay Order if already created
        if (order.razorpayOrderId) {
            return res.status(200).json({
                success: true,
                razorpayOrderId: order.razorpayOrderId,
                amount: Math.round(order.amount * 100), // in paise
                currency: "INR",
                razorpayKeyId: env.razorpay.keyId
            });
        }
        // Create new Razorpay order
        const receipt = `rcpt_${order.orderId}`;
        const razorpayOrder = await paymentService.createRazorpayOrder(order.amount, receipt, {
            orderId: order.orderId,
            customerId: order.customerId,
            tableNo: order.tableNo
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
        res.status(200).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount, // in paise
            currency: razorpayOrder.currency,
            razorpayKeyId: env.razorpay.keyId
        });
    } catch (error) {
        next(error);
    }
}
/**
 * @desc    Verify Razorpay Client Payment Signature
 * @route   POST /api/payment/verify
 * @access  Private (Customer session required)
 */
async function verifyPaymentController(req, res, next) {
    try {
        const { customerId } = req.customer;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment verification parameters" });
        }
        // Verify HMAC-SHA256 signature
        const isValid = paymentService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );
        if (!isValid) {
            return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
        }
        const order = await OrderModel.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return res.status(404).json({ message: "Order associated with this payment was not found" });
        }
        if (order.customerId !== customerId) {
            return res.status(403).json({ message: "You are not authorized for this order" });
        }
        order.paymentStatus = "Paid";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
        res.status(200).json({
            success: true,
            message: "Payment verified and recorded successfully",
            paymentStatus: order.paymentStatus,
            orderId: order.orderId
        });
    } catch (error) {
        next(error);
    }
}
/**
 * @desc    Razorpay Webhook Handler (Asynchronous payment confirmation)
 * @route   POST /api/payment/webhook
 * @access  Public (Called by Razorpay server)
 */
async function paymentWebhookController(req, res, next) {
    try {
        const signatureHeader = req.headers["x-razorpay-signature"];
        if (!signatureHeader) {
            return res.status(400).json({ message: "Missing Razorpay signature header" });
        }
        const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
        const isValid = paymentService.verifyWebhookSignature(rawBody, signatureHeader);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }
        const payload = JSON.parse(rawBody.toString("utf8"));
        const event = payload.event;
        if (event === "payment.captured") {
            const paymentEntity = payload.payload?.payment?.entity;
            const razorpayOrderId = paymentEntity?.order_id;
            const razorpayPaymentId = paymentEntity?.id;
            if (razorpayOrderId) {
                const order = await OrderModel.findOne({ razorpayOrderId });
                if (order) {
                    order.paymentStatus = "Paid";
                    order.razorpayPaymentId = razorpayPaymentId;
                    await order.save();
                }
            }
        } else if (event === "payment.failed") {
            const paymentEntity = payload.payload?.payment?.entity;
            const razorpayOrderId = paymentEntity?.order_id;
            if (razorpayOrderId) {
                const order = await OrderModel.findOne({ razorpayOrderId });
                if (order && order.paymentStatus !== "Paid") {
                    order.paymentStatus = "Failed";
                    await order.save();
                }
            }
        }
        // Acknowledge webhook reception to Razorpay
        res.status(200).json({ status: "ok" });
    } catch (error) {
        next(error);
    }
}
/**
 * @desc    Mark Cash Order as Paid (Staff action)
 * @route   PATCH /api/payment/markCashPaid/:orderId
 * @access  Private (Staff session required)
 */
async function markCashPaidController(req, res, next) {
    try {
        const { orderId } = req.params;
        const staffId = req.user?.name || req.user?.staffId || "Staff";
        if (!orderId) {
            return res.status(400).json({ message: "Please provide orderId" });
        }
        const order = await OrderModel.findOne({ orderId: Number(orderId) });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.paymentStatus === "Paid") {
            return res.status(400).json({ message: "Order is already marked as Paid" });
        }
        order.paymentStatus = "Paid";
        order.paidBy = staffId;
        order.paidAt = new Date();
        await order.save();
        res.status(200).json({
            success: true,
            message: "Order marked as Paid successfully",
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
            paidBy: order.paidBy,
            paidAt: order.paidAt
        });
    } catch (error) {
        next(error);
    }
}
export default {
    initiatePaymentController,
    verifyPaymentController,
    paymentWebhookController,
    markCashPaidController
};