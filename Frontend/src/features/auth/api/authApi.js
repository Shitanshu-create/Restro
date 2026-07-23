import axios from "axios";
import API_BASE_URL from "../../../config/env.js";

const authApi = {
  login: (email, password) =>
    axios.post(`${API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true }),

  register: (name, email, password, role) =>
    axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password, role }, { withCredentials: true }),

  logout: () =>
    axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true }),

  getMe: () =>
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true }),

  getAllStaff: () =>
    axios.get(`${API_BASE_URL}/api/auth/staff`, { withCredentials: true }),

  approveStaff: (staffId) =>
    axios.patch(`${API_BASE_URL}/api/auth/staff/${staffId}/approve`, {}, { withCredentials: true }),

  removeStaff: (staffId) =>
    axios.delete(`${API_BASE_URL}/api/auth/staff/${staffId}`, { withCredentials: true }),
};

export default authApi;
