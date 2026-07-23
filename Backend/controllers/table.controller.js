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
                qrUrl: `${process.env.CLIENT_URL}/menu?table=${newTable.qrToken}`
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
            tableNumber: table.tableNumber,
            qrToken: table.qrToken,
            capacity: table.capacity,
            isOccupied: table.isOccupied,
            qrUrl: `${process.env.CLIENT_URL}/menu?table=${table.qrToken}`
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
        const orders = await OrderModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Orders Fetched Successfully",
            orders: orders.map((order) => ({
                orderId: order.orderId,
                customerId: order.customerId,
                tableNo: order.tableNo,
                items: order.items,
                amount: order.amount,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMode: order.paymentMode,
                razorpayOrderId: order.razorpayOrderId || null,
                createdAt: order.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
}



export default { createTableController, getAllTablesController, removeTableController, getAllOrdersController };