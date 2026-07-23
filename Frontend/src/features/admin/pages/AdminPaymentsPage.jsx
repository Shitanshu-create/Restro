import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedSidebar from "../../../components/SharedSidebar.jsx";
import { useAdminOrders, useMarkPaid } from "../hooks/useAdmin.js";
import API_BASE_URL from "../../../config/env.js";
import "../styles/AdminDashboard.css";
import "../styles/AdminOrdersPage.css";

function PaymentDetailModal({ order, onClose, onMarkPaid, markPaidLoading }) {
  if (!order) return null;

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">Payment — Order #{order.orderId}</h2>
          <button className="admin-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-modal__section">
            <div className="admin-modal__row">
              <span className="admin-modal__key">Table</span>
              <span className="admin-modal__val">{order.tableNo}</span>
            </div>
            <div className="admin-modal__row">
              <span className="admin-modal__key">Customer ID</span>
              <span className="admin-modal__val">{order.customerId}</span>
            </div>
            <div className="admin-modal__row">
              <span className="admin-modal__key">Amount</span>
              <span className="admin-modal__val" style={{ fontWeight: 700, color: "var(--color-primary)" }}>₹{order.amount}</span>
            </div>
            <div className="admin-modal__row">
              <span className="admin-modal__key">Payment Mode</span>
              <span className="admin-modal__val">{order.paymentMode || "—"}</span>
            </div>
            <div className="admin-modal__row">
              <span className="admin-modal__key">Payment Status</span>
              <span className={`admin-status-badge admin-status-badge--${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paidBy && (
              <div className="admin-modal__row">
                <span className="admin-modal__key">Marked Paid By</span>
                <span className="admin-modal__val">{order.paidBy}</span>
              </div>
            )}
            {order.paidAt && (
              <div className="admin-modal__row">
                <span className="admin-modal__key">Paid At</span>
                <span className="admin-modal__val">{formatDate(order.paidAt)}</span>
              </div>
            )}
            <div className="admin-modal__row">
              <span className="admin-modal__key">Ordered At</span>
              <span className="admin-modal__val">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="admin-modal__divider" />

          <div className="admin-modal__items">
            <h3 className="admin-modal__subtitle">Items</h3>
            {(order.items || []).map((item, i) => (
              <div key={i} className="admin-modal__item">
                <div className="admin-modal__item-name">
                  <span className={`veg-dot ${item.isVeg ? "veg-dot--veg" : "veg-dot--nonveg"}`} />
                  {item.name}
                </div>
                <div className="admin-modal__item-price">
                  {item.count > 1 && <span className="admin-modal__item-count">×{item.count}</span>}
                  ₹{item.price * (item.count || 1)}
                </div>
              </div>
            ))}
            <div className="admin-modal__total">
              <span>Total</span>
              <span>₹{order.amount}</span>
            </div>
          </div>

          {order.paymentStatus !== "Paid" && (
            <button
              className="admin-modal__action-btn"
              onClick={() => onMarkPaid(order.orderId)}
              disabled={markPaidLoading}
            >
              {markPaidLoading ? "Processing..." : "✓ Mark as Paid (Cash)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPaymentsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { orders, loading, error, refetch } = useAdminOrders();
  const { markPaid, loading: markPaidLoading } = useMarkPaid();
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => setCurrentUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const filtered = orders.filter(o => {
    const matchSearch = !search || String(o.orderId).includes(search) || String(o.tableNo).includes(search);
    const matchFilter = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = orders.filter(o => o.paymentStatus === "Paid").reduce((s, o) => s + o.amount, 0);
  const pendingRevenue = orders.filter(o => o.paymentStatus === "Pending").reduce((s, o) => s + o.amount, 0);

  async function handleMarkPaid(orderId) {
    const res = await markPaid(orderId);
    if (res.success) {
      refetch();
      setSelectedOrder(prev => prev ? { ...prev, paymentStatus: "Paid", paidBy: currentUser?.name, paidAt: new Date().toISOString() } : null);
    }
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="admin-layout">
      <SharedSidebar role="admin" user={currentUser} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Payments</h1>
            <p className="admin-topbar__sub">{orders.length} total transactions</p>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__refresh" onClick={refetch}>↻ Refresh</button>
            <div className="admin-topbar__avatar">
              {currentUser?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AD"}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* Payment summary cards */}
          <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--green">💰</div>
              <div>
                <div className="admin-stat-card__value">₹{totalRevenue.toLocaleString("en-IN")}</div>
                <div className="admin-stat-card__label">Collected</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--yellow">⏳</div>
              <div>
                <div className="admin-stat-card__value">₹{pendingRevenue.toLocaleString("en-IN")}</div>
                <div className="admin-stat-card__label">Pending</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--blue">✅</div>
              <div>
                <div className="admin-stat-card__value">{orders.filter(o => o.paymentStatus === "Paid").length}</div>
                <div className="admin-stat-card__label">Paid Orders</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--orange">🔔</div>
              <div>
                <div className="admin-stat-card__value">{orders.filter(o => o.paymentStatus === "Pending").length}</div>
                <div className="admin-stat-card__label">Unpaid</div>
              </div>
            </div>
          </div>

          <div className="admin-orders-toolbar">
            <input
              className="admin-orders-search"
              type="text"
              placeholder="Search by order ID or table..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="admin-orders-toolbar__right">
              <select
                className="admin-orders-filter"
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-placeholder">Loading payments...</div>
          ) : error ? (
            <div className="admin-empty" style={{ color: "var(--color-error)" }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">No payment records found</div>
          ) : (
            <div className="admin-card">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Table</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Paid By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order.orderId} className="admin-orders-row" onClick={() => setSelectedOrder(order)}>
                      <td className="admin-orders-row__id">#{order.orderId}</td>
                      <td>{order.tableNo}</td>
                      <td style={{ fontWeight: 600 }}>₹{order.amount}</td>
                      <td>{order.paymentMode || "—"}</td>
                      <td>
                        <span className={`admin-status-badge admin-status-badge--${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="admin-orders-row__date">{order.paidBy || "—"}</td>
                      <td className="admin-orders-row__date">{formatDate(order.paidAt || order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <PaymentDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onMarkPaid={handleMarkPaid}
          markPaidLoading={markPaidLoading}
        />
      )}
    </div>
  );
}

export default AdminPaymentsPage;
