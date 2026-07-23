import express from "express";
import paymentController from "../controllers/payment.controller.js";
import customerAuth from "../middlewares/customerAuth.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/initiate", customerAuth.verifyCustomerSession, paymentController.initiatePaymentController);
paymentRouter.post("/verify", customerAuth.verifyCustomerSession, paymentController.verifyPaymentController);
paymentRouter.post("/webhook", express.raw({ type: "application/json" }), paymentController.paymentWebhookController);
paymentRouter.patch("/markCashPaid/:orderId", authMiddleware.authUser, paymentController.markCashPaidController);

export default paymentRouter;
