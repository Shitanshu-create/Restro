import { useState, useEffect, useCallback } from "react";
import kitchenApi from "../api/kitchenApi.js";

export function useKitchenOrders() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const [pendingRes, readyRes] = await Promise.all([
        kitchenApi.getPendingOrders(),
        kitchenApi.getReadyOrders(),
      ]);
      setPendingOrders(pendingRes.data.orders || []);
      setReadyOrders(readyRes.data.orders || []);
      setError(null);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function markReady(orderId) {
    try {
      await kitchenApi.updateOrderStatus(orderId);
      await fetchOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to mark ready" };
    }
  }

  async function markPaid(orderId) {
    try {
      await kitchenApi.markCashPaid(orderId);
      await fetchOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to mark as paid" };
    }
  }

  return { pendingOrders, readyOrders, loading, error, fetchOrders, markReady, markPaid };
}
