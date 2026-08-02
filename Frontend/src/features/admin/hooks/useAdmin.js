import { useState, useEffect, useCallback } from "react";
import * as adminApi from "../api/admin.api.js";
export function useTables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadTables = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await adminApi.getAllTables();
        if (res.success) {
            setTables(res.tables || []);
        } else {
            setError(res.message);
        }
        setLoading(false);
    }, []);
    useEffect(() => {
        loadTables();
    }, [loadTables]);
    const handleCreateTable = async (capacity) => {
        const res = await adminApi.createTable(capacity);
        if (res.success) await loadTables();
        return res;
    };
    const handleRemoveTable = async (tableNumber) => {
        const res = await adminApi.removeTable(tableNumber);
        if (res.success) await loadTables();
        return res;
    };
    const handleSaveQr = async (tableNumber, qrImageBase64) => {
        const res = await adminApi.refreshTableQr(tableNumber, qrImageBase64);
        if (res.success) {
            setTables((prev) =>
                prev.map((t) => (t.tableNumber === tableNumber ? { ...t, qrImageBase64: res.qrImageBase64 } : t))
            );
        }
        return res;
    };
    const handleRegenerateQr = async (tableNumber) => {
        const res = await adminApi.regenerateTableQrToken(tableNumber);
        if (res.success) {
            setTables((prev) =>
                prev.map((t) => (t.tableNumber === tableNumber ? { ...t, qrToken: res.qrToken, qrImageBase64: null } : t))
            );
        }
        return res;
    };
    return { tables, loading, error, handleCreateTable, handleRemoveTable, handleSaveQr, handleRegenerateQr, reload: loadTables };
}
export function useMenu() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadMenu = useCallback(async () => {
        setLoading(true);
        setError(null);
        const [catRes, itemRes] = await Promise.all([
            adminApi.fetchAllCategories(),
            adminApi.fetchAllItems()
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (itemRes.success) setItems(itemRes.items || []);
        if (!catRes.success) setError(catRes.message);
        setLoading(false);
    }, []);
    useEffect(() => {
        loadMenu();
    }, [loadMenu]);
    const handleCreateItem = async (itemData) => {
        const res = await adminApi.createItem(itemData);
        if (res.success) await loadMenu();
        return res;
    };
    const handleCreateCategory = async (name) => {
        const res = await adminApi.createCategory(name);
        if (res.success) await loadMenu();
        return res;
    };
    const handleRemoveItem = async ({ id, name }) => {
        const res = await adminApi.removeItem({ id, name });
        if (res.success) await loadMenu();
        return res;
    };
    const handleRemoveCategory = async (name) => {
        const res = await adminApi.removeCategory(name);
        if (res.success) await loadMenu();
        return res;
    };
    const handleToggleAvailability = async ({ id, name }) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
            )
        );
        setCategories((prev) =>
            prev.map((cat) => ({
                ...cat,
                items: cat.items ? cat.items.map((item) =>
                    item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
                ) : []
            }))
        );

        const res = await adminApi.toggleItemAvailability({ id, name });
        if (!res.success) {
            await loadMenu();
        }
        return res;
    };
    const handleAssignItemToCategory = async ({ itemId, itemName, categoryName }) => {
        const res = await adminApi.addItemToCategory({ itemId, itemName, categoryName });
        if (res.success) await loadMenu();
        return res;
    };
    const handleRemoveItemFromCategory = async ({ itemId, itemName, categoryName }) => {
        const res = await adminApi.removeItemFromCategory({ itemId, itemName, categoryName });
        if (res.success) await loadMenu();
        return res;
    };
    const handleUpdateItemImage = async ({ id, name, image }) => {
        const res = await adminApi.updateItemImage({ id, name, image });
        if (res.success) await loadMenu();
        return res;
    };
    const handleUpdateMenuItem = async (itemData) => {
        const res = await adminApi.updateMenuItem(itemData);
        if (res.success) await loadMenu();
        return res;
    };
    const handleUpdateCategory = async ({ oldName, newName }) => {
        const res = await adminApi.updateCategory({ oldName, newName });
        if (res.success) await loadMenu();
        return res;
    };
    const handleReorderCategories = async (orderedCategoryNames) => {
        const res = await adminApi.reorderCategories(orderedCategoryNames);
        if (res.success) await loadMenu();
        return res;
    };
    const handleBulkOperations = async (bulkPayload) => {
        const res = await adminApi.bulkOperations(bulkPayload);
        if (res.success) await loadMenu();
        return res;
    };
    return {
        categories, items, loading, error,
        handleCreateItem, handleCreateCategory,
        handleRemoveItem, handleRemoveCategory,
        handleToggleAvailability, handleUpdateItemImage,
        handleUpdateMenuItem, handleUpdateCategory,
        handleReorderCategories, handleBulkOperations,
        handleAssignItemToCategory, handleRemoveItemFromCategory,
        reload: loadMenu
    };
}
export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await adminApi.getAllOrders();
        if (res.success) {
            setOrders(res.orders || []);
        } else {
            setError(res.message);
        }
        setLoading(false);
    }, []);

    
    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 180000);
        return () => clearInterval(interval);
    }, [loadOrders]);
    const handleMarkCashPaid = async (orderId) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.orderId === orderId ? { ...o, paymentStatus: "Paid", paymentMode: "Cash" } : o
            )
        );
        const res = await adminApi.markCashPaid(orderId);
        if (!res.success) await loadOrders();
        return res;
    };
    const handleMarkReady = async (orderId) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.orderId === orderId ? { ...o, orderStatus: "Ready" } : o
            )
        );
        const res = await adminApi.updateOrderStatus(orderId);
        if (!res.success) await loadOrders();
        return res;
    };
    const handleUpdateOrderStatus = async (orderId, targetStatus) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.orderId === orderId ? { ...o, orderStatus: targetStatus } : o
            )
        );
        const res = await adminApi.updateOrderStatus(orderId);
        if (!res.success) await loadOrders();
        return res;
    };


    return { orders, loading, error, handleMarkCashPaid, handleMarkReady, handleUpdateOrderStatus, reload: loadOrders };
}