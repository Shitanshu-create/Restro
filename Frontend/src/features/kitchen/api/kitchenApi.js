import axios from "axios";
import API_BASE_URL from "../../../config/env.js";

const kitchenApi = {
  getPendingOrders: () =>
    axios.get(`${API_BASE_URL}/api/kitchen/getPendingOrders`, { withCredentials: true }),
  getReadyOrders: () =>
    axios.get(`${API_BASE_URL}/api/kitchen/getReadyOrders`, { withCredentials: true }),
  updateOrderStatus: (orderId) =>
    axios.patch(`${API_BASE_URL}/api/kitchen/updateOrderStatus/${orderId}`, {}, { withCredentials: true }),
  markCashPaid: (orderId) =>
    axios.patch(`${API_BASE_URL}/api/payment/markCashPaid/${orderId}`, {}, { withCredentials: true }),
};

export default kitchenApi;
