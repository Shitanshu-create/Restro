import React, { useState } from "react";
import "../styles/NotificationsPanel.css";

const initialNotifications = [
  {
    id: 1,
    type: "info",
    title: "Table 14 Requested Waiter Assistance",
    detail: "QR Scan call button activated for drink refill",
    time: "3 mins ago",
  },
  {
    id: 2,
    type: "warning",
    title: "Kitchen Rush Alert (>15 mins delay)",
    detail: "Order #406 Chef Tasting Menu preparation peak",
    time: "12 mins ago",
  },
  {
    id: 3,
    type: "info",
    title: "Inventory Alert: Wagyu Beef Low Stock",
    detail: "Remaining portions: 4 (Auto-reorder triggered)",
    time: "25 mins ago",
  },
];

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notif-card-attachment">
      <div className="notif-card-header">
        <h2 className="notif-card-title">notification</h2>
        <span className="notif-feed-tag">Live Operational Feed</span>
      </div>
      <div className="notif-card-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">All clear! No active notifications.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notif-item-row notif-${n.type}`}>
              <div className="notif-circle-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="notif-item-content">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-sub">{n.detail}</div>
              </div>
              <div className="notif-item-right">
                <span className="notif-item-time">{n.time}</span>
                <button type="button" className="notif-btn-dismiss" onClick={() => dismiss(n.id)}>
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;