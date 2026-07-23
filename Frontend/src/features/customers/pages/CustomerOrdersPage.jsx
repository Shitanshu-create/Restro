import { Link } from "react-router-dom";
import { useMyOrders } from "../hooks/useCustomer.js";
import "./CustomerOrdersPage.css";

function CustomerOrdersPage() {
  const { orders, loading, error, refetch } = useMyOrders();

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  }

  function statusColor(s) {
    if (s === "Paid") return "paid";
    if (s === "Ready") return "ready";
    if (s === "Preparing") return "preparing";
    if (s === "Pending") return "pending";
    return "pending";
  }

  return (
    <div className="my-orders-page">
      <header className="my-orders-header">
        <Link to="/menu" className="my-orders-back">← Menu</Link>
        <h1 className="my-orders-title">My Orders</h1>
        <button className="my-orders-refresh" onClick={refetch}>↻</button>
      </header>

      <div className="my-orders-content">
        {loading ? (
          <div className="my-orders-loading">
            <div className="my-orders-spinner" />
          </div>
        ) : error ? (
          <div className="my-orders-empty">
            <p style={{ color: "var(--color-error)" }}>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="my-orders-empty">
            <div className="my-orders-empty__icon">📋</div>
            <p>No orders yet. <Link to="/menu" style={{ color: "var(--color-primary)" }}>Browse the menu</Link></p>
          </div>
        ) : (
          <div className="my-orders-list">
            {orders.map(order => (
              <div key={order._id} className="my-order-card">
                <div className="my-order-card__header">
                  <div className="my-order-card__id">Order #{order.orderId}</div>
                  <div className="my-order-card__date">{formatDate(order.createdAt)}</div>
                </div>

                <div className="my-order-card__meta">
                  <span className="my-order-card__table">Table {order.tableNo}</span>
                  <span className={`my-order-status my-order-status--${statusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`my-order-status my-order-status--${statusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="my-order-card__items">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="my-order-item">
                      <span className={`my-order-item__dot ${item.isVeg ? "veg" : "nonveg"}`} />
                      <span className="my-order-item__name">{item.name}</span>
                      <span className="my-order-item__count">×{item.count || 1}</span>
                      <span className="my-order-item__price">₹{item.price * (item.count || 1)}</span>
                    </div>
                  ))}
                </div>

                <div className="my-order-card__footer">
                  <div className="my-order-card__total">Total: <strong>₹{order.amount}</strong></div>
                  {order.paymentStatus !== "Paid" && (
                    <div className="my-order-card__pay-hint">
                      💡 Pay at Counter
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerOrdersPage;
