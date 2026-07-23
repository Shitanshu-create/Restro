import express from "express";
import customerController from "../controllers/customer.controller.js";
import customerAuth from "../middlewares/customerAuth.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const customerRouter = express.Router();

// Create customer session (scan QR code)
customerRouter.post("/session", async (req, res, next) => {
    try {
        const { tableNo, name } = req.body;
        if (!tableNo) {
            return res.status(400).json({ message: "tableNo is required" });
        }

        const customerId = `C-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const customerName = name || `Guest-${tableNo}`;

        const token = jwt.sign(
            { customerId, tableNo, name: customerName },
            env.jwtSecret,
            { expiresIn: "4h" }
        );

        res.cookie("customerToken", token, {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: env.cookie.sameSite,
            maxAge: 4 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            customerId,
            tableNo,
            name: customerName,
            token
        });
    } catch (error) {
        next(error);
    }
});

customerRouter.post("/placeOrder", customerAuth.verifyCustomerSession, customerController.createOrderController);
customerRouter.get("/myOrders", customerAuth.verifyCustomerSession, customerController.getMyOrdersController);

// Admin routes
customerRouter.get("/allOrders", authMiddleware.verifyAdmin, customerController.getAllOrdersController);
customerRouter.get("/revenueStats", authMiddleware.verifyAdmin, customerController.getRevenueStatsController);

export default customerRouter;
