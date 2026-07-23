import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";
import env from "../config/env.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * IP-based OTP rate limiter using Redis store.
 * Prevents dynamic IP-spoofing / request flooding at the network level.
 */
export const otpIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 OTP requests per window
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }) : undefined, // Fallback to memory store if Redis is unavailable
    message: { message: "Too many OTP requests from this IP. Please try again after 15 minutes." }
});

/**
 * Phone number rate limiter (Redis-backed).
 * Restricts OTP requests to maxSendPerWindow (default 3) per phone number per rateLimitWindow (default 10 mins),
 * and enforces a 60-second cooldown between consecutive OTP requests.
 */
export async function otpPhoneRateLimiter(req, res, next) {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const phoneNumber = parsePhoneNumberFromString(phone, "IN");
        if (!phoneNumber || !phoneNumber.isValid()) {
            return res.status(400).json({ message: "Please enter a valid phone no" });
        }

        const normalizedPhone = phoneNumber.number;
        req.normalizedPhone = normalizedPhone; // Attach normalized number for controllers

        if (!redisClient) {
            console.warn("Redis is not connected. Bypassing phone-level OTP rate limits.");
            return next();
        }

        const limitKey = `otprl:send:${normalizedPhone}`;
        const cooldownKey = `otp:cooldown:${normalizedPhone}`;

        // 1. Check Cooldown (60 seconds)
        const inCooldown = await redisClient.get(cooldownKey);
        if (inCooldown) {
            return res.status(429).json({ message: "Please wait 60 seconds before requesting another OTP." });
        }

        // 2. Check window request limit
        const sendCount = parseInt(await redisClient.get(limitKey) || "0", 10);
        if (sendCount >= env.otp.maxSendPerWindow) {
            const ttl = await redisClient.ttl(limitKey);
            const minutesLeft = Math.ceil(ttl / 60);
            return res.status(429).json({
                message: `Too many OTP requests for this number. Please try again in ${minutesLeft} minute(s).`
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}