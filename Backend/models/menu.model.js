import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    items: [menuItemSchema]
}, { timestamps: true });

export const MenuItemModel = mongoose.model("MenuItem", menuItemSchema);
export const CategoryModel = mongoose.model("Category", categorySchema);
