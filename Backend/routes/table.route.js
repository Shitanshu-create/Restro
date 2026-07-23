import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const tableRouter = express.Router();

tableRouter.get("/getAllTables", async (req, res) => {
    try {
        const Table = (await import("../models/table.model.js")).default;
        const tables = await Table.find({}).sort({ tableNumber: 1 });
        res.status(200).json({ success: true, tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

tableRouter.post("/createTable", authMiddleware.verifyAdmin, async (req, res) => {
    try {
        const { capacity } = req.body;
        const Table = (await import("../models/table.model.js")).default;
        const count = await Table.countDocuments({});
        const tableNumber = `T-${String(count + 1).padStart(2, "0")}`;
        const newTable = new Table({ tableNumber, capacity: capacity || 4 });
        await newTable.save();
        res.status(201).json({ success: true, table: newTable });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

tableRouter.delete("/removeTable", authMiddleware.verifyAdmin, async (req, res) => {
    try {
        const { tableNumber } = req.body;
        const Table = (await import("../models/table.model.js")).default;
        await Table.findOneAndDelete({ tableNumber });
        res.status(200).json({ success: true, message: "Table removed successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default tableRouter;
