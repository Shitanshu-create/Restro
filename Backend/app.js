import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import env from "./config/env.js";
import rateLimit from "express-rate-limit";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import menuRouter from "./routes/menu.routes.js";
import customerRouter from "./routes/customer.route.js";
import tableRouter from "./routes/table.route.js";
import kitchenRouter from "./routes/kitchen.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();

const allowedOrigins = new Set([
    env.corsOrigin,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/api/kitchen") || req.path.startsWith("/api/admin")
}));

app.use(cookieParser());
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/menu", menuRouter);
app.use("/api/admin/menu", menuRouter);
app.use("/api/customer", customerRouter);
app.use("/api/admin/tables", tableRouter);
app.use("/api/tables", tableRouter);
app.use("/api/kitchen", kitchenRouter);
app.use("/api/payment", paymentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
