import React from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import "../styles/DashboardHeader.css";
const DashboardHeader = ({ title, subtitle, onToggleMobileMenu }) => {
  const { user } = useAuth();
  const userName = user?.name || "Admin Staff";
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : (user?.isAdmin ? "Admin" : "Staff");
  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";
  return (
    <header className="dashboard-header">
      <div className="header-title-section">
        <button
          className="hamburger-toggle-btn"
          onClick={onToggleMobileMenu}
          aria-label="Open sidebar menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="header-text">
          <h1 className="page-main-title">{title}</h1>
        </div>
      </div>
      <div className="header-right-user">
        <div className="user-profile-badge">
          <div className="user-avatar-circle">{userInitials}</div>
          <div className="user-text-info">
            <span className="user-display-name">{userName}</span>
            <span className="user-role-tag">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default DashboardHeader;