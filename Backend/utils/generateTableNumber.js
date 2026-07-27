import { TableModel } from "../models/table.model.js";

async function generateTableNumber() {
    const tables = await TableModel.find({}, { tableNumber: 1 }).lean();
    const nums = tables
        .map(t => parseInt(t.tableNumber?.replace("T-", "") || "0", 10))
        .filter(n => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `T-${String(next).padStart(2, "0")}`;
}

export { generateTableNumber };