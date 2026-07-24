import crypto from "crypto";
import redisClient from "../config/redis.js";
import env from "../config/env.js";


/**
 * Generate a cryptographically secure 6-digit OTP
 */
function generateOtp() {
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
    await redisClient.set(otpKey, otp, "EX", env.otp.expiry);
    await redisClient.set(attemptsKey, 0, "EX", env.otp.expiry);
    console.log(`[REDIS STORE] Key: "${otpKey}" | OTP: "${otp}" | TTL: ${env.otp.expiry}s`);
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
    console.log(`[REDIS VERIFY CHECK] Key: "${otpKey}" | Stored: "${storedOtp}" | Input: "${inputOtp}"`);
    if (!storedOtp) {
        return { success: false, reason: "EXPIRED_OR_NOT_FOUND" };
    }
    const attempts = parseInt(await redisClient.get(attemptsKey) || "0", 10);
    if (attempts >= env.otp.maxVerifyAttempts) {
        await redisClient.del(otpKey, attemptsKey);
        return { success: false, reason: "LOCKED_OUT" };
    }
    const inputStr = String(inputOtp).trim();
    const storedStr = String(storedOtp).trim();
    let isMatch = false;
    if (inputStr.length === storedStr.length) {
        isMatch = crypto.timingSafeEqual(
            Buffer.from(storedStr),
            Buffer.from(inputStr)
        );
    }
    if (isMatch) {
        await redisClient.del(otpKey, attemptsKey);
        console.log(`[REDIS VERIFY SUCCESS] OTP matched for key "${otpKey}". Single-use OTP cleared.`);
        return { success: true };
    } else {
        const newAttempts = await redisClient.incr(attemptsKey);
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


    console.log(`\n========================================`);
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log(`========================================\n`);



    if (!env.whatsapp.accessToken || !env.whatsapp.phoneNumberId) {
        console.warn("WhatsApp credentials missing — skipping actual send. OTP is logged above.");
        return true;
    }



    const toNumber = phone.replace("+", "");
    const templateName = env.whatsapp.templateName || "hello_world";


    if (templateName === "hello_world") {
        console.warn(
            "WARNING: using the 'hello_world' template — this is Meta's static sample template " +
            "and does NOT support inserting the OTP as a variable. The customer will receive a generic " +
            "'Hello World' message, not their actual OTP. You need an approved custom template " +
            "(Authentication category recommended) with a body variable before this works for real."
        );
    }


    const url = `https://graph.facebook.com/${env.whatsapp.apiVersion}/${env.whatsapp.phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toNumber,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: "en_US"
            },
            components: templateName === "hello_world" ? [] : [
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
            console.warn("⚠️ WhatsApp Cloud API send failed, but OTP is saved in Redis and can be tested using the logged console OTP.");
            return false;
        }
        return true;
    } 
    catch (error) {
        console.error("Error calling WhatsApp Cloud API:", error);
        console.warn("⚠️ WhatsApp API call failed, but OTP is saved in Redis and can be tested using the logged console OTP.");
        return false;
    }
}




export default {
    generateOtp,
    storeOtp,
    getStoredOtp,
    verifyOtp,
    sendWhatsAppOtp
};
