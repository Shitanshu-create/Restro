import axios from "axios";
import API_BASE_URL from "../../../config/env.js";

const adminApi = {
  // Menu
  getMenu: () => axios.get(`${API_BASE_URL}/api/menu/getAll`, { withCredentials: true }),
  addMenuItem: (data) => axios.post(`${API_BASE_URL}/api/menu/addItem`, data, { withCredentials: true }),
  updateMenuItem: (itemId, data) => axios.patch(`${API_BASE_URL}/api/menu/updateItem/${itemId}`, data, { withCredentials: true }),
  deleteMenuItem: (itemId) => axios.delete(`${API_BASE_URL}/api/menu/deleteItem/${itemId}`, { withCredentials: true }),
  getTopSelling: () => axios.get(`${API_BASE_URL}/api/menu/topSelling`, { withCredentials: true }),

  // Orders
  getAllOrders: () => axios.get(`${API_BASE_URL}/api/customer/allOrders`, { withCredentials: true }),
  getRevenueStats: () => axios.get(`${API_BASE_URL}/api/customer/revenueStats`, { withCredentials: true }),

  // Tables
  getAllTables: () => axios.get(`${API_BASE_URL}/api/tables/getAllTables`, { withCredentials: true }),
  createTable: (capacity) => axios.post(`${API_BASE_URL}/api/tables/createTable`, { capacity }, { withCredentials: true }),
  removeTable: (tableNumber) => axios.delete(`${API_BASE_URL}/api/tables/removeTable`, { data: { tableNumber }, withCredentials: true }),

  // Payments
  markCashPaid: (orderId) => axios.patch(`${API_BASE_URL}/api/payment/markCashPaid/${orderId}`, {}, { withCredentials: true }),
};

export default adminApi;
