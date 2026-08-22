import React, { useState, useMemo } from "react";
import OrderDetailModal from "../components/OrderDetailModal.jsx";
import { useKitchen } from "../hooks/useKitchen.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import "../styles/KitchenDashboard.css";

const KitchenDashboard = () => {
  const { allOrders, loading, error, handleMarkReady, handleMarkPaid, reload } = useKitchen();
  const { handleLogout } = useAuth();

  const [activeTab, setActiveTab] = useState("incomplete"); // "incomplete" or "completed"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [acceptedOrderIds, setAcceptedOrderIds] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format order data
  const formattedOrders = useMemo(() => {
    return allOrders.map((o) => {
      const itemsList = Array.isArray(o.items)
        ? o.items
        : Array.isArray(o.itemsList)
          ? o.itemsList
          : [];

      // Extract raw table number e.g. "T-01" -> "t-01"
      const rawTable = String(o.tableNo || "").trim();
      const formattedTable = rawTable
        ? rawTable.toLowerCase().startsWith("t-")
          ? rawTable.toLowerCase()
          : `t-${rawTable.toLowerCase().replace(/^t/, "")}`
        : "t-01";

      const formattedTime = o.createdAt
        ? new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "13:17 PM";

      return {
        id: o.orderId || o.id,
        tableNo: formattedTable,
        orderNumber: o.orderId || o.id || "xxxx",
        customer: o.customerId ? `Cust #${o.customerId}` : "Customer",
        itemsList,
        total: Number(o.amount || o.total || 0),
        time: formattedTime,
        status: o.orderStatus || o.status || "Preparing",
        paymentStatus: o.paymentStatus || "Pending",
        paymentMode: o.paymentMode || "Cash",
        paidBy: o.paidBy,
        paidAt: o.paidAt
      };
    });
  }, [allOrders]);

  // Tab Filtering: Incomplete vs Completed
  const displayedOrders = useMemo(() => {
    if (activeTab === "completed") {
      return formattedOrders.filter((o) => o.status === "Ready");
    }
    // "incomplete" includes Preparing & any unready orders
    return formattedOrders.filter((o) => o.status !== "Ready");
  }, [formattedOrders, activeTab]);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await reload();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleAcceptOrder = (e, orderId) => {
    e.stopPropagation();
    setAcceptedOrderIds((prev) => new Set(prev).add(orderId));
  };

  const handleMarkOrderReady = async (e, orderId) => {
    e.stopPropagation();
    await handleMarkReady(orderId);
    setAcceptedOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === "Ready") {
      await handleMarkReady(orderId);
    }
    setSelectedOrder(null);
  };

  const handleMarkAsPaid = async (orderId) => {
    await handleMarkPaid(orderId);
    setSelectedOrder(null);
  };

  // Helper to format item display name e.g. "french fries (small)"
  const getItemDisplayLabel = (item) => {
    const name = (item.name || item.itemId || "Dish").toLowerCase();
    const qty = item.quantity && item.quantity !== "Full" ? ` (${item.quantity.toLowerCase()})` : "";
    return `${name}${qty}`;
  };

  return (
    <div className="kds-app-container">
      {/* ── Top Controls Bar ── */}
      <header className="kds-top-bar">
        <div className="kds-left-controls">
          {/* Incomplete Tab */}
          <button
            type="button"
            className={`kds-tab-pill ${activeTab === "incomplete" ? "active" : ""}`}
            onClick={() => setActiveTab("incomplete")}
          >
            Incomplete
          </button>

          {/* Completed Tab */}
          <button
            type="button"
            className={`kds-tab-pill ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            completed
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            className={`kds-icon-btn kds-refresh-btn ${isRefreshing ? "spinning" : ""}`}
            onClick={handleRefreshClick}
            title="Refresh Orders"
            aria-label="Refresh Orders"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        {/* Right Logout Button */}
        <div className="kds-right-controls">
          <button
            type="button"
            className="kds-logout-btn"
            onClick={handleLogout}
            title="Logout from KDS"
          >
            <span>Logout</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {error && <div className="kds-error-banner" role="alert">{error}</div>}

      {/* ── Main KDS Orders Grid ── */}
      <main className="kds-content-body">
        {loading ? (
          <div className="kds-empty-state">
            <div className="kds-loading-spinner" />
            <p>Loading live kitchen orders...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="kds-empty-state">
            <p>No {activeTab} orders at the moment.</p>
          </div>
        ) : (
          <div className="kds-orders-grid">
            {displayedOrders.map((order) => {
              const isAccepted = acceptedOrderIds.has(order.id);
              const isReady = order.status === "Ready";

              return (
                <article
                  key={order.id}
                  className="kds-order-card"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Top Row: Table Number & Time */}
                  <div className="kds-card-header">
                    <span className="kds-table-title">{order.tableNo}</span>
                    <span className="kds-order-time">{order.time}</span>
                  </div>

                  {/* Order Number */}
                  <div className="kds-order-sub">
                    Order #{order.orderNumber}
                  </div>

                  {/* Main Content: Food Ordered + Quantity */}
                  <div className="kds-items-list">
                    {order.itemsList.length > 0 ? (
                      order.itemsList.map((item, idx) => (
                        <div key={idx} className="kds-item-row">
                          <span className="kds-item-name">
                            {getItemDisplayLabel(item)}
                          </span>
                          <span className="kds-item-qty">
                            x{item.count || 1}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="kds-item-row">
                        <span className="kds-item-name">food items</span>
                        <span className="kds-item-qty">x1</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Action Button */}
                  <div className="kds-card-footer">
                    {isReady ? (
                      <span className="kds-ready-badge">
                        Ready ✓
                      </span>
                    ) : isAccepted ? (
                      <button
                        type="button"
                        className="kds-action-btn btn-mark-ready"
                        onClick={(e) => handleMarkOrderReady(e, order.id)}
                      >
                        Mark Ready
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="kds-action-btn btn-accept"
                        onClick={(e) => handleAcceptOrder(e, order.id)}
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Order Detail Modal (for reviewing extra details or settlement) */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onMarkPaid={handleMarkAsPaid}
        />
      )}
    </div>
  );
};

export default KitchenDashboard;
