import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true // One review per customer session
    },
    customerName: {
        type: String,
        default: "Anonymous"
    },
    tableNo: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const ReviewModel = mongoose.model("Review", reviewSchema);
