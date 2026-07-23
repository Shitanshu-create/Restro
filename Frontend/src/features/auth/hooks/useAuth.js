import { useState } from "react";
import authApi from "../api/authApi.js";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error, setError };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function register(name, email, password, role) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authApi.register(name, email, password, role);
      setSuccess(res.data.message);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { register, loading, error, success, setError };
}

export function useLogout() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setLoading(false);
    }
  }

  return { logout, loading };
}
