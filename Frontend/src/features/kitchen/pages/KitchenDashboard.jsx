import { useState } from "react";
import SharedSidebar from "../../../components/SharedSidebar.jsx";
import OrderDetailModal from "../components/OrderDetailModal.jsx";
import { useKitchen } from "../hooks/useKitchen.js";
import "../styles/KitchenDashboard.css";
const KitchenDashboard = () => {
  const { allOrders, loading, error, handleMarkReady, handleMarkPaid, reload } = useKitchen();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const formattedOrders = allOrders.map((o) => {
    const itemsList = Array.isArray(o.items) ? o.items : [];
    const itemSummary = itemsList.length > 0
      ? itemsList.map((i) => `${i.name || i.itemId}${i.count ? ` x${i.count}` : ""}`).join(", ")
      : String(o.items || "");
    return {
      id: o.orderId,
      tableNo: o.tableNo,
      customer: `Cust #${o.customerId || "N/A"}`,
      items: itemSummary || "Food Items",
      itemsList,
      total: Number(o.amount || 0),
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      status: o.orderStatus || "Preparing",
      paymentStatus: o.paymentStatus || "Pending",
      paymentMode: o.paymentMode || "Cash",
      paidBy: o.paidBy,
      paidAt: o.paidAt
    };
  });
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
  const filteredOrders = formattedOrders.filter((o) => {
    if (statusFilter === "All") return true;
    return o.status.toLowerCase() === statusFilter.toLowerCase();
  });
  const preparingCount = formattedOrders.filter((o) => o.status === "Preparing").length;
  const readyCount = formattedOrders.filter((o) => o.status === "Ready").length;
  return (
    <div className="kitchen-shell">
      <SharedSidebar
        activePage="orders"
        onPageChange={() => {}}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        mode="kitchen"
      />


      <div className="kitchen-content-area">
        {/* Top Kitchen Header */}
        <header className="kitchen-header">
          <div className="kitchen-title-group">
            <button
              className="kitchen-hamburger-btn"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="kitchen-page-title">Kitchen Display Station (KDS)</h1>
              <p className="kitchen-page-sub">Live Order Queue & Preparation Control</p>
            </div>
          </div>


          <div className="kitchen-header-badges" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={reload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #cbd5e1)",
                background: "var(--color-bg-card, #ffffff)",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-text-title, #0f172a)",
                cursor: "pointer"
              }}
            >
              🔄 Refresh
            </button>
            <span className="live-pulse-badge">
              <span className="pulse-dot" /> Live Polling Active
            </span>
          </div>
        </header>


        {error && <div className="login-error" role="alert" style={{ margin: "16px auto", maxWidth: "1200px" }}>{error}</div>}
        <main className="kitchen-main-body">
          {/* Summary Stat Cards */}
          <div className="kitchen-summary-grid">
            <div className="k-stat-card stat-prep">
              <span className="k-stat-label">Preparing Now</span>
              <span className="k-stat-value">{preparingCount}</span>
            </div>
            <div className="k-stat-card stat-ready">
              <span className="k-stat-label">Ready for Service</span>
              <span className="k-stat-value">{readyCount}</span>
            </div>
            <div className="k-stat-card stat-speed">
              <span className="k-stat-label">Total Active Queue</span>
              <span className="k-stat-value">{formattedOrders.length}</span>
            </div>
          </div>
          {/* Filter Tabs */}
          <div className="kitchen-filter-tabs">
            {["All", "Preparing", "Ready"].map((tab) => (
              <button
                key={tab}
                className={`k-tab-btn ${statusFilter === tab ? "active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Kitchen Orders Cards Grid */}
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading live kitchen queue...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>No kitchen orders in queue.</div>
          ) : (
            <div className="kitchen-orders-grid">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`k-order-card k-card-${order.status.toLowerCase()}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="k-card-top-bar">
                    <span className="k-table-tag">{order.tableNo}</span>
                    <span className="k-time-tag">⏱ {order.time}</span>
                  </div>
                  <div className="k-card-mid-info">
                    <span className="k-order-num">Order #{order.id}</span>
                    <span className="k-customer-name">{order.customer}</span>
                    <p className="k-items-text">{order.items}</p>
                  </div>
                  <div className="k-card-meta-row">
                    <span className={`k-pay-badge ${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                      {order.paymentStatus === "Paid" ? "Paid" : "Pay at Counter"}
                    </span>
                    <span className="k-amount-tag">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="k-card-action-bar">
                    {order.status === "Preparing" && (
                      <button
                        className="k-act-btn btn-ready"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order.id, "Ready");
                        }}
                      >
                        Mark Ready ✓
                      </button>
                    )}
                    {order.status === "Ready" && (
                      <button
                        className="k-act-btn btn-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        View Order Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>


      </div>
      {/* Order Detail Modal */}
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
