import axios from "axios";
import { env } from "../../../components/config/env.js";



const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});




// Interceptor to attach Bearer token if present in sessionStorage
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("customerToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


function getErrorMessage(err, fallback) {
    return err.response?.data?.message || err.message || fallback;
}



// ── Menu & Table ─────────────────────────────────────────────────────────────
export const getPublicMenu = async () => {
    try {
        const res = await api.get("/api/menu/getMenu");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to load menu") };
    }
};



export const resolveTable = async (qrToken) => {
    try {
        const res = await api.get(`/api/customer/resolveTable?token=${encodeURIComponent(qrToken)}`);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Invalid QR code") };
    }
};





// ── OTP ──────────────────────────────────────────────────────────────────────
export const sendOtp = async (phone) => {
    try {
        const res = await api.post("/api/customer/sendOtp", { phone });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to send OTP") };
    }
};


export const verifyOtp = async ({ phone, otp, name }) => {
    try {
        const res = await api.post("/api/customer/verifyOtp", { phone, otp, name });
        if (res.data?.success && res.data?.token) {
            sessionStorage.setItem("customerToken", res.data.token);
        }
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "OTP verification failed") };
    }
};




// ── Orders ───────────────────────────────────────────────────────────────────
export const createOrder = async (orderData) => {
    try {
        const res = await api.post("/api/customer/createOrder", orderData);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to place order") };
    }
};


export const getMyOrders = async () => {
    try {
        const res = await api.get("/api/customer/myOrders");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch your orders") };
    }
};



export const logoutCustomer = async () => {
    try {
        const res = await api.post("/api/customer/logout");
        sessionStorage.removeItem("customerToken");
        return res.data;
    } catch (err) {
        sessionStorage.removeItem("customerToken");
        return { success: false, message: getErrorMessage(err, "Logout failed") };
    }
};



// ── Payment ──────────────────────────────────────────────────────────────────
export const initiatePayment = async (orderId) => {
    try {
        const res = await api.post("/api/payment/initiate", { orderId });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Payment initiation failed") };
    }
};


 
export const verifyPayment = async (paymentData) => {
    try {
        const res = await api.post("/api/payment/verify", paymentData);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Payment verification failed") };
    }
};
