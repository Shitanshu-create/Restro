import express from "express";
import customerController from "../controllers/customer.controller.js";
import customerAuth from "../middlewares/customerAuth.middleware.js";
import { otpIpLimiter, otpPhoneRateLimiter } from "../middlewares/otpRateLimit.middleware.js";



const customerRouter = express.Router();



/**
 * @description Deprecated route to create/fetch a Customer without OTP
 * @route POST /api/customer/createCustomer
 * @access Public
 */
customerRouter.post("/createCustomer", (req, res) => {
    return res.status(403).json({ message: "Direct customer registration is disabled. Please use WhatsApp OTP verification to login." });
});



/**
 * @description Route to resolve QR token to table number
 * @route GET /api/customer/resolveTable
 * @access Public
 */
customerRouter.get("/resolveTable", customerController.resolveTableController);



/**
 * @description Route to send OTP via WhatsApp
 * @route POST /api/customer/sendOtp
 * @access Public
 */
customerRouter.post("/sendOtp", otpIpLimiter, otpPhoneRateLimiter, customerController.sendOtpController);




/**
 * @description Route to verify OTP and login/create customer session
 * @route POST /api/customer/verifyOtp
 * @access Public
 */
customerRouter.post("/verifyOtp", otpIpLimiter, customerController.verifyOtpController);




/**
 * @description Route to create an Order
 * @route POST /api/customer/createOrder
 * @access Private
 */
customerRouter.post("/createOrder", customerAuth.verifyCustomerSession, customerController.createOrderController);




/**
 * @description Route to fetch logged-in customer's orders
 * @route GET /api/customer/myOrders
 * @access Private
 */
customerRouter.get("/myOrders", customerAuth.verifyCustomerSession, customerController.getMyOrdersController);



/**
 * @description Route to log out
 * @route POST /api/customer/logout
 * @access Private
 */
customerRouter.post("/logout", customerAuth.verifyCustomerSession, customerController.logoutCustomerController);



export default customerRouter;