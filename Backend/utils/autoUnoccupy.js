import { TableModel } from "../models/table.model.js";

/**
 * Periodically checks occupied tables and sets them back to unoccupied if they've been occupied for > 3 hours.
 */
export function startAutoUnoccupy() {
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

    const checkAndClearTables = async () => {
        try {
            const cutoffTime = new Date(Date.now() - THREE_HOURS_MS);
            const result = await TableModel.updateMany(
                {
                    isOccupied: true,
                    $or: [
                        { occupiedAt: { $lt: cutoffTime } },
                        { occupiedAt: null }
                    ]
                },
                {
                    $set: {
                        isOccupied: false,
                        occupiedAt: null,
                        currentOrderId: null
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[AutoUnoccupy] Reset ${result.modifiedCount} table(s) to unoccupied after 3 hours.`);
            }
        } catch (error) {
            console.error("[AutoUnoccupy] Error resetting occupied tables:", error);
        }
    };

    // Run immediately on boot then on interval
    checkAndClearTables();
    setInterval(checkAndClearTables, CHECK_INTERVAL_MS);
}
