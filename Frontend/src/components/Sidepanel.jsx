import React, { useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import "./Sidepanel.css";
const Sidepanel = ({ activePage, onPageChange, isOpen, onClose, mode }) => {
  const { user } = useAuth();
  const userName = user?.name || "Admin Staff";
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : (user?.isAdmin ? "Admin" : "Staff");
  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";
  const allNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "orders",
      label: "Orders",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: "tables",
      label: "Tables",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18v3M20 18v3M4 11h16M3 7h18M5 7v4M19 7v4" />
        </svg>
      ),
    },
    {
      id: "payments",
      label: "Payments",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: "menu",
      label: "Menu",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "staffs",
      label: "Staffs",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];
  const navItems = mode === "kitchen" 
    ? allNavItems.filter((i) => i.id === "orders")
    : allNavItems;
  const handleNavClick = (id) => {
    if (onPageChange) {
      onPageChange(id);
    }
    if (onClose) {
      onClose();
    }
  };
  return (
    <>
      {/* Backdrop for mobile screen overlay */}
      <div 
        className={`sidepanel-backdrop ${isOpen ? "active" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidepanel ${isOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidepanel-header">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2L6 14" />
              <path d="M6 2l12 14" />
              <path d="M12 14v8" />
            </svg>
          </div>
          <span className="brand-title">Reztro</span>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Navigation Menu */}
        <div className="sidepanel-nav-section">
          <span className="nav-group-label">MAIN MENU</span>
          <nav className="sidepanel-menu">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={`sidepanel-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="sidepanel-icon">{item.icon}</span>
                  <span className="sidepanel-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidepanel-badge">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Footer Profile Section */}
        <div className="sidepanel-footer">
          <div className="profile-card">
            <div className="profile-avatar">{userInitials}</div>
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-role">{userRole}</span>
            </div>
          </div>
          <button className="theme-toggle-btn" title="Toggle Theme" aria-label="Toggle theme">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidepanel;