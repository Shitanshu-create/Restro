import axios from "axios";
import { env } from "../../../components/config/env.js";



const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
    headers: ({ "Content-Type": "application/json" })
});

// Attach stored token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});



function getAuthErrorMessages(err, fallback) {
    const validationMessages = err.response?.data?.errors?.map((error) => error.message).filter(Boolean);

    if (validationMessages?.length) {
        return validationMessages.join('. ');
    }
    return err.response?.data?.message || err.message || fallback;
};



export const registerUser = async (userData) => {
    try {
        const response = await api.post("/api/auth/register", userData);
        return response.data;
    } catch (err) {
        return {
            success: false,
            message: getAuthErrorMessages(err, "Registration failed")
        };
    }
}



export const loginUser = async (userData) => {
    try {
        const response = await api.post("/api/auth/login", userData);
        if (response.data?.token) {
            localStorage.setItem("auth_token", response.data.token);
        }
        return response.data;
    } catch (err) {
        return {
            success: false,
            message: getAuthErrorMessages(err, "Login failed")
        };
    }
}



export async function logoutUser() {
    try {
        const response = await api.post("/api/auth/logout", {});
        localStorage.removeItem("auth_token");
        return response.data;
    } catch (err) {
        localStorage.removeItem("auth_token");
        throw err;
    }
}



export async function getMe() {
    try {
        const response = await api.get("/api/auth/getMe", {});
        return response.data;
    } catch (err) {
        return null;
    }
}