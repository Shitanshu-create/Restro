import { useState, useEffect, useCallback } from "react";
import customerApi from "../api/customerApi.js";

export function useMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    customerApi.getMenu()
      .then(res => { setMenu(res.data.menu || []); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || "Failed to load menu"); setLoading(false); });
  }, []);

  return { menu, loading, error };
}

export function useCart() {
  const [cart, setCart] = useState([]);

  function addToCart(item) {
    setCart(prev => {
      const key = `${item.id}-${item.quantity || "Full"}`;
      const idx = prev.findIndex(c => `${c.id}-${c.quantity || "Full"}` === key);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], count: updated[idx].count + 1 };
        return updated;
      }
      return [...prev, { ...item, count: 1 }];
    });
  }

  function removeFromCart(itemId, quantity) {
    setCart(prev => {
      const key = `${itemId}-${quantity || "Full"}`;
      const idx = prev.findIndex(c => `${c.id}-${c.quantity || "Full"}` === key);
      if (idx < 0) return prev;
      const updated = [...prev];
      if (updated[idx].count <= 1) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...updated[idx], count: updated[idx].count - 1 };
      }
      return updated;
    });
  }

  function clearCart() { setCart([]); }

  const total = cart.reduce((s, item) => s + item.price * item.count, 0);
  const itemCount = cart.reduce((s, item) => s + item.count, 0);

  return { cart, addToCart, removeFromCart, clearCart, total, itemCount };
}

export function useMyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await customerApi.getMyOrders();
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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

export function usePlaceOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function placeOrder(tableNo, items, paymentMode = "Cash") {
    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.placeOrder(tableNo, items, paymentMode);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }

  return { placeOrder, loading, error };
}
