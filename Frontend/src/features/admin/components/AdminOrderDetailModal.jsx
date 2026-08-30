import "../../kitchen/styles/OrderDetailModal.css";

const AdminOrderDetailModal = ({ order, onClose, onMarkPaid, onMarkReady }) => {
    if (!order) return null;

    const itemsList = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.itemsList)
            ? order.itemsList
            : [];

    const tableDisplay = String(order.tableNo || "").replace("T-", "");
    const orderIdDisplay = order.orderId || order.id || "N/A";
    const customerDisplay = order.customerName || order.customer || `Cust #${order.customerId || "01"}`;
    const orderTimeDisplay = order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "Just now";

    const totalAmount = Number(order.amount || order.total || 0).toFixed(2);
    const kitchenStatus = order.orderStatus || order.status || "Preparing";
    const paymentStatus = order.paymentStatus || "Pending";
    const paymentMethod = order.paymentMode || "Cash";

    return (
        <div className="saas-modal-backdrop" onClick={onClose}>
            <div className="saas-order-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="saas-modal-header">
                    <div className="saas-header-left">
                        <div className="premium-table-badge">
                            <span className="table-badge-label">TABLE</span>
                            <span className="table-badge-num">{tableDisplay}</span>
                        </div>
                        <div className="saas-header-meta">
                            <div className="saas-order-id-row">
                                <h2>Order #{orderIdDisplay}</h2>
                            </div>
                            <div className="saas-customer-time">
                                <span>{customerDisplay}</span>
                                <span className="meta-dot">•</span>
                                <span>Ordered at {orderTimeDisplay}</span>
                            </div>
                        </div>
                    </div>
                    <button className="saas-modal-close-btn" onClick={onClose} aria-label="Close modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Status Section: 3 Equal Weight Cards */}
                <div className="saas-status-grid">
                    <div className="saas-status-card">
                        <span className="saas-status-label">KITCHEN STATUS</span>
                        <div className={`saas-status-value status-${kitchenStatus.toLowerCase()}`}>
                            <span className="saas-status-dot" />
                            <span>{kitchenStatus}</span>
                        </div>
                    </div>
                    <div className="saas-status-card">
                        <span className="saas-status-label">PAYMENT STATUS</span>
                        <div className={`saas-status-value payment-${paymentStatus.toLowerCase()}`}>
                            <span className="saas-status-dot" />
                            <span>{paymentStatus}</span>
                        </div>
                    </div>
                    <div className="saas-status-card">
                        <span className="saas-status-label">PAYMENT METHOD</span>
                        <div className="saas-status-value method-value">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <span>{paymentMethod}</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Settlement & Audit Info Card */}
                <div className="saas-info-card" style={{
                    margin: "16px 0",
                    padding: "14px 18px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "13px"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b", fontWeight: "600" }}>Ordered Time:</span>
                        <strong style={{ color: "#0f172a" }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                        </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b", fontWeight: "600" }}>Ordered By (Customer):</span>
                        <strong style={{ color: "#0f172a" }}>{customerDisplay}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b", fontWeight: "600" }}>Payment Settlement:</span>
                        <strong style={{ color: paymentStatus === "Paid" ? "#15803d" : "#c2410c" }}>
                            {paymentMethod === "Online" || paymentMethod === "UPI"
                                ? "Settled via Online"
                                : paymentStatus === "Paid"
                                    ? `Payment Received by ${order.paidBy || "Staff"}`
                                    : "Pending Cash Collection"}
                        </strong>
                    </div>
                </div>

                {/* Ordered Items List */}
                <div className="saas-items-section">
                    <h3 className="saas-section-title">Ordered Items ({itemsList.length || 1})</h3>
                    <div className="saas-items-list">
                        {itemsList.length > 0 ? (
                            itemsList.map((item, idx) => (
                                <div key={idx} className="saas-item-row">
                                    <div className="saas-item-left">
                                        <span className="subtle-qty-badge">{item.count || 1}x</span>
                                        <span className="saas-item-name">{item.name || item.itemId}</span>
                                        {item.quantity && item.quantity !== "Full" && (
                                            <span className="item-variant-tag">{item.quantity}</span>
                                        )}
                                    </div>
                                    <span className="saas-item-price">
                                        ${((Number(item.price) || 0) * (item.quantity === "Half" ? 0.5 : 1) * (Number(item.count) || 1)).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="saas-item-row">
                                <div className="saas-item-left">
                                    <span className="subtle-qty-badge">1x</span>
                                    <span className="saas-item-name">{typeof order.items === "string" ? order.items : "Dish Item"}</span>
                                </div>
                                <span className="saas-item-price">${totalAmount}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Total Amount Card */}
                <div className="saas-total-card">
                    <span className="saas-total-label">Total Amount</span>
                    <span className="saas-total-value">${totalAmount}</span>
                </div>

                {/* Footer Actions (Hierarchy: Mark Ready > Mark Paid > Close) */}
                <div className="saas-modal-footer">
                    <button type="button" className="saas-btn-close" onClick={onClose}>
                        Close
                    </button>
                    {onMarkPaid && paymentStatus !== "Paid" && (
                        <button
                            type="button"
                            className="saas-btn-secondary"
                            onClick={() => onMarkPaid(order.orderId || order.id)}
                        >
                            Mark Paid
                        </button>
                    )}
                    {onMarkReady && (kitchenStatus === "Preparing" || kitchenStatus === "Incoming") && (
                        <button
                            type="button"
                            className="saas-btn-primary"
                            onClick={() => onMarkReady(order.orderId || order.id)}
                        >
                            Mark Ready
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailModal;