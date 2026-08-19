import mongoose from "mongoose";
import { OrderModel } from "../models/order.model.js";
/**
 * @desc    Get all pending (unfinished) orders for the kitchen
 * @route   GET /api/kitchen/getPendingOrders
 * @access  Private 
 */
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
/**
 * @desc    Update order status (e.g. Preparing -> Ready)
 * @route   PATCH /api/kitchen/updateOrderStatus/:orderId
 * @access  Private (staff/kitchen)
 */
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
        existingOrder.readyAt = new Date();
        await existingOrder.save();

        // Section 3.2: Check if all orders for this table are Ready. If so, mark table as Inactive (isOccupied = false).
        if (existingOrder.tableNo) {
            const tableNoStr = String(existingOrder.tableNo);
            const pendingForTable = await OrderModel.findOne({
                tableNo: existingOrder.tableNo,
                orderStatus: { $ne: "Ready" }
            });

            if (!pendingForTable) {
                const { TableModel } = await import("../models/table.model.js");
                const formattedTableNo = tableNoStr.startsWith("T-") ? tableNoStr : `T-${tableNoStr.padStart(2, "0")}`;
                await TableModel.findOneAndUpdate(
                    { $or: [{ tableNumber: tableNoStr }, { tableNumber: formattedTableNo }] },
                    { $set: { isOccupied: false, occupiedAt: null, currentOrderId: null } }
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Order Marked as Ready",
            order: {
                orderId: existingOrder.orderId,
                tableNo: existingOrder.tableNo,
                orderStatus: existingOrder.orderStatus,
                readyAt: existingOrder.readyAt
            }
        });
    } catch (error) {
        next(error);
    }
}
/**
 * @desc    Get all Ready orders for the waiter to deliver
 * @route   GET /api/waiter/getReadyOrders
 * @access  Private (staff/waiter)
 */
async function getReadyOrdersController(req, res, next) {
    try {
        const readyOrders = await OrderModel.find({ orderStatus: "Ready" })
            .sort({ createdAt: 1 }); // oldest-ready first
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
export default { getPendingOrdersController, updateOrderStatusController, getReadyOrdersController }