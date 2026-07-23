import axios from "axios";
import API_BASE_URL from "../../../config/env.js";

const customerApi = {
  createSession: (tableNo, name) =>
    axios.post(`${API_BASE_URL}/api/customer/session`, { tableNo, name }, { withCredentials: true }),
  getMenu: () =>
    axios.get(`${API_BASE_URL}/api/menu/getAll`, { withCredentials: true }),
  placeOrder: (tableNo, items, paymentMode) =>
    axios.post(`${API_BASE_URL}/api/customer/placeOrder`, { tableNo, items, paymentMode }, { withCredentials: true }),
  getMyOrders: () =>
    axios.get(`${API_BASE_URL}/api/customer/myOrders`, { withCredentials: true }),
  initiatePayment: (orderId) =>
    axios.post(`${API_BASE_URL}/api/payment/initiate`, { orderId }, { withCredentials: true }),
  verifyPayment: (data) =>
    axios.post(`${API_BASE_URL}/api/payment/verify`, data, { withCredentials: true }),
};

export default customerApi;
