import { customAlphabet } from "nanoid";
import { OrderModel } from "../models/order.model.js";

const generateNumericId = customAlphabet("0123456789", 6); // 6-digit numeric string

async function generateUniqueOrderId() {
    let orderId;
    let isUnique = false;

    while (!isUnique) {
        orderId = Number(generateNumericId()); // convert string -> integer

        const existingOrder = await OrderModel.findOne({ orderId });

        if (!existingOrder) {
            isUnique = true;
        }
    }

    return orderId;
}

export { generateUniqueOrderId };