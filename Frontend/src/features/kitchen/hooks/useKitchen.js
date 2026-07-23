import { useState, useEffect, useCallback } from "react";
import * as kitchenApi from "../api/kitchen.api.js";




export function useKitchen() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const [pendingRes, readyRes] = await Promise.all([
            kitchenApi.getPendingOrders(),
            kitchenApi.getReadyOrders()
        ]);
        if (pendingRes.success) setPendingOrders(pendingRes.orders || []);
        if (readyRes.success) setReadyOrders(readyRes.orders || []);
        if (!pendingRes.success) setError(pendingRes.message);
        setLoading(false);
    }, []);




    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, [loadOrders]);
    const handleMarkReady = async (orderId) => {
        const res = await kitchenApi.updateOrderStatus(orderId);
        if (res.success) await loadOrders();
        return res;
    };
    const handleMarkPaid = async (orderId) => {
        const res = await kitchenApi.markCashPaid(orderId);
        if (res.success) await loadOrders();
        return res;
    };
    const allOrders = [
        ...pendingOrders.map((o) => ({ ...o, orderStatus: "Preparing" })),
        ...readyOrders.map((o) => ({ ...o, orderStatus: "Ready" }))
    ];



    return { pendingOrders, readyOrders, allOrders, loading, error, handleMarkReady, handleMarkPaid, reload: loadOrders };
}