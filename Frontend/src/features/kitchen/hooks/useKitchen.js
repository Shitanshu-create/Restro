import { useState, useEffect, useCallback, useRef } from "react";
import * as kitchenApi from "../api/kitchen.api.js";




export function useKitchen() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFirstLoad = useRef(true);
    const loadOrders = useCallback(async () => {
        const [pendingRes, readyRes] = await Promise.all([
            kitchenApi.getPendingOrders(),
            kitchenApi.getReadyOrders()
        ]);
        setError(null);
        if (pendingRes.success) setPendingOrders(pendingRes.orders || []);
        if (readyRes.success) setReadyOrders(readyRes.orders || []);
        if (!pendingRes.success) setError(pendingRes.message);
        setLoading(false);
        isFirstLoad.current = false;
    }, []);




    useEffect(() => {
        Promise.resolve().then(loadOrders);
        const interval = setInterval(loadOrders, 180000);
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