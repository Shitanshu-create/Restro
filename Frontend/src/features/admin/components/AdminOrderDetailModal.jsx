import React from "react";
import "../../kitchen/styles/OrderDetailModal.css";
const AdminOrderDetailModal = ({ order, onClose, onMarkPaid, onMarkReady }) => {
    if (!order) return null;
    const itemsList = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.itemsList)
            ? order.itemsList
            : [];
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="order-detail-card-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="order-modal-header">
                    <div className="modal-title-group">
                        <span className="modal-table-badge">Table {order.tableNo}</span>
                        <div>
                            <h2>Order #{order.orderId || order.id}</h2>
                            <span className="modal-customer-subtitle">
                                Customer: {order.customerId || "N/A"} • Ordered at {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                            </span>
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
                            <span className={`status-pill status-${(order.orderStatus || order.status || "preparing").toLowerCase()}`}>
                                <span className="status-dot" />
                                {order.orderStatus || order.status}
                            </span>
                        </div>
                        <div className="meta-badge-group">
                            <span className="meta-label">Payment Status</span>
                            <span className={`payment-pill ${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                                {order.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending"}
                            </span>
                        </div>
                        <div className="meta-badge-group">
                            <span className="meta-label">Payment Mode</span>
                            <span className="method-pill">{order.paymentMode || "Cash"}</span>
                        </div>
                    </div>
                    {/* Timeline & Audit Info */}
                    <div style={{ marginTop: "16px", background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#334155" }}>
                        <div>
                            <strong>Ordered Time:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                        </div>
                        <div>
                            <strong>Ordered By (Customer):</strong> {order.customerId || "Walk-in Guest"}
                        </div>
                        {order.paymentStatus === "Paid" && (
                            <div>
                                <strong>Payment Settlement:</strong> Settled via {order.paymentMode || "Cash"}{" "}
                                {order.paidBy ? `(Marked paid by staff: ${order.paidBy})` : order.razorpayPaymentId ? `(Razorpay ID: ${order.razorpayPaymentId})` : ""}
                                {order.paidAt ? ` on ${new Date(order.paidAt).toLocaleString()}` : ""}
                            </div>
                        )}
                    </div>
                    {/* Items Detail List */}
                    <div className="order-items-detail-section" style={{ marginTop: "20px" }}>
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
                                            ${((Number(item.price) || 0) * (item.quantity === "Half" ? 0.5 : 1) * (Number(item.count) || 1)).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="item-detail-row">
                                    <div className="item-qty-name">
                                        <span className="qty-tag">1x</span>
                                        <span className="item-name">{typeof order.items === "string" ? order.items : "Dish Item"}</span>
                                    </div>
                                    <span className="item-price">${Number(order.amount || order.total || 0).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Total Price Row */}
                    <div className="modal-total-price-row">
                        <span>Total Order Amount</span>
                        <strong>${Number(order.amount || order.total || 0).toFixed(2)}</strong>
                    </div>
                </div>
                {/* Modal Footer Actions */}
                <div className="order-modal-footer">
                    <button className="btn-modal-close" onClick={onClose}>
                        Close
                    </button>
                    {onMarkPaid && order.paymentStatus !== "Paid" && (
                        <button
                            className="btn-modal-action"
                            style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "600", cursor: "pointer" }}
                            onClick={() => onMarkPaid(order.orderId || order.id)}
                        >
                            Mark Paid 💳
                        </button>
                    )}
                    {onMarkReady && (order.orderStatus === "Preparing" || order.status === "Preparing") && (
                        <button
                            className="btn-modal-action btn-mark-ready"
                            onClick={() => onMarkReady(order.orderId || order.id)}
                        >
                            Mark Ready ✓
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default AdminOrderDetailModal;