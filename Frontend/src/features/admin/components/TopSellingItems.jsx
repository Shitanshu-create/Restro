import { useMemo } from "react";
import "../styles/TopSellingItems.css";

const TopSellingItems = ({ orders = [] }) => {
  const topItems = useMemo(() => {
    const itemMap = {};

    orders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const name = item.name || `Item #${item.itemId}`;
          const count = Number(item.count || 1);
          const price = Number(item.price || 0);
          const totalRev = price * count * (item.quantity === "Half" ? 0.5 : 1);

          if (!itemMap[name]) {
            itemMap[name] = { name, orders: 0, revenue: 0 };
          }
          itemMap[name].orders += count;
          itemMap[name].revenue += totalRev;
        });
      }
    });

    return Object.values(itemMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4)
      .map((item, idx) => ({
        rank: idx + 1,
        name: item.name,
        category: `${item.orders} orders`,
        revenue: `₹${item.revenue.toFixed(2)}`,
        change: "Top Seller"
      }));
  }, [orders]);

  return (
    <div className="top-items-card">
      <div className="top-items-header">
        <div>
          <h2 className="card-section-title">Top Selling Items</h2>
          <p className="card-section-subtitle">Best performers from orders</p>
        </div>
      </div>
      <div className="top-items-list">
        {topItems.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>No order items recorded yet</div>
        ) : (
          topItems.map((item) => (
            <div key={item.rank} className="top-item-row">
              <span className="top-item-rank">{item.rank}</span>
              <div className="top-item-icon-placeholder" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <div className="top-item-details">
                <span className="top-item-name">{item.name}</span>
                <span className="top-item-category">{item.category}</span>
              </div>
              <div className="top-item-revenue-col">
                <span className="top-item-revenue">{item.revenue}</span>
                <span className="top-item-change">{item.change}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default TopSellingItems;
