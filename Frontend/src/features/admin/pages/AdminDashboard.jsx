import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SharedSidebar from "../../../components/SharedSidebar.jsx";
import { useAdminStats, useAdminTables, useAdminOrders, useTopSelling } from "../hooks/useAdmin.js";
import API_BASE_URL from "../../../config/env.js";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { tables, loading: tablesLoading } = useAdminTables();
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useAdminOrders();
  const { topSelling, loading: topLoading } = useTopSelling();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => setCurrentUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const liveOrders = orders.filter(o => o.orderStatus !== "Cancelled");
  const preparingOrders = orders.filter(o => o.orderStatus === "Preparing");
  const availableTables = tables.filter(t => !t.isOccupied);
  const occupiedTables = tables.filter(t => t.isOccupied);

  function formatAmount(n) {
    return `₹${Number(n || 0).toLocaleString("en-IN")}`;
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="admin-layout">
      <SharedSidebar role="admin" user={currentUser} />

      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Dashboard</h1>
            <p className="admin-topbar__sub">Welcome back, {currentUser?.name || "Admin"}</p>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__refresh" onClick={() => { refetchStats(); refetchOrders(); }}>
              ↻ Refresh
            </button>
            <div className="admin-topbar__avatar">{initials}</div>
          </div>
        </header>

        <div className="admin-content">
          {/* Stat cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--orange">💰</div>
              <div>
                <div className="admin-stat-card__value">{statsLoading ? "..." : formatAmount(stats?.totalRevenue)}</div>
                <div className="admin-stat-card__label">Total Revenue</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--blue">📋</div>
              <div>
                <div className="admin-stat-card__value">{statsLoading ? "..." : stats?.totalOrders ?? 0}</div>
                <div className="admin-stat-card__label">Total Orders</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--green">✅</div>
              <div>
                <div className="admin-stat-card__value">{statsLoading ? "..." : stats?.paidOrders ?? 0}</div>
                <div className="admin-stat-card__label">Paid Orders</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--yellow">⏳</div>
              <div>
                <div className="admin-stat-card__value">{statsLoading ? "..." : stats?.pendingOrders ?? 0}</div>
                <div className="admin-stat-card__label">Preparing</div>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="admin-dashboard-grid">
            {/* Revenue Chart */}
            <div className="admin-card admin-chart-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Revenue Trend (7 Days)</h2>
              </div>
              <div className="admin-chart-wrap">
                {statsLoading ? (
                  <div className="admin-loading-placeholder">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats?.last7Days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE5" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#777" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#777" }} tickFormatter={v => `₹${v}`} />
                      <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FF7A1A"
                        strokeWidth={2.5}
                        dot={{ fill: "#FF7A1A", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Selling */}
            <div className="admin-card admin-top-selling-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">🔥 Top Selling Items</h2>
              </div>
              {topLoading ? (
                <div className="admin-loading-placeholder">Loading...</div>
              ) : topSelling.length === 0 ? (
                <div className="admin-empty">No data yet</div>
              ) : (
                <div className="admin-top-selling-list">
                  {topSelling.map((item, i) => (
                    <div key={i} className="admin-top-selling-item">
                      <div className="admin-top-selling-item__rank">#{i + 1}</div>
                      <div className="admin-top-selling-item__info">
                        <div className="admin-top-selling-item__name">{item.name}</div>
                        <div className="admin-top-selling-item__meta">{item.count} orders · {formatAmount(item.revenue)}</div>
                      </div>
                      <div className="admin-top-selling-item__bar">
                        <div
                          className="admin-top-selling-item__bar-fill"
                          style={{ width: `${Math.min(100, (item.count / (topSelling[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Orders */}
            <div className="admin-card admin-live-orders-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Live Orders</h2>
                <span className="admin-badge admin-badge--orange">{preparingOrders.length} Preparing</span>
              </div>
              <div className="admin-live-orders-list">
                {ordersLoading ? (
                  <div className="admin-loading-placeholder">Loading orders...</div>
                ) : liveOrders.length === 0 ? (
                  <div className="admin-empty">No active orders</div>
                ) : (
                  liveOrders.slice(0, 8).map(order => (
                    <div key={order.orderId} className="admin-order-row" onClick={() => navigate("/admin/orders")}>
                      <div className="admin-order-row__left">
                        <span className="admin-order-row__id">#{order.orderId}</span>
                        <span className="admin-order-row__table">T-{order.tableNo}</span>
                      </div>
                      <div className="admin-order-row__right">
                        <span className={`admin-status-badge admin-status-badge--${order.orderStatus === "Preparing" ? "preparing" : "ready"}`}>
                          {order.orderStatus}
                        </span>
                        <span className="admin-order-row__amount">{formatAmount(order.amount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {liveOrders.length > 8 && (
                <button className="admin-card__see-all" onClick={() => navigate("/admin/orders")}>
                  View all {liveOrders.length} orders →
                </button>
              )}
            </div>

            {/* Tables */}
            <div className="admin-card admin-tables-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Tables</h2>
                <button className="admin-btn-sm" onClick={() => navigate("/admin/staff")}>Manage</button>
              </div>
              <div className="admin-tables-summary">
                <div className="admin-tables-stat">
                  <span className="admin-tables-stat__num">{tables.length}</span>
                  <span className="admin-tables-stat__label">Total</span>
                </div>
                <div className="admin-tables-stat">
                  <span className="admin-tables-stat__num admin-tables-stat__num--green">{availableTables.length}</span>
                  <span className="admin-tables-stat__label">Available</span>
                </div>
                <div className="admin-tables-stat">
                  <span className="admin-tables-stat__num admin-tables-stat__num--orange">{occupiedTables.length}</span>
                  <span className="admin-tables-stat__label">Occupied</span>
                </div>
              </div>
              <div className="admin-tables-grid">
                {tablesLoading ? (
                  <div className="admin-loading-placeholder">Loading tables...</div>
                ) : tables.length === 0 ? (
                  <div className="admin-empty">No tables yet</div>
                ) : (
                  tables.map(table => (
                    <div
                      key={table._id}
                      className={`admin-table-chip ${table.isOccupied ? "admin-table-chip--occupied" : "admin-table-chip--free"}`}
                    >
                      <span className="admin-table-chip__num">{table.tableNumber}</span>
                      <span className="admin-table-chip__status">{table.isOccupied ? "●" : "○"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
