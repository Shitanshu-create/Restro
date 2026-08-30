import "../styles/OrderDetailModal.css";

const OrderDetailModal = ({ order, onClose, onUpdateStatus, onMarkPaid }) => {
  if (!order) return null;
  const itemsList = Array.isArray(order.itemsList) ? order.itemsList : [];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="order-detail-card-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="order-modal-header">
          <div className="modal-title-group">
            <span className="modal-table-badge">{order.tableNo}</span>
            <div>
              <h2>Order #{order.id}</h2>
              <span className="modal-customer-subtitle">{order.customer} • {order.time}</span>
            </div>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Modal Body Info */}
        <div className="order-modal-body">
          {/* Status Badges Row */}
          <div className="meta-badges-row">
            <div className="meta-badge-group">
              <span className="meta-label">Kitchen Status</span>
              <span className={`status-pill status-${(order.status || "preparing").toLowerCase()}`}>
                <span className="status-dot" />
                {order.status}
              </span>
            </div>
            <div className="meta-badge-group">
              <span className="meta-label">Payment Status</span>
              <span className={`payment-pill ${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                {order.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending"}
              </span>
            </div>
            <div className="meta-badge-group">
              <span className="meta-label">Payment Method</span>
              <span className="method-pill">{order.paymentMode || "Cash"}</span>
            </div>
          </div>
          {order.paymentStatus === "Paid" && order.paidBy && (
            <div style={{ marginTop: "12px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", color: "#475569" }}>
              <strong>Settlement Info:</strong> Marked paid by <span>{order.paidBy}</span> {order.paidAt ? `at ${new Date(order.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
            </div>
          )}
          {/* Items Detail List */}
          <div className="order-items-detail-section">
            <h3>Ordered Items ({itemsList.length})</h3>
            <div className="items-table-list">
              {itemsList.length > 0 ? (
                itemsList.map((item, idx) => (
                  <div key={idx} className="item-detail-row">
                    <div className="item-qty-name">
                      <span className="qty-tag">{item.count || 1}x</span>
                      <span className="item-name">{item.name || item.itemId} ({item.quantity || "Full"})</span>
                    </div>
                    <span className="item-price">
                      ₹{((Number(item.price) || 0) * (item.quantity === "Half" ? 0.5 : 1) * (Number(item.count) || 1)).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="item-detail-row">
                  <div className="item-qty-name">
                    <span className="qty-tag">1x</span>
                    <span className="item-name">{order.items || "Dish"}</span>
                  </div>
                  <span className="item-price">₹{Number(order.total || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          {/* Total Price Row */}
          <div className="modal-total-price-row">
            <span>Total Order Amount</span>
            <strong>₹{Number(order.total || 0).toFixed(2)}</strong>
          </div>
        </div>
        {/* Modal Footer Actions */}
        <div className="order-modal-footer">
          <button className="btn-modal-close" onClick={onClose}>
            Close
          </button>
          {order.paymentStatus !== "Paid" && (
            <button
              className="btn-modal-action"
              style={{ background: "var(--color-green, #10b981)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "600", cursor: "pointer" }}
              onClick={() => onMarkPaid(order.id)}
            >
              Mark as Paid 💳
            </button>
          )}
          {order.status === "Preparing" && (
            <button
              className="btn-modal-action btn-mark-ready"
              onClick={() => onUpdateStatus(order.id, "Ready")}
            >
              Mark Order Ready ✓
            </button>
          )}
          {order.status === "Ready" && (
            <span style={{ fontSize: "13px", color: "var(--color-text-muted, #64748b)", fontWeight: "600" }}>
              ✓ Ready for Delivery
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default OrderDetailModal;