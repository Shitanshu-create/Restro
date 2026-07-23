import axios from "axios";
import { env } from "../../../components/config/env.js";
const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});
function getErrorMessage(err, fallback) {
    return err.response?.data?.message || err.message || fallback;
}
export const getPendingOrders = async () => {
    try {
        const res = await api.get("/api/kitchen/getPendingOrders");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch pending orders") };
    }
};
export const getReadyOrders = async () => {
    try {
        const res = await api.get("/api/kitchen/getReadyOrders");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch ready orders") };
    }
};
export const updateOrderStatus = async (orderId) => {
    try {
        const res = await api.patch(`/api/kitchen/updateOrderStatus/${orderId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to update order status") };
    }
};
export const markCashPaid = async (orderId) => {
    try {
        const res = await api.patch(`/api/payment/markCashPaid/${orderId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to mark order as paid") };
    }
};
