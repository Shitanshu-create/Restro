import { OrderModel } from "../models/order.model.js";
import TableModel from "../models/table.model.js";

async function createOrderController(req, res, next) {
    try {
        const { customerId } = req.customer;
        const { tableNo, items, paymentMode } = req.body;

        if (!tableNo || !items || !items.length) {
            return res.status(400).json({ message: "Please provide tableNo and items" });
        }

        const amount = items.reduce((total, item) => {
            return total + (item.price * (item.count || 1));
        }, 0);

        const count = await OrderModel.countDocuments({});
        const orderId = 1000 + count + 1;

        const newOrder = new OrderModel({
            orderId,
            customerId,
            tableNo,
            items,
            amount,
            paymentStatus: "Pending",
            paymentMode: paymentMode || "Cash",
            orderStatus: "Preparing"
        });

        await newOrder.save();

        await TableModel.findOneAndUpdate(
            { tableNumber: tableNo },
            { isOccupied: true, currentOrderId: orderId }
        );

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: {
                orderId: newOrder.orderId,
                tableNo: newOrder.tableNo,
                amount: newOrder.amount,
                orderStatus: newOrder.orderStatus,
                paymentStatus: newOrder.paymentStatus
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getMyOrdersController(req, res, next) {
    try {
        const { customerId } = req.customer;
        const orders = await OrderModel.find({ customerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
}

async function getAllOrdersController(req, res, next) {
    try {
        const orders = await OrderModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
}

async function getRevenueStatsController(req, res, next) {
    try {
        const paidOrders = await OrderModel.find({ paymentStatus: "Paid" });

        const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
        const totalOrders = await OrderModel.countDocuments({});
        const pendingOrders = await OrderModel.countDocuments({ orderStatus: "Preparing" });

        const now = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);
            const start = new Date(day.setHours(0, 0, 0, 0));
            const end = new Date(day.setHours(23, 59, 59, 999));
            const dayRevenue = paidOrders
                .filter(o => new Date(o.paidAt || o.updatedAt) >= start && new Date(o.paidAt || o.updatedAt) <= end)
                .reduce((sum, o) => sum + o.amount, 0);
            last7Days.push({
                date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                revenue: dayRevenue
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                paidOrders: paidOrders.length,
                last7Days
            }
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createOrderController,
    getMyOrdersController,
    getAllOrdersController,
    getRevenueStatsController
};
