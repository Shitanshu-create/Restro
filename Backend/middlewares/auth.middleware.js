import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";
import env from "../config/env.js";
import crypto from "crypto";
async function authUser(req, res, next) {
    try {
        const token = req.cookies.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.slice(7)
                : null);
        if(!token){
            return res.status(401).json({message: "Please Login to continue"});  
        }
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token: tokenHash });
        if (isTokenBlacklisted){
            return res.status(401).json({message: "Session Expired, Please Login Again"});
        }
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json(
                { message: "Session expired. Please log in again" }
            );
        }
        next(error);
    }
}
async function verifyAdmin(req, res, next) {
    await authUser(req, res, () => {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    });
}
async function verifyChef(req, res, next) {
    await authUser(req, res, () => {
        const allowedRoles = ["admin", "chef"];
        if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Chef or Admin access required" });
        }
        next();
    });
}


async function verifyStaff(req, res, next) {
    await authUser(req, res, () => {
        const allowedRoles = ["admin", "chef", "waiter"];
        if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Staff access required" });
        }
        next();
    });
}

export default { authUser, verifyAdmin, verifyChef, verifyStaff };