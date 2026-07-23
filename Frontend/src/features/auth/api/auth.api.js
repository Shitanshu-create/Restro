import axios from "axios";
import { env } from "../../../components/config/env.js";



const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
    headers: ({ "Content-Type": "application/json" })
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
        return response.data;
    } catch (err) {
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