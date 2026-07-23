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
    <div className="notifications-card">
      <div className="notif-header">
        <div>
          <h2 className="card-section-title">Notifications</h2>
          <p className="card-section-subtitle">Alerts that need attention</p>
        </div>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">All clear! No pending alerts.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notif-row notif-${n.type}`}>
              <div className="notif-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-detail">{n.detail}</div>
                <div className="notif-time">{n.time}</div>
              </div>
              <button className="notif-dismiss-btn" onClick={() => dismiss(n.id)}>
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default NotificationsPanel;