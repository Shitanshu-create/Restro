import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
    itemId: {
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    count: {
        type: Number,
        default: 1,
        min: 1
    },
    quantity: {
        type: String,
        enum: ["Half", "Full"],
        default: "Full"
    },
    isVeg: {
        type: Boolean,
        default: true
    }
});
const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true,
        unique: true,
    },
    customerId: {
        type: String,
        required: true
    },
    tableNo: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    items: {
        type: [itemSchema],
        default: []
    },
    amount: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["Preparing", "Ready"],
        default: "Preparing"
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    paymentMode: {
        type: String,
        enum: ["Cash", "Online", "UPI"]
    },
    razorpayOrderId: {
        type: String,
        default: null,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    paidBy: {
        type: String,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });


export const OrderModel = mongoose.model("Orders", orderSchema);