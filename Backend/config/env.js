import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });
const requiredEnv = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || process.env.jwtSecret,
};
const missingEnv = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);
if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}
const parseBoolean = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    const clean = String(value).trim().toLowerCase();
    return clean === "true";
};
const parseInteger = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    const parsed = Number.parseInt(String(value).trim(), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const env = {
    nodeEnv: typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV.trim() : (process.env.NODE_ENV || "development"),
    port: parseInteger(process.env.PORT, 3000),
    mongoUri: typeof requiredEnv.MONGODB_URI === "string" ? requiredEnv.MONGODB_URI.trim() : requiredEnv.MONGODB_URI,
    jwtSecret: typeof requiredEnv.JWT_SECRET === "string" ? requiredEnv.JWT_SECRET.trim() : requiredEnv.JWT_SECRET,
    corsOrigin: typeof process.env.CORS_ORIGIN === "string" ? process.env.CORS_ORIGIN.trim() : (process.env.CORS_ORIGIN || "http://localhost:5173"),
    netlifyUrlCors: typeof process.env.NETLIFY_URL_CORS === "string" ? process.env.NETLIFY_URL_CORS.trim() : (process.env.NETLIFY_URL_CORS || "http://localhost:5173"),
    jsonLimit: typeof process.env.JSON_LIMIT === "string" ? process.env.JSON_LIMIT.trim() : (process.env.JSON_LIMIT || "10mb"),
    rateLimit: {
        windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        max: parseInteger(process.env.RATE_LIMIT_MAX, 10000)
    },
    backendUrl: typeof process.env.BACKEND_URL === "string" ? process.env.BACKEND_URL.trim() : (process.env.BACKEND_URL || `http://localhost:${parseInteger(process.env.PORT, 3000)}`),
    cookie: {
        secure: parseBoolean(process.env.COOKIE_SECURE, typeof process.env.NODE_ENV === "string" && (process.env.NODE_ENV.trim().toLowerCase() === "production" || process.env.NODE_ENV.trim().toLowerCase() === "testing")),
        sameSite: typeof process.env.COOKIE_SAME_SITE === "string" 
            ? process.env.COOKIE_SAME_SITE.trim().toLowerCase() 
            : (typeof process.env.NODE_ENV === "string" && (process.env.NODE_ENV.trim().toLowerCase() === "production" || process.env.NODE_ENV.trim().toLowerCase() === "testing") ? "none" : "lax"),
        maxAge: parseInteger(process.env.COOKIE_MAX_AGE_MS, 24 * 60 * 60 * 1000)
    },
    csrfCookieName: typeof process.env.CSRF_COOKIE_NAME === "string" ? process.env.CSRF_COOKIE_NAME.trim() : (process.env.CSRF_COOKIE_NAME || "_csrf"),
    redisUrl: typeof process.env.REDIS_URL === "string" && process.env.REDIS_URL.trim() !== "" ? process.env.REDIS_URL.trim() : "redis://localhost:6379",
    whatsapp: {
        phoneNumberId: typeof process.env.WHATSAPP_PHONE_NUMBER_ID === "string" ? process.env.WHATSAPP_PHONE_NUMBER_ID.trim() : "",
        accessToken: typeof process.env.WHATSAPP_ACCESS_TOKEN === "string" ? process.env.WHATSAPP_ACCESS_TOKEN.trim() : "",
        templateName: typeof process.env.WHATSAPP_TEMPLATE_NAME === "string" ? process.env.WHATSAPP_TEMPLATE_NAME.trim() : "",
        apiVersion: typeof process.env.WHATSAPP_API_VERSION === "string" ? process.env.WHATSAPP_API_VERSION.trim() : "v22.0",
    },
    otp: {
        expiry: parseInteger(process.env.OTP_EXPIRY_SECONDS, 300),
        length: parseInteger(process.env.OTP_LENGTH, 6),
        maxSendPerWindow: parseInteger(process.env.OTP_MAX_SEND_PER_WINDOW, 3),
        maxVerifyAttempts: parseInteger(process.env.OTP_MAX_VERIFY_ATTEMPTS, 5),
        rateLimitWindow: parseInteger(process.env.OTP_RATE_LIMIT_WINDOW_SECONDS, 600),
    },
    razorpay: {
        keyId: typeof process.env.RAZORPAY_KEY_ID === "string" ? process.env.RAZORPAY_KEY_ID.trim() : "",
        keySecret: typeof process.env.RAZORPAY_KEY_SECRET === "string" ? process.env.RAZORPAY_KEY_SECRET.trim() : "",
        webhookSecret: typeof process.env.RAZORPAY_WEBHOOK_SECRET === "string" ? process.env.RAZORPAY_WEBHOOK_SECRET.trim() : "",
    },
};
export default env;