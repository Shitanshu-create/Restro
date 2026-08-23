import Redis from "ioredis";
import env from "./env.js";

let redisClient = null;

try {
    redisClient = new Redis(env.redisUrl, {
        maxRetriesPerRequest: null, // Disable max retries per request
        enableOfflineQueue: false, // Immediately fail requests if Redis is offline instead of hanging
        retryStrategy(times) {
            // Wait up to 3 seconds between retries
            return Math.min(times * 100, 3000);
        }
    });

    redisClient.on("connect", () => {
        console.log("Connected to Redis");
    });

    redisClient.on("error", (error) => {
        console.error("Redis connection error:", error.message);
    });
} catch (err) {
    console.error("Failed to initialize Redis client:", err);
}

export default redisClient;
