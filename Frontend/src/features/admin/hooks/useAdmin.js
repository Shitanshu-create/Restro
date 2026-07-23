import { useState, useEffect, useCallback } from "react";
import adminApi from "../api/adminApi.js";

export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await adminApi.getAllOrders();
      setOrders(res.data.orders || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getRevenueStats();
      setStats(res.data.stats);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async () => {
    try {
      const res = await adminApi.getAllTables();
      setTables(res.data.tables || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  async function addTable(capacity = 4) {
    try {
      await adminApi.createTable(capacity);
      await fetchTables();
      return true;
    } catch (err) {
      return false;
    }
  }

  async function deleteTable(tableNumber) {
    try {
      await adminApi.removeTable(tableNumber);
      await fetchTables();
      return true;
    } catch (err) {
      return false;
    }
  }

  return { tables, loading, error, addTable, deleteTable, refetch: fetchTables };
}

export function useAdminMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await adminApi.getMenu();
      setMenu(res.data.menu || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  async function addItem(data) {
    try {
      await adminApi.addMenuItem(data);
      await fetchMenu();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to add item" };
    }
  }

  async function updateItem(itemId, data) {
    try {
      await adminApi.updateMenuItem(itemId, data);
      await fetchMenu();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update item" };
    }
  }

  async function deleteItem(itemId) {
    try {
      await adminApi.deleteMenuItem(itemId);
      await fetchMenu();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete item" };
    }
  }

  return { menu, loading, error, addItem, updateItem, deleteItem, refetch: fetchMenu };
}

export function useTopSelling() {
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getTopSelling()
      .then(res => setTopSelling(res.data.topSelling || []))
      .catch(() => setTopSelling([]))
      .finally(() => setLoading(false));
  }, []);

  return { topSelling, loading };
}

export function useMarkPaid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function markPaid(orderId) {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.markCashPaid(orderId);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to mark as paid";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }

  return { markPaid, loading, error };
}
