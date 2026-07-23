import React from "react";
import "../styles/MyOrdersModal.css";
const MyOrdersModal = ({ isOpen, onClose, orders, loading, onRefresh }) => {
  if (!isOpen) return null;
  return (
    <div className="myorders-modal-backdrop" onClick={onClose}>
      <div className="myorders-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="myorders-header">
          <div className="myorders-title-group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2>My Orders & Live Status</h2>
          </div>
          <div className="myorders-header-actions">
            <button
              className="myorders-refresh-btn"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh order status"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={loading ? "spin-icon" : ""}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button className="myorders-close-btn" onClick={onClose} aria-label="Close orders modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="myorders-body">
          {loading && orders.length === 0 ? (
            <div className="myorders-empty-state">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="myorders-empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No active orders found</h3>
              <p>Place an order from the menu to track its preparation live!</p>
            </div>
          ) : (
            <div className="myorders-list">
              {orders.map((order) => {
                const itemsList = Array.isArray(order.items) ? order.items : [];
                return (
                  <div key={order.orderId} className="myorder-item-card">
                    <div className="myorder-card-header">
                      <div>
                        <span className="myorder-id">Order #{order.orderId}</span>
                        <span className="myorder-table">Table {order.tableNo}</span>
                      </div>
                      <span className={`myorder-status-pill status-${(order.orderStatus || "preparing").toLowerCase()}`}>
                        <span className="status-dot" />
                        {order.orderStatus === "Ready" ? "Ready for Service ✓" : "Preparing in Kitchen"}
                      </span>
                    </div>
                    <div className="myorder-items-list">
                      {itemsList.length > 0 ? (
                        itemsList.map((item, idx) => (
                          <div key={idx} className="myorder-item-row">
                            <span>{item.count || 1}x {item.name || item.itemId} ({item.quantity || "Full"})</span>
                            <span>${((Number(item.price) || 0) * (item.quantity === "Half" ? 0.5 : 1) * (Number(item.count) || 1)).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="myorder-item-row">
                          <span>Items</span>
                          <span>${Number(order.amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="myorder-card-footer">
                      <div className="myorder-payment-info">
                        <span className={`pay-pill ${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                          {order.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending Payment"}
                        </span>
                        <span className="pay-mode">({order.paymentMode || "Cash"})</span>
                      </div>
                      <strong className="myorder-total">${Number(order.amount || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MyOrdersModal;