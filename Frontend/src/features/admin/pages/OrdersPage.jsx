import React, { useState } from "react";
import { useOrders } from "../hooks/useAdmin.js";
import AdminOrderDetailModal from "../components/AdminOrderDetailModal.jsx";
import "../styles/OrdersPage.css";
const STATUS_TABS = ["All", "Preparing", "Ready"];
const OrdersPage = () => {
  const { orders, loading, error, handleMarkCashPaid, handleMarkReady, reload } = useOrders();
  const [activeStatus, setActiveStatus] = useState("All");
  const [viewMode, setViewMode] = useState("List");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const formattedOrders = orders.map((o) => {
    const itemSummary = Array.isArray(o.items)
      ? o.items.map((i) => `${i.name || i.itemId}${i.quantity ? ` (${i.quantity})` : ""}`).join(", ")
      : String(o.items || "");
    return {
      raw: o,
      id: o.orderId,
      tableNo: o.tableNo,
      customer: `Customer ${o.customerId || ""}`,
      items: itemSummary || "Order items",
      status: o.orderStatus || "Preparing",
      paymentStatus: o.paymentStatus,
      paymentMode: o.paymentMode,
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      total: Number(o.amount || 0)
    };
  });
  const statusCounts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === "All" ? formattedOrders.length : formattedOrders.filter((o) => o.status === s).length;
    return acc;
  }, {});
  const filtered = formattedOrders.filter((o) => {
    const matchStatus = activeStatus === "All" || o.status === activeStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.customer.toLowerCase().includes(q) ||
      o.items.toLowerCase().includes(q) ||
      String(o.tableNo).toLowerCase().includes(q) ||
      String(o.id).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  const actionFor = (order) => {
    if (order.status === "Preparing") {
      return (
        <button className="o-btn btn-mark-ready" onClick={(e) => { e.stopPropagation(); handleMarkReady(order.id); }}>
          Mark Ready
        </button>
      );
    }
    if (order.paymentMode === "Cash" && order.paymentStatus === "Pending") {
      return (
        <button className="o-btn btn-accept" onClick={(e) => { e.stopPropagation(); handleMarkCashPaid(order.id); }}>
          Mark Paid
        </button>
      );
    }
    return <span className="o-btn btn-done-muted">Ready</span>;
  };
  return (
    <div className="orders-page">
      {/* Top bar */}
      <div className="orders-topbar">
        <div className="orders-search-box">
          <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="orders-search-input"
            type="text"
            placeholder="Search table, dish, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="orders-actions-group">
          <div className="orders-view-toggle">
            {["List", "Board"].map((v) => (
              <button key={v} className={`view-toggle-btn ${viewMode === v ? "active" : ""}`} onClick={() => setViewMode(v)}>
                {v === "List"
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                }
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={reload}
            className="orders-refresh-btn"
          >
            🔄 Refresh Orders
          </button>
        </div>
      </div>
      {error && <div className="login-error" role="alert">{error}</div>}
      {/* Status filter tabs */}
      <div className="orders-status-tabs">
        {STATUS_TABS.map((s) => (
          <button key={s} className={`status-tab-btn ${activeStatus === s ? "active" : ""}`} onClick={() => setActiveStatus(s)}>
            {s}
            {statusCounts[s] > 0 && <span className="tab-count">{statusCounts[s]}</span>}
          </button>
        ))}
      </div>
      {/* Content */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading live orders...</div>
      ) : viewMode === "List" ? (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>TABLE</th>
                <th>PAYMENT</th>
                <th>ITEMS</th>
                <th>STATUS</th>
                <th>TIME</th>
                <th>TOTAL</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="empty-table-row">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="order-table-row"
                    onClick={() => setSelectedOrder(order.raw)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="order-id-cell">#{order.id}</td>
                    <td className="order-table-cell">{order.tableNo}</td>
                    <td className="order-customer-cell">{order.paymentMode || "Cash"} ({order.paymentStatus})</td>
                    <td className="order-items-cell">
                      <span className="order-items-truncate">{order.items}</span>
                    </td>
                    <td>
                      <span className={`status-pill-sm pill-${order.status.toLowerCase()}`}>
                        <span className="status-dot-sm" />
                        {order.status}
                      </span>
                    </td>
                    <td className="order-time-cell">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {order.time}
                    </td>
                    <td className="order-total-cell">${order.total.toFixed(2)}</td>
                    <td className="order-action-cell">
                      <div className="order-action-row">
                        {actionFor(order)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Board View */
        <div className="orders-board">
          {["Preparing", "Ready"].map((col) => {
            const colOrders = filtered.filter((o) => o.status === col);
            return (
              <div key={col} className="board-column">
                <div className={`board-col-header board-col-${col.toLowerCase()}`}>
                  <span>{col}</span>
                  <span className="board-col-count">{colOrders.length}</span>
                </div>
                <div className="board-col-cards">
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="board-card"
                      onClick={() => setSelectedOrder(order.raw)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="board-card-top">
                        <span className="board-card-id">#{order.id}</span>
                        <span className="board-card-table">{order.tableNo}</span>
                      </div>
                      <div className="board-card-customer">{order.paymentMode || "Cash"} - {order.paymentStatus}</div>
                      <div className="board-card-items">{order.items}</div>
                      <div className="board-card-footer">
                        <span className="board-card-total">${order.total.toFixed(2)}</span>
                        <span className="board-card-time">{order.time}</span>
                      </div>
                      <div className="board-card-actions">
                        {actionFor(order)}
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && <div className="board-col-empty">No orders</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedOrder && (
        <AdminOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onMarkPaid={async (id) => {
            await handleMarkCashPaid(id);
            setSelectedOrder(null);
          }}
          onMarkReady={async (id) => {
            await handleMarkReady(id);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};
export default OrdersPage;