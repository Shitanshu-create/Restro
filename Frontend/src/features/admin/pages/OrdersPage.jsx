import { useState } from "react";
import { useOrders } from "../hooks/useAdmin.js";
import AdminOrderDetailModal from "../components/AdminOrderDetailModal.jsx";
import OrderHistoryModal from "../components/OrderHistoryModal.jsx";
import "../styles/OrdersPage.css";
import { getPresetRange } from "../components/DateRangeFilter.jsx";

const STATUS_TABS = ["All", "Preparing", "Ready"];

const OrdersPage = () => {
  const { orders, loading, error, handleMarkCashPaid, handleMarkReady, handleUpdateOrderStatus, reload } = useOrders();
  const [activeStatus, setActiveStatus] = useState("All");
  const [viewMode, setViewMode] = useState("List");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [dateRange, setDateRange] = useState(() => getPresetRange("today"));
  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const formattedOrders = orders.map((o) => {
    const itemSummary = Array.isArray(o.items)
      ? o.items.map((i) => `${i.name || i.itemId}${i.quantity && i.quantity !== "Full" ? ` (${i.quantity})` : ""}`).join(", ")
      : String(o.items || "");

    let status = o.orderStatus || "Preparing";

    return {
      raw: o,
      id: String(o.orderId || o._id),
      tableNo: o.tableNo,
      customer: o.customerName || `Customer ${o.customerId || ""}`,
      items: itemSummary || "Order items",
      status,
      paymentStatus: o.paymentStatus || "Pending",
      paymentMode: o.paymentMode || "Cash",
      createdAt: o.createdAt,
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      total: Number(o.amount || o.total || 0)
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

    let matchDate = true;
    if (dateRange.from && dateRange.to && o.createdAt) {
      const orderDate = new Date(o.createdAt);
      matchDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    }

    return matchStatus && matchSearch && matchDate;
  });

  const periodRevenue = filtered.reduce((sum, o) => sum + o.total, 0);

  // --- Non-glitchy HTML5 Drag & Drop Handlers ---
  const handleDragStart = (e, orderId) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData("text/plain", String(orderId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeave = (e, colStatus) => {
    // Only reset if exiting the column element itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColumn === colStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggedOrderId || e.dataTransfer.getData("text/plain");
    setDragOverColumn(null);
    setDraggedOrderId(null);

    if (id) {
      // Optimistic UI update check
      const targetOrder = formattedOrders.find((o) => String(o.id) === String(id));
      if (targetOrder && targetOrder.status !== targetStatus) {
        await handleUpdateOrderStatus(id, targetStatus);
      }
    }
  };

  const actionFor = (order) => {
    if (order.status === "Preparing" || order.status === "Incoming") {
      return (
        <button
          className="o-btn btn-mark-ready"
          onClick={(e) => { e.stopPropagation(); handleMarkReady(order.id); }}
        >
          Mark Ready
        </button>
      );
    }
    if (order.paymentMode === "Cash" && order.paymentStatus === "Pending") {
      return (
        <button
          className="o-btn btn-accept"
          onClick={(e) => { e.stopPropagation(); handleMarkCashPaid(order.id); }}
        >
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
          {/* Single Order History Button */}
          <button
            type="button"
            className="order-history-btn"
            onClick={() => setShowHistoryModal(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Order History
          </button>

          <div className="orders-view-toggle">
            {["Board", "List"].map((v) => (
              <button
                key={v}
                className={`view-toggle-btn ${viewMode === v ? "active" : ""}`}
                onClick={() => setViewMode(v)}
              >
                {v === "List"
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                }
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={reload}
            className="orders-refresh-btn"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh Orders
          </button>
        </div>
      </div>

      {error && <div className="login-error" role="alert">{error}</div>}

      {/* Status filter tabs */}
      <div className="orders-status-tabs">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            className={`status-tab-btn ${activeStatus === s ? "active" : ""}`}
            onClick={() => setActiveStatus(s)}
          >
            {s}
            {statusCounts[s] > 0 && <span className="tab-count">{statusCounts[s]}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading live orders...</div>
      ) : viewMode === "Board" ? (
        /* Kanban Board View with Drag & Drop */
        <div className="orders-board-kanban">
          {["Preparing", "Ready"].map((colStatus) => {
            const colOrders = filtered.filter((o) => o.status === colStatus);
            return (
              <div
                key={colStatus}
                className={`kanban-column ${dragOverColumn === colStatus ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, colStatus)}
                onDragLeave={(e) => handleDragLeave(e, colStatus)}
                onDrop={(e) => handleDrop(e, colStatus)}
              >
                <div className={`kanban-col-header status-${colStatus.toLowerCase()}`}>
                  <div className="col-header-left">
                    <span className="col-dot" />
                    <span className="col-title">{colStatus}</span>
                  </div>
                  <span className="col-badge-count">{colOrders.length}</span>
                </div>
                <div className="kanban-col-cards">
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      onClick={() => setSelectedOrder(order.raw)}
                    >
                      <div className="kanban-card-top">
                        <span className="kanban-table-badge">Table {order.tableNo}</span>
                        <span className="kanban-order-id">#{order.id}</span>
                      </div>
                      <div className="kanban-card-customer">{order.customer}</div>
                      <div className="kanban-card-items">{order.items}</div>
                      <div className="kanban-card-footer">
                        <span className="kanban-card-amount">${order.total.toFixed(2)}</span>
                        <span className="kanban-card-time">{order.time}</span>
                      </div>
                      <div className="kanban-card-actions">
                        {actionFor(order)}
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div className="kanban-col-empty">
                      Drop orders here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="orders-table-wrapper" style={{ overflowX: "auto", width: "100%" }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>TABLE</th>
                <th className="hide-mobile">PAYMENT</th>
                <th>ITEMS</th>
                <th>STATUS</th>
                <th className="hide-mobile">TIME</th>
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
                    <td className="order-customer-cell hide-mobile">{order.paymentMode || "Cash"} ({order.paymentStatus})</td>
                    <td className="order-items-cell">
                      <span className="order-items-truncate">{order.items}</span>
                    </td>
                    <td>
                      <span className={`status-pill-sm pill-${order.status.toLowerCase()}`}>
                        <span className="status-dot-sm" />
                        {order.status}
                      </span>
                    </td>
                    <td className="order-time-cell hide-mobile">
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
      )}

      {/* Admin Order Detail Modal */}
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

      {/* Order History Filter Modal */}
      <OrderHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        statusFilter={activeStatus}
        onStatusFilterChange={setActiveStatus}
        totalCount={filtered.length}
        totalRevenue={periodRevenue}
      />
    </div>
  );
};

export default OrdersPage;