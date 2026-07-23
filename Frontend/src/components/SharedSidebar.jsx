import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/env.js";
import "./SharedSidebar.css";

const adminNavItems = [
  { to: "/admin", icon: "📊", label: "Dashboard", end: true },
  { to: "/admin/menu", icon: "🍽️", label: "Menu" },
  { to: "/admin/orders", icon: "📋", label: "Orders" },
  { to: "/admin/payments", icon: "💳", label: "Payments" },
  { to: "/admin/staff", icon: "👥", label: "Staff" },
];

const kitchenNavItems = [
  { to: "/kitchen", icon: "👨‍🍳", label: "Kitchen", end: true },
];

function SharedSidebar({ role = "admin", user = null }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "admin" ? adminNavItems : kitchenNavItems;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate("/login");
    } catch {
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon">🍽️</span>
          <span className="sidebar__brand-name">Restro</span>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="sidebar__footer">
          {user && (
            <div className="sidebar__user">
              <div className="sidebar__user-avatar">{initials}</div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user.name}</div>
                <div className="sidebar__user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button
            className="sidebar__logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "..." : "🚪 Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

export default SharedSidebar;
