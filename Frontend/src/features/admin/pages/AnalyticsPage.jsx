import React, { useState, useMemo } from "react";
import { useOrders, useMenu } from "../hooks/useAdmin.js";
import DateRangeFilter, { getPresetRange } from "../components/DateRangeFilter.jsx";
import "../styles/AnalyticsPage.css";

/* ─── Shared SVG chart helper ─── */
const buildCurvedPath = (pts) => {
  if (!pts || pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    const cx1 = x1 + (x2 - x1) / 3;
    const cx2 = x2 - (x2 - x1) / 3;
    d += ` C ${cx1},${y1} ${cx2},${y2} ${x2},${y2}`;
  }
  return d;
};
const buildFill = (pts, height) => {
  if (!pts || pts.length < 2) return "";
  return buildCurvedPath(pts) + ` L ${pts[pts.length - 1][0]},${height} L ${pts[0][0]},${height} Z`;
};

const XLABELS = ["12am", "4am", "8am", "12pm", "4pm", "8pm", "12am"];
const W = 560; const H = 160;

const SparklineChart = ({ points, color, fillId, gradientStart }) => {
  const line = buildCurvedPath(points);
  const fill = buildFill(points, H);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="analytics-sparkline" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} stopOpacity="0.3" />
          <stop offset="100%" stopColor={gradientStart} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1="0" y1={H * f} x2={W} y2={H * f} stroke="var(--color-border)" strokeWidth="1" />
      ))}
      <path d={fill} fill={`url(#${fillId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animated-chart-line"
      />
    </svg>
  );
};

const AnalyticsPage = () => {
  const { orders, loading: ordersLoading, error } = useOrders();
  const { items: allMenuItems, categories, loading: menuLoading } = useMenu();
  const [dateRange, setDateRange] = useState(() => getPresetRange("today"));

  const loading = ordersLoading || menuLoading;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!dateRange.from || !dateRange.to || !o.createdAt) return true;
      const date = new Date(o.createdAt);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [orders, dateRange]);

  const paidOrders = useMemo(() => filteredOrders.filter((o) => o.paymentStatus === "Paid"), [filteredOrders]);

  const totalRevenue = useMemo(() => paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0), [paidOrders]);
  const totalOrdersCount = filteredOrders.length;

  const revPts = useMemo(() => {
    const hours = [0, 4, 8, 12, 16, 20, 24];
    const hourRevs = hours.map((h) => {
      if (h === 24) return 0;
      return paidOrders
        .filter((o) => {
          if (!o.createdAt) return false;
          const hr = new Date(o.createdAt).getHours();
          return hr >= h && hr < h + 4;
        })
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);
    });
    const maxVal = Math.max(...hourRevs, 100);
    const stepX = W / (hours.length - 1);
    return hours.map((_, idx) => [idx * stepX, H - (hourRevs[idx] / maxVal) * (H - 40) - 20]);
  }, [paidOrders]);

  const ordPts = useMemo(() => {
    const hours = [0, 4, 8, 12, 16, 20, 24];
    const hourCounts = hours.map((h) => {
      if (h === 24) return 0;
      return filteredOrders.filter((o) => {
        if (!o.createdAt) return false;
        const hr = new Date(o.createdAt).getHours();
        return hr >= h && hr < h + 4;
      }).length;
    });
    const maxVal = Math.max(...hourCounts, 10);
    const stepX = W / (hours.length - 1);
    return hours.map((_, idx) => [idx * stepX, H - (hourCounts[idx] / maxVal) * (H - 40) - 20]);
  }, [filteredOrders]);

  // Combine menu items from categories + direct items
  const menuList = useMemo(() => {
    const list = [...allMenuItems];
    categories.forEach((cat) => {
      (cat.items || []).forEach((i) => {
        if (!list.some((existing) => existing.id === i.id)) {
          list.push(i);
        }
      });
    });
    return list;
  }, [allMenuItems, categories]);

  const { worstItems, bestItems } = useMemo(() => {
    const itemMap = {};

    // Seed with all menu items at 0 orders
    menuList.forEach((m) => {
      itemMap[m.name] = { name: m.name, orders: 0, price: Number(m.price || 0) };
    });

    filteredOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((i) => {
          const name = i.name || `Item #${i.itemId}`;
          const count = Number(i.count || 1);
          const price = Number(i.price || 0);
          if (!itemMap[name]) itemMap[name] = { name, orders: 0, price };
          itemMap[name].orders += count;
          if (price > 0) itemMap[name].price = price;
        });
      }
    });

    const sortedAll = Object.values(itemMap);

    const worst = [...sortedAll]
      .sort((a, b) => a.orders - b.orders)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        orders: `${item.orders} orders`,
        price: `₹${item.price.toFixed(2)}`,
        change: item.orders === 0 ? "No Sales" : "Low Volume"
      }));

    const best = [...sortedAll]
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        orders: `${item.orders} orders`,
        price: `₹${item.price.toFixed(2)}`,
        change: "Top Seller"
      }));

    return { worstItems: worst, bestItems: best };
  }, [filteredOrders, menuList]);

  return (
    <div className="analytics-page">
      {/* Top Header Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "12px" }}>

        <DateRangeFilter onChange={setDateRange} />
      </div>

      {error && <div className="login-error" role="alert">{error}</div>}

      {/* Row 1: Revenue Trend + No of Orders */}
      <div className="analytics-top-row">
        {/* Revenue Trend */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <span className="analytics-card-label">Revenue Trend</span>
              <div className="analytics-big-stat">₹{totalRevenue.toFixed(2)}</div>
              <div className="analytics-stat-badge positive">
                Live Data
              </div>
            </div>
          </div>
          <SparklineChart points={revPts} color="var(--color-chart-black)" fillId="revFill" gradientStart="#1E1E1E" />
          <div className="analytics-x-labels">{XLABELS.map((l) => <span key={l}>{l}</span>)}</div>
        </div>
        {/* No. of Orders */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <span className="analytics-card-label">No of Orders</span>
              <div className="analytics-big-stat">{totalOrdersCount}</div>
              <div className="analytics-stat-badge positive">
                Live Orders
              </div>
            </div>
          </div>
          <SparklineChart points={ordPts} color="#2563EB" fillId="ordFill" gradientStart="#2563EB" />
          <div className="analytics-x-labels">{XLABELS.map((l) => <span key={l}>{l}</span>)}</div>
        </div>
      </div>

      {/* Row 2: Highest & Lowest Selling Items */}
      <div className="analytics-bottom-row" style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Highest Selling Items */}
        <div className="analytics-card">
          <div className="wsi-header">
            <div>
              <h2 className="analytics-section-title">Highest Selling Items</h2>
              <p className="analytics-section-subtitle">Dishes with highest order volume in selected period</p>
            </div>
            <div className="needs-attention-badge" style={{ background: "#ecfdf5", color: "#047857" }}>🔥 Top Performers</div>
          </div>
          <div className="wsi-list">
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading analytics...</div>
            ) : bestItems.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>No order data available</div>
            ) : (
              bestItems.map((item) => (
                <div key={item.name} className="wsi-row">
                  <div className="wsi-details">
                    <span className="wsi-name">{item.name}</span>
                    <span className="wsi-meta">{item.orders} · {item.price}</span>
                  </div>
                  <span className="wsi-change" style={{ background: "#ecfdf5", color: "#047857" }}>{item.change}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lowest Selling Items */}
        <div className="analytics-card">
          <div className="wsi-header">
            <div>
              <h2 className="analytics-section-title">Lowest Selling Items</h2>
              <p className="analytics-section-subtitle">Dishes with lowest order volume in selected period</p>
            </div>
            <div className="needs-attention-badge">Needs attention</div>
          </div>
          <div className="wsi-list">
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading analytics...</div>
            ) : worstItems.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>No order data available for selected range</div>
            ) : (
              worstItems.map((item) => (
                <div key={item.name} className="wsi-row">
                  <div className="wsi-details">
                    <span className="wsi-name">{item.name}</span>
                    <span className="wsi-meta">{item.orders} · {item.price}</span>
                  </div>
                  <span className="wsi-change">{item.change}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;