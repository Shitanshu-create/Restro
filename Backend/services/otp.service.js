import crypto from "crypto";
import redisClient from "../config/redis.js";
import env from "../config/env.js";





/**
 * Generate a cryptographically secure 6-digit OTP
 */
function generateOtp() {
    // Generates a random integer between 100000 and 999999 inclusive
    return crypto.randomInt(100000, 1000000).toString();
}



/**
 * Store OTP and reset attempts counter in Redis
 */
async function storeOtp(phone, otp) {
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;

    // Store OTP with expiry
    await redisClient.set(otpKey, otp, "EX", env.otp.expiry);
    // Initialize or reset attempts counter
    await redisClient.set(attemptsKey, 0, "EX", env.otp.expiry);
}





/**
 * Get stored OTP for a phone number
 */
async function getStoredOtp(phone) {
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }
    return await redisClient.get(`otp:${phone}`);
}





/**
 * Verify OTP, track attempts, and implement brute force protection
 */
async function verifyOtp(phone, inputOtp) {
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;

    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp) {
        return { success: false, reason: "EXPIRED_OR_NOT_FOUND" };
    }

    // Check attempts count
    const attempts = parseInt(await redisClient.get(attemptsKey) || "0", 10);
    if (attempts >= env.otp.maxVerifyAttempts) {
        // Delete OTP on too many attempts
        await redisClient.del(otpKey, attemptsKey);
        return { success: false, reason: "LOCKED_OUT" };
    }

    // Ensure strings for comparison and protect against length mismatch errors
    const inputStr = String(inputOtp).trim();
    const storedStr = String(storedOtp).trim();
    
    let isMatch = false;
    if (inputStr.length === storedStr.length) {
        // Constant-time/Timing-safe comparison to prevent side-channel timing attacks
        isMatch = crypto.timingSafeEqual(
            Buffer.from(storedStr),
            Buffer.from(inputStr)
        );
    }

    if (isMatch) {
        // Single-use OTP, delete upon successful verification
        await redisClient.del(otpKey, attemptsKey);
        return { success: true };
    } else {
        // Increment attempts on mismatch
        const newAttempts = await redisClient.incr(attemptsKey);
        // Make sure attempts key keeps same TTL
        await redisClient.expire(attemptsKey, env.otp.expiry);

        if (newAttempts >= env.otp.maxVerifyAttempts) {
            await redisClient.del(otpKey, attemptsKey);
            return { success: false, reason: "LOCKED_OUT" };
        }

        return { success: false, reason: "INVALID_OTP", remainingAttempts: env.otp.maxVerifyAttempts - newAttempts };
    }
}




/**
 * Send OTP via Meta's WhatsApp Cloud API
 */
async function sendWhatsAppOtp(phone, otp) {
    // Unconditionally log OTP to console for local testing and debugging
    console.log(`\n--- [WHATSAPP OTP LOG] ---`);
    console.log(`Recipient: ${phone}`);
    console.log(`OTP Code:  ${otp}`);
    console.log(`Template:  ${env.whatsapp.templateName || "hello_world"}`);
    console.log(`--------------------------\n`);

    // If WhatsApp credentials are empty, skip API call and return success
    if (!env.whatsapp.accessToken || !env.whatsapp.phoneNumberId || !env.whatsapp.templateName) {
        return true;
    }

    const url = `https://graph.facebook.com/${env.whatsapp.apiVersion}/${env.whatsapp.phoneNumberId}/messages`;
    
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
            name: env.whatsapp.templateName,
            language: {
                code: "en_US"
            },
            components: env.whatsapp.templateName === "hello_world" ? [] : [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: otp
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.whatsapp.accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error Response:", data);
            throw new Error(data.error?.message || "Failed to send WhatsApp message");
        }

        return true;
    } catch (error) {
        console.error("Error calling WhatsApp Cloud API:", error);
        throw error;
    }
}




export default {
    generateOtp,
    storeOtp,
    getStoredOtp,
    verifyOtp,
    sendWhatsAppOtp
};
