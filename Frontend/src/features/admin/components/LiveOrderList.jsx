import React, { useState } from "react";
import "../styles/LiveOrdersList.css";
const initialLiveOrders = [
  {
    id: 409,
    tableNo: 12,
    customer: "Alex Rivera",
    items: "Truffle Wagyu Burger, Smoked Caramel Latte",
    total: 38.5,
    time: "2m ago",
    status: "Incoming",
  },
  {
    id: 408,
    tableNo: 8,
    customer: "Sarah Jenkins",
    items: "Artisanal Woodfired Pizza x2, Pinot Noir",
    total: 54.0,
    time: "8m ago",
    status: "Preparing",
  },
  {
    id: 407,
    tableNo: 19,
    customer: "Marcus Vance",
    items: "Matcha Souffle Pancake, Espresso",
    total: 21.5,
    time: "14m ago",
    status: "Ready",
  },
  {
    id: 406,
    tableNo: 4,
    customer: "Elena Rostova",
    items: "Chef Special Tasting Menu, Sparkling Water",
    total: 120.0,
    time: "18m ago",
    status: "Preparing",
  },
];
const LiveOrdersList = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState(initialLiveOrders);
  const tabs = ["All", "Incoming", "Preparing", "Ready"];
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All") return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });
  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };
  return (
    <div className="live-orders-card">
      <div className="live-orders-header">
        <div className="live-orders-title-group">
          <h2 className="card-section-title">Live Orders</h2>
          <p className="card-section-subtitle">Kitchen queue and service handoff</p>
        </div>
        <div className="live-orders-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`live-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="live-orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-orders-msg">No orders in this status</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="live-order-row">
              <div className="table-badge">
                <span className="tbl-label">TBL</span>
                <span className="tbl-num">{order.tableNo}</span>
              </div>
              <div className="order-main-details">
                <div className="order-meta-header">
                  <span className="order-number">#{order.id}</span>
                  <span className="customer-name">{order.customer}</span>
                </div>
                <div className="order-items-text">{order.items}</div>
              </div>
              <div className="order-price-time">
                <span className="order-amount-text">
                  ${order.total.toFixed(2)}
                </span>
                <span className="order-time-stamp">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {order.time}
                </span>
              </div>
              <div className="order-status-badge-container">
                <span className={`status-pill status-${order.status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {order.status}
                </span>
              </div>
              <div className="order-action-btn-container">
                {order.status === "Incoming" && (
                  <button
                    className="action-btn btn-accept"
                    onClick={() => handleStatusChange(order.id, "Preparing")}
                  >
                    Accept
                  </button>
                )}
                {order.status === "Preparing" && (
                  <button
                    className="action-btn btn-ready"
                    onClick={() => handleStatusChange(order.id, "Ready")}
                  >
                    Ready
                  </button>
                )}
                {order.status === "Ready" && (
                  <button
                    className="action-btn btn-served"
                    onClick={() => handleStatusChange(order.id, "Delivered")}
                  >
                    Served
                  </button>
                )}
                {order.status === "Delivered" && (
                  <button className="action-btn btn-outline" disabled>
                    Done
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default LiveOrdersList;
