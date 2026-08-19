import jwt from "jsonwebtoken";
import crypto from "crypto";
import { CustomerModel } from "../models/customers.model.js";
import { OrderModel } from "../models/order.model.js";
import tokenBlacklistModel from "../models/blacklist.model.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { customAlphabet } from "nanoid";
import { generateUniqueOrderId } from "../utils/generateOrderID.js";
import env from "../config/env.js";
import otpService from "../services/otp.service.js";
import redisClient from "../config/redis.js";
import paymentService from "../services/payment.service.js";


const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

function generateCustomerId() {
    return nanoid();
}

const customerCookieOptions = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 24 * 60 * 60 * 1000
};

function generateSessionToken(customer) {
    return jwt.sign(
        { customerId: customer.customerId, name: customer.name, phone: customer.phone },
        env.jwtSecret,
        { expiresIn: "24h" }
    );
}




/** 
 * @desc    Deprecated route to create/fetch a Customer without OTP
 * @route   POST /api/customer/createCustomer
 * @access  Public
 */
async function createCustomerController(req, res, next) {
    try {
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ message: "Please provide all necessary fields" });
        }

        const phoneNumber = parsePhoneNumberFromString(phone, "IN");

        if (!phoneNumber || !phoneNumber.isValid()) {
            return res.status(400).json({ message: "Please enter a valid phone no" });
        }

        let customer = await CustomerModel.findOne({ phone: phoneNumber.number });
        let isNewCustomer = false;

        if (!customer) {
            const newCustomerId = generateCustomerId();

            customer = new CustomerModel({
                customerId: newCustomerId,
                name,
                phone: phoneNumber.number,
            });

            await customer.save();
            isNewCustomer = true;
        }

        const token = generateSessionToken(customer);
        res.cookie("customerToken", token, customerCookieOptions);

        res.status(200).json({
            success: true,
            message: isNewCustomer ? "New Customer Created Successfully" : "Welcome back!",
            customer: {
                customer_id: customer.customerId,
                name: customer.name,
                phoneNo: customer.phone,
                orders: customer.orders
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Phone number already registered" });
        }
        next(error);
    }
}




/** 
 * @desc    Create an Order
 * @route   POST /api/customer/createOrder
 * @access  Private (session required)
 */
async function createOrderController(req, res, next) {
    try {
        const { customerId, phone } = req.customer || {};
        const { tableNo, items, paymentStatus, paymentMode } = req.body;

        if (!tableNo || !paymentStatus || !paymentMode) {
            return res.status(400).json({ message: "Please Provide All fields" });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }

        const isCustomerExists = await CustomerModel.findOne({
            $or: [
                ...(customerId ? [{ customerId }] : []),
                ...(phone ? [{ phone }] : [])
            ]
        });

        if (!isCustomerExists) {
            return res.status(401).json({ message: "User does not exist" });
        }

        const activeCustomerId = isCustomerExists.customerId;
        const { MenuItemModel } = await import("../models/menu.model.js");

        let computedAmount = 0;
        const validatedItems = [];

        for (const cartItem of items) {
            const dbItem = await MenuItemModel.findOne({ id: Number(cartItem.itemId) });
            if (!dbItem) {
                return res.status(400).json({ message: `Item ID ${cartItem.itemId} not found` });
            }
            if (!dbItem.isAvailable) {
                return res.status(400).json({ message: `"${dbItem.name}" is currently unavailable` });
            }

            let unitPrice = 0;

            if (dbItem.hasVariants || (Array.isArray(dbItem.variants) && dbItem.variants.length > 0)) {
                if (cartItem.variantPrice !== undefined && cartItem.variantPrice !== null && !isNaN(Number(cartItem.variantPrice))) {
                    unitPrice = Number(cartItem.variantPrice);
                } else if (Array.isArray(dbItem.variants) && dbItem.variants.length > 0) {
                    // Match variant by name if variantPrice wasn't passed directly
                    const matchedVar = dbItem.variants.find(v => v.name === cartItem.quantity);
                    unitPrice = matchedVar ? matchedVar.price : dbItem.variants[0].price;
                } else {
                    return res.status(400).json({ message: `Please select a portion size for "${dbItem.name}"` });
                }
            } else {
                unitPrice = Number(dbItem.price || 0);
                if (cartItem.quantity === "Half") {
                    unitPrice *= 0.5;
                }
            }

            const itemCount = Math.max(1, Number(cartItem.count || 1));
            const itemTotal = unitPrice * itemCount;

            computedAmount += itemTotal;

            const addOnsList = Array.isArray(cartItem.selectedAddOns)
                ? cartItem.selectedAddOns
                : Array.isArray(cartItem.addOns)
                ? cartItem.addOns
                : [];

            validatedItems.push({
                itemId: dbItem.id,
                name: dbItem.name,
                price: unitPrice,
                count: itemCount,
                quantity: cartItem.quantity || "Full",
                variantPrice: cartItem.variantPrice ? Number(cartItem.variantPrice) : null,
                isVeg: dbItem.isVeg,
                selectedAddOns: addOnsList
            });
        }

        const orderId = await generateUniqueOrderId();

        const newOrder = new OrderModel({
            orderId,
            customerId: activeCustomerId,
            customerName: isCustomerExists.name || null,
            tableNo,
            items: validatedItems,
            amount: computedAmount,
            paymentStatus,
            paymentMode
        });

        let razorpayOrderData = null;

        if (paymentMode === "Online" || paymentMode === "UPI") {
            try {
                const receipt = `rcpt_${orderId}`;
                const razorpayOrder = await paymentService.createRazorpayOrder(computedAmount, receipt, {
                    orderId,
                    customerId: activeCustomerId,
                    tableNo
                });

                newOrder.razorpayOrderId = razorpayOrder.id;
                razorpayOrderData = {
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency || "INR",
                    razorpayKeyId: env.razorpay.keyId
                };
            } catch (razorpayError) {
                console.error("Razorpay order creation failed:", razorpayError);
                return res.status(502).json({
                    message: "Unable to initiate online payment right now. Please try Cash payment or try again shortly."
                });
            }
        }

        await newOrder.save();

        // Ensure table status becomes Active (isOccupied = true)
        const { TableModel } = await import("../models/table.model.js");
        const formattedTableNo = String(tableNo).startsWith("T-") ? tableNo : `T-${String(tableNo).padStart(2, "0")}`;
        await TableModel.findOneAndUpdate(
            { $or: [{ tableNumber: tableNo }, { tableNumber: formattedTableNo }] },
            { $set: { isOccupied: true, occupiedAt: new Date(), currentOrderId: orderId } }
        );

        res.status(200).json({
            success: true,
            message: "Order Created Successfully",
            order: {
                orderId: newOrder.orderId,
                customerId: newOrder.customerId,
                tableNo: newOrder.tableNo,
                items: newOrder.items,
                amount: newOrder.amount,
                paymentStatus: newOrder.paymentStatus,
                paymentMode: newOrder.paymentMode,
                razorpayOrderId: newOrder.razorpayOrderId || null
            },
            ...(razorpayOrderData && { razorpay: razorpayOrderData })
        });

    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Get Logged-in Customer's Orders
 * @route   GET /api/customer/myOrders
 * @access  Private (session required)
 */
async function getMyOrdersController(req, res, next) {
    try {
        const { customerId } = req.customer;

        const orders = await OrderModel.find({ customerId }).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Orders Found",
                orders: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Orders Fetched Successfully",
            orders: orders.map((order) => ({
                orderId: order.orderId,
                tableNo: order.tableNo,
                items: order.items,
                amount: order.amount,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMode: order.paymentMode,
                createdAt: order.createdAt
            }))
        });

    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Logout Customer
 * @route   POST /api/customer/logout
 * @access  Private
 */
async function logoutCustomerController(req, res, next) {
    try {
        const token = req.cookies.customerToken;

        if (token) {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            await tokenBlacklistModel.create({ token: tokenHash });
        }

        res.clearCookie("customerToken", {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: env.cookie.sameSite
        });

        res.status(200).json({ message: "Logged Out Successfully" });

    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Send OTP via WhatsApp
 * @route   POST /api/customer/sendOtp
 * @access  Public
 */
async function sendOtpController(req, res, next) {
    try {
        const normalizedPhone = req.normalizedPhone;

        const otp = otpService.generateOtp();
        await otpService.storeOtp(normalizedPhone, otp);
        await otpService.sendWhatsAppOtp(normalizedPhone, otp);

        if (redisClient) {
            const limitKey = `otprl:send:${normalizedPhone}`;
            const cooldownKey = `otp:cooldown:${normalizedPhone}`;

            await redisClient.incr(limitKey);
            await redisClient.expire(limitKey, env.otp.rateLimitWindow);
            await redisClient.set(cooldownKey, "1", "EX", 60);
        }

        res.status(200).json({
            success: true,
            message: "OTP sent successfully to WhatsApp",
            ...(process.env.NODE_ENV !== "production" && { devOtp: otp })
        });
    } catch (error) {
        next(error);
    }
}





/**
 * @desc    Verify OTP and Create/Fetch Customer session
 * @route   POST /api/customer/verifyOtp
 * @access  Public
 */
async function verifyOtpController(req, res, next) {
    try {
        const { phone, otp, name } = req.body;

        if (!phone || !otp || !name) {
            return res.status(400).json({ message: "Please provide name, phone number, and OTP" });
        }

        const phoneNumber = parsePhoneNumberFromString(phone, "IN");
        if (!phoneNumber || !phoneNumber.isValid()) {
            return res.status(400).json({ message: "Please enter a valid phone no" });
        }

        const normalizedPhone = phoneNumber.number;

        const verification = await otpService.verifyOtp(normalizedPhone, otp);

        if (!verification.success) {
            if (verification.reason === "EXPIRED_OR_NOT_FOUND") {
                return res.status(401).json({ message: "OTP has expired or does not exist. Please request a new one." });
            }
            if (verification.reason === "LOCKED_OUT") {
                return res.status(429).json({ message: "Too many failed attempts. This OTP has been invalidated. Please request a new one." });
            }
            return res.status(401).json({
                message: `Invalid OTP. You have ${verification.remainingAttempts} attempts remaining.`
            });
        }

        let customer = await CustomerModel.findOne({ phone: normalizedPhone });
        let isNewCustomer = false;

        if (!customer) {
            const newCustomerId = generateCustomerId();

            customer = new CustomerModel({
                customerId: newCustomerId,
                name: name.trim(),
                phone: normalizedPhone,
            });

            await customer.save();
            isNewCustomer = true;
        }

        const token = generateSessionToken(customer);
        res.cookie("customerToken", token, customerCookieOptions);

        res.status(200).json({
            success: true,
            message: isNewCustomer ? "New Customer Created Successfully" : "Welcome back!",
            token,
            customer: {
                customer_id: customer.customerId,
                name: customer.name,
                phoneNo: customer.phone,
                orders: customer.orders
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Phone number already registered" });
        }
        next(error);
    }
}





/**
 * @desc    Resolve QR Token to Table Number
 * @route   GET /api/customer/resolveTable
 * @access  Public
 */
async function resolveTableController(req, res, next) {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: "QR token required" });
        }

        const { TableModel } = await import("../models/table.model.js");
        const table = await TableModel.findOne({ qrToken: token });

        if (!table) {
            return res.status(404).json({ message: "Invalid or expired QR code" });
        }

        // Mark table as occupied when accessed by customer
        if (!table.isOccupied) {
            table.isOccupied = true;
            table.occupiedAt = new Date();
            await table.save();
        }

        res.status(200).json({
            success: true,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            qrToken: table.qrToken
        });
    } catch (error) {
        next(error);
    }
}




export default { 
    createCustomerController,
    createOrderController,
    getMyOrdersController,
    logoutCustomerController,
    sendOtpController,
    verifyOtpController,
    resolveTableController
};