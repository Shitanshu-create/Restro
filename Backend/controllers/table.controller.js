import { TableModel } from "../models/table.model.js";
import { generateTableNumber } from "../utils/generateTableNumber.js";
import { generateQrToken } from "../utils/generateTableQrToken.js";




/** 
 * @desc    Create a Table
 * @route   POST /api/admin/createTable
 * @access  Private
 */
async function createTableController(req, res, next) {
    try {
        const { capacity } = req.body;
        const tableNumber = await generateTableNumber();
        const qrToken = generateQrToken();
        const newTable = new TableModel({
            tableNumber,
            qrToken,
            capacity: capacity || 4
        });
        await newTable.save();
        res.status(200).json({
            success: true,
            message: "Table Created Successfully",
            table: {
                tableNumber: newTable.tableNumber,
                qrToken: newTable.qrToken,
                capacity: newTable.capacity,
                isOccupied: newTable.isOccupied,
                occupiedAt: newTable.occupiedAt,
                qrUrl: `${process.env.CLIENT_URL}/menu/${newTable.qrToken}`
            }
        });
    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Get All Tables
 * @route   GET /api/admin/getAllTables
 * @access  Private
 */
async function getAllTablesController(req, res, next) {
    try {
        const tables = await TableModel.find({});
        if (!tables || tables.length === 0) {
            return res.status(404).json({ message: "No Tables Found" });
        }
        const tablesWithQrUrl = tables.map((table) => ({
            _id: table._id.toString(),
            tableNumber: table.tableNumber,
            qrToken: table.qrToken,
            capacity: table.capacity,
            isOccupied: table.isOccupied,
            occupiedAt: table.occupiedAt,
            qrImageBase64: table.qrImageBase64 || null,
            qrUrl: `${process.env.CLIENT_URL}/menu/${table.qrToken}`
        }));
        res.status(200).json({
            success: true,
            message: "Tables Fetched Successfully",
            tables: tablesWithQrUrl
        });
    } catch (error) {
        next(error);
    }
}




/*
async function refreshQrController(req, res, next) {
    try {
        const { tableNumber, qrImageBase64 } = req.body;
        if (!tableNumber || !qrImageBase64) {
            return res.status(400).json({ message: "Table number and QR image are required" });
        }
        const table = await TableModel.findOneAndUpdate(
            { tableNumber },
            { $set: { qrImageBase64 } },
            { new: true }
        );
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }
        res.status(200).json({
            success: true,
            message: "QR Image updated successfully",
            qrImageBase64: table.qrImageBase64
        });
    } catch (error) {
        next(error);
    }
}
*/

/*
async function regenerateQrTokenController(req, res, next) {
    try {
        const { tableNumber } = req.body;
        if (!tableNumber) {
            return res.status(400).json({ message: "Table number is required" });
        }
        const newQrToken = generateQrToken();
        const table = await TableModel.findOneAndUpdate(
            { tableNumber },
            { $set: { qrToken: newQrToken, qrImageBase64: null } },
            { new: true }
        );
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }
        res.status(200).json({
            success: true,
            message: "QR Token regenerated successfully",
            tableNumber: table.tableNumber,
            qrToken: table.qrToken
        });
    } catch (error) {
        next(error);
    }
}
*/

/**
 * @desc    Toggle Table Availability (isOccupied)
 * @route   PATCH /api/admin/toggleTableAvailability
 * @access  Private (Admin)
 */
async function toggleTableAvailabilityController(req, res, next) {
    try {
        const { tableNumber } = req.body;
        if (!tableNumber) {
            return res.status(400).json({ message: "Table number is required" });
        }
        const table = await TableModel.findOne({ tableNumber });
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }
        table.isOccupied = !table.isOccupied;
        if (!table.isOccupied) {
            table.occupiedAt = null;
            table.currentOrderId = null;
        } else {
            table.occupiedAt = new Date();
        }
        await table.save();
        res.status(200).json({
            success: true,
            message: `Table status updated to ${table.isOccupied ? "Occupied" : "Available"}`,
            table: {
                tableNumber: table.tableNumber,
                qrToken: table.qrToken,
                capacity: table.capacity,
                isOccupied: table.isOccupied,
                occupiedAt: table.occupiedAt,
                qrImageBase64: table.qrImageBase64,
                qrUrl: `${process.env.CLIENT_URL}/menu/${table.qrToken}`
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @desc    Remove a Table
 * @route   DELETE /api/admin/removeTable
 * @access  Private
 */
async function removeTableController(req, res, next) {
    try {
        const { tableNumber } = req.body;
        if (!tableNumber) {
            return res.status(400).json({ message: "Please Provide a Table Number" });
        }
        const existingTable = await TableModel.findOne({ tableNumber });
        if (!existingTable) {
            return res.status(400).json({ message: "Table Does not Exist" });
        }
        // if (existingTable.isOccupied) {
        //     return res.status(400).json({ message: "Cannot remove an occupied table" });
        // }
        await TableModel.findOneAndDelete({ tableNumber });
        return res.status(200).json({
            success: true,
            message: "Table Removed Successfully"
        });
    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Get All Orders for Admin Oversight
 * @route   GET /api/admin/getAllOrders
 * @access  Private (Admin)
 */
async function getAllOrdersController(req, res, next) {
    try {
        const { OrderModel } = await import("../models/order.model.js");
        const { CustomerModel } = await import("../models/customers.model.js");
        const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();

        const customerIds = [...new Set(orders.map(o => o.customerId).filter(Boolean))];
        const customers = await CustomerModel.find({ customerId: { $in: customerIds } }, "customerId name").lean();
        const customerMap = new Map(customers.map(c => [c.customerId, c.name]));

        res.status(200).json({
            success: true,
            message: "Orders Fetched Successfully",
            orders: orders.map((order) => ({
                orderId: order.orderId,
                customerId: order.customerId,
                customerName: order.customerName || customerMap.get(order.customerId) || order.customerId,
                tableNo: order.tableNo,
                items: order.items,
                amount: order.amount,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMode: order.paymentMode,
                paidBy: order.paidBy || null,
                paidAt: order.paidAt || null,
                razorpayOrderId: order.razorpayOrderId || null,
                razorpayPaymentId: order.razorpayPaymentId || null,
                createdAt: order.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
}



export default { createTableController, getAllTablesController, removeTableController, getAllOrdersController, toggleTableAvailabilityController };