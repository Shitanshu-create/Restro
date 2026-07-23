import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin", "chef", "waiter"],
        default: "waiter"
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        default: "local"
    }
}, { timestamps: true });

export default mongoose.model("Staff", staffSchema);
