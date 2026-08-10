import { useState, useEffect, useCallback, useRef } from "react";
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

    useEffect(() => {
        const token = localStorage.getItem("customerToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.exp * 1000 > Date.now()) {
                    setCustomer({
                        customer_id: payload.customerId,
                        name: payload.name,
                        phoneNo: payload.phone
                    });
                } else {
                    localStorage.removeItem("customerToken");
                }
            } catch {
                localStorage.removeItem("customerToken");
            }
        }
    }, []);

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
    const [readyNotifications, setReadyNotifications] = useState([]);
    const prevOrdersRef = useRef([]);


    const isFirstLoad = useRef(true);
    const loadOrders = useCallback(async () => {
        if (isFirstLoad.current) {
            setLoading(true);
        }
        setError(null);
        const res = await customerApi.getMyOrders();
        if (res.success) {
            const fetchedOrders = res.orders || [];
            
            // On subsequent loads, check for orders transitioning to 'Ready' status
            if (!isFirstLoad.current && prevOrdersRef.current.length > 0) {
                fetchedOrders.forEach((newOrder) => {
                    const oldOrder = prevOrdersRef.current.find(o => o.orderId === newOrder.orderId);
                    if (oldOrder && oldOrder.orderStatus !== "Ready" && newOrder.orderStatus === "Ready") {
                        setReadyNotifications((prev) => {
                            if (!prev.some(id => id === newOrder.orderId)) {
                                return [...prev, newOrder.orderId];
                            }
                            return prev;
                        });
                    }
                });
            }
            
            setOrders(fetchedOrders);
            prevOrdersRef.current = fetchedOrders;
        } else if (res.message !== "No Orders Found") {
            setError(res.message);
        }
        setLoading(false);
        isFirstLoad.current = false;
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

    const clearReadyNotification = (orderId) => {
        setReadyNotifications((prev) => prev.filter(id => id !== orderId));
    };


    return { orders, loading, error, handlePlaceOrder, reload: loadOrders, readyNotifications, clearReadyNotification };
}