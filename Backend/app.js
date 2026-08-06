import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import env from "./config/env.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import menuRouter from "./routes/menu.routes.js";
import customerRouter from "./routes/customer.route.js";
import tableRouter from "./routes/table.route.js";
import kitchenRouter from "./routes/kitchen.route.js";
import paymentRouter from "./routes/payment.route.js";
import reviewRouter from "./routes/review.route.js";
const app = express();
const csrfProtection = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const cookieToken = req.cookies[env.csrfCookieName];
    const headerToken = req.headers['csrf-token'] || req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        const error = new Error("Invalid CSRF token");
        error.code = "EBADCSRFTOKEN";
        return next(error);
    }
    next();
};
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", env.corsOrigin]
        }
    }
}));

const allowedOrigins = new Set([
    env.corsOrigin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]);
if (env.netlifyUrlCors) {
    allowedOrigins.add(env.netlifyUrlCors);
    if (!env.netlifyUrlCors.startsWith("http://") && !env.netlifyUrlCors.startsWith("https://")) {
        allowedOrigins.add(`https://${env.netlifyUrlCors}`);
        allowedOrigins.add(`http://${env.netlifyUrlCors}`);
    }
}


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
    windowMs: env.rateLimit.windowMs,
    max: 50000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/api/kitchen") || req.path.startsWith("/api/admin")
}));
app.use(cookieParser());
// Webhook raw body parsing must happen before global express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: env.jsonLimit }));




app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() });
});
app.use("/api/auth", authRouter);
app.use("/api/menu", menuRouter);
app.use("/api/admin", menuRouter);
app.use("/api/customer", customerRouter);
app.use("/api/admin", tableRouter);
app.use("/api/kitchen", kitchenRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
