import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, "Please Provide a Name"]
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone no"],
        unique: [true, "Phone No. Already Exists"]
    },
    orders: {
        type: [],
        default: []
    }
});

export const CustomerModel = mongoose.model("Customers", customerSchema);