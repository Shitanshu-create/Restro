import { useState, useEffect, useCallback } from "react";
import * as customerApi from "../api/customer.api.js";


export function useMenu() {


    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const loadMenu = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await customerApi.getPublicMenu();
        if (res.success) {
            setCategories(res.categories || []);
        } else {
            setError(res.message);
        }
        setLoading(false);
    }, []);


    useEffect(() => { loadMenu(); }, [loadMenu]);


    return { categories, loading, error, reload: loadMenu };
}


export function useCustomerAuth() {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleSendOtp = async (phone) => {
        setLoading(true);
        const res = await customerApi.sendOtp(phone);
        setLoading(false);
        return res;
    };

    const handleVerifyOtp = async ({ phone, otp, name }) => {
        setLoading(true);
        const res = await customerApi.verifyOtp({ phone, otp, name });
        setLoading(false);
        if (res.success && res.customer) {
            setCustomer(res.customer);
            return { success: true, customer: res.customer };
        }
        return { success: false, message: res.message };
    };

    const handleLogout = async () => {
        await customerApi.logoutCustomer();
        setCustomer(null);
        return { success: true };
    };


    return { customer, setCustomer, loading, handleSendOtp, handleVerifyOtp, handleLogout };
}



export function useCustomerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await customerApi.getMyOrders();
        if (res.success) {
            setOrders(res.orders || []);
        } else if (res.message !== "No Orders Found") {
            setError(res.message);
        }
        setLoading(false);
    }, []);


    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 180000); // 3 minutes polling
        return () => clearInterval(interval);
    }, [loadOrders]);


    const handlePlaceOrder = async ({ tableNo, items, paymentMode }) => {
        setLoading(true);
        const res = await customerApi.createOrder({
            tableNo,
            items,
            paymentMode,
            paymentStatus: "Pending"
        });
        setLoading(false);
        if (res.success) {
            await loadOrders();
            return { success: true, order: res.order, razorpay: res.razorpay };
        }
        return { success: false, message: res.message };
    };


    return { orders, loading, error, handlePlaceOrder, reload: loadOrders };
}