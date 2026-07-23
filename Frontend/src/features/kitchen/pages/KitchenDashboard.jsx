import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useKitchenOrders } from "../hooks/useKitchen.js";
import API_BASE_URL from "../../../config/env.js";
import "./KitchenDashboard.css";

function OrderCard({ order, onMarkReady, onMarkPaid, isReady = false }) {
  const [readyLoading, setReadyLoading] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleMarkReady() {
    setReadyLoading(true);
    const res = await onMarkReady(order.orderId);
    setReadyLoading(false);
    if (res.success) showToast("Order marked as Ready!");
    else showToast(res.message, "error");
  }

  async function handleMarkPaid() {
    setPaidLoading(true);
    const res = await onMarkPaid(order.orderId);
    setPaidLoading(false);
    if (res.success) showToast("Payment recorded!");
    else showToast(res.message, "error");
  }

  const timeAgo = (date) => {
    if (!date) return "";
    const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  return (
    <div className={`kitchen-order-card ${isReady ? "kitchen-order-card--ready" : "kitchen-order-card--preparing"}`}>
      {toast && (
        <div className={`kitchen-toast kitchen-toast--${toast.type}`}>{toast.msg}</div>
      )}
      <div className="kitchen-order-card__header">
        <div className="kitchen-order-card__id">#{order.orderId}</div>
        <div className="kitchen-order-card__table">Table {order.tableNo}</div>
        <div className="kitchen-order-card__time">{timeAgo(order.createdAt)}</div>
      </div>

      <div className="kitchen-order-card__items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="kitchen-order-item">
            <span className={`kitchen-order-item__dot ${item.isVeg ? "veg" : "nonveg"}`} />
            <span className="kitchen-order-item__name">{item.name}</span>
            {item.quantity && item.quantity !== "Full" && (
              <span className="kitchen-order-item__qty"> · {item.quantity}</span>
            )}
            <span className="kitchen-order-item__count">×{item.count || 1}</span>
          </div>
        ))}
      </div>

      <div className="kitchen-order-card__footer">
        <div className="kitchen-order-card__meta">
          <div className="kitchen-order-card__amount">₹{order.amount}</div>
          <div className={`kitchen-payment-status kitchen-payment-status--${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
            {order.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending"}
          </div>
        </div>

        <div className="kitchen-order-card__actions">
          {!isReady && (
            <button
              className="kitchen-btn kitchen-btn--ready"
              onClick={handleMarkReady}
              disabled={readyLoading}
            >
              {readyLoading ? "..." : "✓ Mark Ready"}
            </button>
          )}
          {order.paymentStatus !== "Paid" && (
            <button
              className="kitchen-btn kitchen-btn--pay"
              onClick={handleMarkPaid}
              disabled={paidLoading}
            >
              {paidLoading ? "..." : "💵 Mark Paid"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function KitchenDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("preparing");
  const { pendingOrders, readyOrders, loading, error, fetchOrders, markReady, markPaid } = useKitchenOrders();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => setCurrentUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleLogout() {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } finally {
      navigate("/login");
    }
  }

  return (
    <div className="kitchen-layout">
      {/* Top bar */}
      <header className="kitchen-topbar">
        <div className="kitchen-topbar__brand">
          <span className="kitchen-topbar__icon">🍽️</span>
          <span className="kitchen-topbar__name">Restro Kitchen</span>
        </div>
        <div className="kitchen-topbar__center">
          <button
            className={`kitchen-tab ${activeTab === "preparing" ? "kitchen-tab--active" : ""}`}
            onClick={() => setActiveTab("preparing")}
          >
            🔥 Preparing
            {pendingOrders.length > 0 && (
              <span className="kitchen-tab__badge">{pendingOrders.length}</span>
            )}
          </button>
          <button
            className={`kitchen-tab ${activeTab === "ready" ? "kitchen-tab--active" : ""}`}
            onClick={() => setActiveTab("ready")}
          >
            ✅ Ready
            {readyOrders.length > 0 && (
              <span className="kitchen-tab__badge kitchen-tab__badge--green">{readyOrders.length}</span>
            )}
          </button>
        </div>
        <div className="kitchen-topbar__right">
          <button className="kitchen-refresh-btn" onClick={fetchOrders} title="Refresh orders">
            ↻
          </button>
          <div className="kitchen-topbar__user">
            <div className="kitchen-topbar__avatar">{initials}</div>
            <div className="kitchen-topbar__user-info">
              <div className="kitchen-topbar__user-name">{currentUser?.name}</div>
              <div className="kitchen-topbar__user-role">{currentUser?.role}</div>
            </div>
          </div>
          <button className="kitchen-logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </header>

      {/* Main content */}
      <main className="kitchen-main">
        {loading ? (
          <div className="kitchen-loading">
            <div className="kitchen-spinner" />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="kitchen-error">
            <p>{error}</p>
            <button className="kitchen-btn kitchen-btn--ready" onClick={fetchOrders}>Retry</button>
          </div>
        ) : (
          <>
            {activeTab === "preparing" && (
              <>
                {pendingOrders.length === 0 ? (
                  <div className="kitchen-empty">
                    <div className="kitchen-empty__icon">🎉</div>
                    <h2 className="kitchen-empty__title">No pending orders</h2>
                    <p className="kitchen-empty__sub">All caught up! New orders will appear here.</p>
                  </div>
                ) : (
                  <div className="kitchen-orders-grid">
                    {pendingOrders.map(order => (
                      <OrderCard
                        key={order.orderId}
                        order={order}
                        onMarkReady={markReady}
                        onMarkPaid={markPaid}
                        isReady={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "ready" && (
              <>
                {readyOrders.length === 0 ? (
                  <div className="kitchen-empty">
                    <div className="kitchen-empty__icon">📋</div>
                    <h2 className="kitchen-empty__title">No ready orders</h2>
                    <p className="kitchen-empty__sub">Orders marked as ready will show here.</p>
                  </div>
                ) : (
                  <div className="kitchen-orders-grid">
                    {readyOrders.map(order => (
                      <OrderCard
                        key={order.orderId}
                        order={order}
                        onMarkReady={markReady}
                        onMarkPaid={markPaid}
                        isReady={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default KitchenDashboard;
