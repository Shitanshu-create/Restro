import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config/env.js";

// Auth pages
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import RegisterPage from "./features/auth/pages/RegisterPage.jsx";

// Admin pages
import AdminDashboard from "./features/admin/pages/AdminDashboard.jsx";
import AdminMenuPage from "./features/admin/pages/AdminMenuPage.jsx";
import AdminOrdersPage from "./features/admin/pages/AdminOrdersPage.jsx";
import AdminPaymentsPage from "./features/admin/pages/AdminPaymentsPage.jsx";
import AdminStaffPage from "./features/admin/pages/AdminStaffPage.jsx";

// Kitchen pages
import KitchenDashboard from "./features/kitchen/pages/KitchenDashboard.jsx";

// Customer pages
import LandingPage from "./pages/LandingPage.jsx";
import CustomerMenuPage from "./features/customers/pages/CustomerMenuPage.jsx";
import CustomerOrdersPage from "./features/customers/pages/CustomerOrdersPage.jsx";

function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--color-background)"
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--color-border)",
          borderTop: "3px solid var(--color-primary)",
          borderRadius: "50%", animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "admin" && !user.isAdmin) {
    const role = user.role;
    if (role === "chef" || role === "waiter") return <Navigate to="/kitchen" replace />;
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "kitchen") {
    const allowedRoles = ["admin", "chef", "waiter"];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer routes */}
        <Route path="/menu" element={<CustomerMenuPage />} />
        <Route path="/my-orders" element={<CustomerOrdersPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute requiredRole="admin">
            <AdminMenuPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute requiredRole="admin">
            <AdminOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPaymentsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute requiredRole="admin">
            <AdminStaffPage />
          </ProtectedRoute>
        } />

        {/* Kitchen routes */}
        <Route path="/kitchen" element={
          <ProtectedRoute requiredRole="kitchen">
            <KitchenDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
