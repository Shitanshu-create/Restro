import mongoose from "mongoose";
import { OrderModel } from "../models/order.model.js";

async function getPendingOrdersController(req, res, next) {
    try {
        const pendingOrders = await OrderModel.find({ orderStatus: "Preparing" }).sort({ createdAt: 1 });

        if (!pendingOrders || pendingOrders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Pending Orders",
                orders: []
            });
        }

        const formattedOrders = pendingOrders.map((order) => ({
            orderId: order.orderId,
            customerId: order.customerId,
            tableNo: order.tableNo,
            items: order.items,
            amount: order.amount,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus || "Pending",
            paymentMode: order.paymentMode || "Cash",
            paidBy: order.paidBy || null,
            paidAt: order.paidAt || null,
            createdAt: order.createdAt
        }));

        res.status(200).json({
            success: true,
            message: "Pending Orders Fetched Successfully",
            orders: formattedOrders
        });

    } catch (error) {
        next(error);
    }
}

async function updateOrderStatusController(req, res, next) {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ message: "Please Provide an Order Id" });
        }

        const existingOrder = await OrderModel.findOne({ orderId: Number(orderId) });

        if (!existingOrder) {
            return res.status(400).json({ message: "Order Does not Exist" });
        }

        if (existingOrder.orderStatus === "Ready") {
            return res.status(400).json({ message: "Order is Already Marked Ready" });
        }

        existingOrder.orderStatus = "Ready";
        await existingOrder.save();

        res.status(200).json({
            success: true,
            message: "Order Marked as Ready",
            order: {
                orderId: existingOrder.orderId,
                tableNo: existingOrder.tableNo,
                orderStatus: existingOrder.orderStatus
            }
        });

    } catch (error) {
        next(error);
    }
}

async function getReadyOrdersController(req, res, next) {
    try {
        const readyOrders = await OrderModel.find({ orderStatus: "Ready" }).sort({ createdAt: 1 });

        if (!readyOrders || readyOrders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Ready Orders",
                orders: []
            });
        }

        const formattedOrders = readyOrders.map((order) => ({
            orderId: order.orderId,
            customerId: order.customerId,
            tableNo: order.tableNo,
            items: order.items,
            amount: order.amount,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus || "Pending",
            paymentMode: order.paymentMode || "Cash",
            paidBy: order.paidBy || null,
            paidAt: order.paidAt || null,
            createdAt: order.createdAt
        }));

        res.status(200).json({
            success: true,
            message: "Ready Orders Fetched Successfully",
            orders: formattedOrders
        });

    } catch (error) {
        next(error);
    }
}

export default { getPendingOrdersController, updateOrderStatusController, getReadyOrdersController };
