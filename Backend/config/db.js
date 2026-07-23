import mongoose from "mongoose";
import env from "./env.js";

export async function connectDB() {
    try {
        await mongoose.connect(env.mongoUri);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default connectDB;
