import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";
import env from "../config/env.js";
import crypto from "crypto";


async function verifyCustomerSession(req, res, next) {

    try {
        let token = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1].trim()
            : req.cookies.customerToken;
        if (!token) {
            console.log("[CUSTOMER AUTH FAIL] No token in cookie or Authorization header");
            return res.status(401).json({ message: "Please verify your phone to continue" });
        }
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token: tokenHash });
        if (isTokenBlacklisted) {
            console.log("[CUSTOMER AUTH FAIL] Token is blacklisted");
            return res.status(401).json({ message: "Session expired. Please verify your phone again" });
        }
        const decoded = jwt.verify(token, env.jwtSecret);
        req.customer = decoded;
        next();
    }
    catch (error) {
        console.log("[CUSTOMER AUTH ERROR]", error.name, ":", error.message);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please verify your phone again" });
        }
        next(error);
    }
}



export default { verifyCustomerSession };