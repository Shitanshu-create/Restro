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
    description: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    preparationTime: {
        type: Number,
        default: 15
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isBestseller: {
        type: Boolean,
        default: false
    },
    isRecommended: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: ""
    },
    upsellItems: [{
        type: Number
    }],
    variants: [{
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    addOns: [{
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }]
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    order: {
        type: Number,
        default: 0
    },
    items: [menuItemSchema]
}, { timestamps: true });

export const MenuItemModel = mongoose.model("MenuItem", menuItemSchema);
export const CategoryModel = mongoose.model("Category", categorySchema);
