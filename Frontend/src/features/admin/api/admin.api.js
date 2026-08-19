import axios from "axios";
import { env } from "../../../config/env.js";




const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});


function getErrorMessage(err, fallback) {
    return err.response?.data?.message || err.message || fallback;
}




// ── Tables ──────────────────────────────────────────────────────────────────
export const getAllTables = async () => {
    try {
        const res = await api.get("/api/admin/getAllTables");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch tables") };
    }
};


export const createTable = async (capacity) => {
    try {
        const res = await api.post("/api/admin/createTable", { capacity });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to create table") };
    }
};



export const removeTable = async (tableNumber) => {
    try {
        const res = await api.delete("/api/admin/removeTable", { data: { tableNumber } });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to remove table") };
    }
};


/*
export const refreshTableQr = async (tableNumber, qrImageBase64) => {
    try {
        const res = await api.patch("/api/admin/refreshQr", { tableNumber, qrImageBase64 });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to save QR image") };
    }
};

export const regenerateTableQrToken = async (tableNumber) => {
    try {
        const res = await api.patch("/api/admin/regenerateQr", { tableNumber });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to regenerate QR token") };
    }
};
*/

export const toggleTableAvailability = async (tableNumber) => {
    try {
        const res = await api.patch("/api/admin/toggleTableAvailability", { tableNumber });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to toggle table availability") };
    }
};



// ── Menu - Categories ────────────────────────────────────────────────────────
export const fetchAllCategories = async () => {
    try {
        const res = await api.get("/api/admin/fetchAllCategories");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch categories") };
    }
};



export const createCategory = async (name) => {
    try {
        const res = await api.post("/api/admin/createCategory", { name });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to create category") };
    }
};



export const removeCategory = async (name) => {
    try {
        const res = await api.delete("/api/admin/removeCategory", { data: { name } });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to remove category") };
    }
};




// ── Menu - Items ─────────────────────────────────────────────────────────────
export const fetchAllItems = async () => {
    try {
        const res = await api.get("/api/admin/fetchAllItems");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch items") };
    }
};



export const createItem = async (itemData) => {
    try {
        const res = await api.post("/api/admin/createItem", itemData);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to create item") };
    }
};



export const removeItem = async ({ id, name }) => {
    try {
        const res = await api.delete("/api/admin/removeItem", { data: { id, name } });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to remove item") };
    }
};



export const toggleItemAvailability = async ({ id, name }) => {
    try {
        const res = await api.patch("/api/admin/toggleItemAvailability", { id, name });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to toggle availability") };
    }
};

export const updateItemImage = async ({ id, name, image }) => {
    try {
        const res = await api.patch("/api/admin/updateItemImage", { id, name, image });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to update item image") };
    }
};

export const updateMenuItem = async (itemData) => {
    try {
        const res = await api.patch("/api/admin/updateMenuItem", itemData);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to update item") };
    }
};

export const updateCategory = async ({ oldName, newName }) => {
    try {
        const res = await api.patch("/api/admin/updateCategory", { oldName, newName });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to rename category") };
    }
};

export const reorderCategories = async (orderedCategoryNames) => {
    try {
        const res = await api.post("/api/admin/reorderCategories", { orderedCategoryNames });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to reorder categories") };
    }
};

export const bulkOperations = async (bulkPayload) => {
    try {
        const res = await api.post("/api/admin/bulkOperations", bulkPayload);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to perform bulk operation") };
    }
};



export const addItemToCategory = async ({ itemId, itemName, categoryName }) => {
    try {
        const res = await api.post("/api/admin/addItemToCategory", { itemId, itemName, categoryName });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to assign item to category") };
    }
};



export const removeItemFromCategory = async ({ itemId, itemName, categoryName }) => {
    try {
        const res = await api.post("/api/admin/removeItemFromCategory", { itemId, itemName, categoryName });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to remove item from category") };
    }
};




// ── Orders ───────────────────────────────────────────────────────────────────
export const getAllOrders = async (params = {}) => {
    try {
        const res = await api.get("/api/admin/getAllOrders", { params });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch orders") };
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


export const updateOrderStatus = async (orderId) => {
    try {
        const res = await api.patch(`/api/kitchen/updateOrderStatus/${orderId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to update order status") };
    }
};


// ── Staff ────────────────────────────────────────────────────────────────────
export const getAllStaff = async () => {
    try {
        const res = await api.get("/api/auth/staff");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch staff") };
    }
};

export const toggleStaffApproval = async (staffId) => {
    try {
        const res = await api.patch(`/api/auth/staff/${staffId}/approve`);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to toggle staff approval") };
    }
};

export const removeStaff = async (staffId) => {
    try {
        const res = await api.delete(`/api/auth/staff/${staffId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to remove staff") };
    }
};

export const getAllReviews = async (params = {}) => {
    try {
        const res = await api.get("/api/reviews/getAllReviews", { params });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch reviews") };
    }
};

// ── Banners ──────────────────────────────────────────────────────────────────
export const fetchAllBanners = async () => {
    try {
        const res = await api.get("/api/admin/fetchAllBanners");
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to fetch banners") };
    }
};

export const createBanner = async (bannerData) => {
    try {
        const res = await api.post("/api/admin/createBanner", bannerData);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to create banner") };
    }
};

export const updateBanner = async (bannerData) => {
    try {
        const res = await api.patch("/api/admin/updateBanner", bannerData);
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to update banner") };
    }
};

export const removeBanner = async (bannerId) => {
    try {
        const res = await api.delete("/api/admin/removeBanner", { data: { id: bannerId } });
        return res.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to remove banner") };
    }
};

