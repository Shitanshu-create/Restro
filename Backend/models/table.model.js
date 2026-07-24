import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        default: 4
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    currentOrderId: {
        type: Number,
        default: null
    }
}, { timestamps: true });

export const TableModel =  mongoose.model("Table", tableSchema);
