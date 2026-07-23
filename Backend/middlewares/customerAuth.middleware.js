import jwt from "jsonwebtoken";
import env from "../config/env.js";

async function verifyCustomerSession(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token = req.cookies.customerToken;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (!token) {
            return res.status(401).json({ message: "Customer session token required" });
        }

        const decoded = jwt.verify(token, env.jwtSecret);
        req.customer = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired customer session" });
    }
}

export default { verifyCustomerSession };
