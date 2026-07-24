import { TableModel } from "../models/table.model.js";

async function generateTableNumber() {
    let tableNumber;
    let isUnique = false;

    while (!isUnique) {
        const count = await TableModel.countDocuments();
        tableNumber = `T-${String(count + 1).padStart(2, "0")}`; // e.g. T-01, T-02

        const existing = await TableModel.findOne({ tableNumber });
        if (!existing) {
            isUnique = true;
        }
    }

    return tableNumber;
}

export { generateTableNumber };