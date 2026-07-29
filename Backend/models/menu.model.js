import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Regular"
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { _id: true });

const addOnSchema = new mongoose.Schema({
    name: String,
    price: Number
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
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

    // ---------- PRICE SYSTEM ----------
    price: {
        type: Number,
        required: true,
        default: 0
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    // Optional Portion Variants (e.g. Half, Full)
    variants: {
        type: [variantSchema],
        default: []
    },

    // ---------- OPTIONAL ----------
    addOns: {
        type: [addOnSchema],
        default: []
    }
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

