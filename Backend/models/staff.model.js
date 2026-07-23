import mongoose from "mongoose";



const StaffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        default: null 
    },
    provider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local" 
    },
    providerId: { 
        type: String, 
        default: null 
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email already exists"]
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        enum: ["admin", "chef", "waiter"],
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { _id: true , timestamps: true });


const StaffModel = mongoose.model("Staff", StaffSchema);


export default StaffModel;