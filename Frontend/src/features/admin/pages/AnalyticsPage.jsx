import React, { useState } from "react";
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
const buildFill = (pts, height) => buildCurvedPath(pts) + ` L ${pts[pts.length - 1][0]},${height} L ${pts[0][0]},${height} Z`;
const XLABELS = ["9am", "11am", "1pm", "3pm", "5pm", "7pm", "9pm"];
/* ─── Revenue chart pts (black line, screenshot 1) ─── */
const REV_PTS = [[0,160],[80,145],[160,120],[240,130],[320,95],[400,55],[480,65],[560,75]];
/* ─── Orders chart pts (blue line, screenshot 1) ─── */
const ORD_PTS = [[0,120],[80,100],[160,80],[240,90],[320,75],[400,60],[480,65],[560,70]];
/* ─── Upsell chart pts (purple line, screenshot 1) ─── */
const UPS_PTS = [[0,130],[80,110],[160,100],[240,108],[320,95],[400,90],[480,100],[560,95]];
const W = 560; const H = 160;
const SparklineChart = ({ points, color, fillId, gradientStart }) => {
  const line = buildCurvedPath(points);
  const fill = buildFill(points, H);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="analytics-sparkline" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} stopOpacity="0.18" />
          <stop offset="100%" stopColor={gradientStart} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1="0" y1={H * f} x2={W} y2={H * f} stroke="var(--color-border)" strokeWidth="1" />
      ))}
      <path d={fill} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
/* ─── Best Selling Category ─── */
const CATEGORIES = [
  { rank: 1, name: "Mains",      rev: "$4,820", orders: "198 orders", pct: 100 },
  { rank: 2, name: "Beverages",  rev: "$2,640", orders: "312 orders", pct: 60 },
  { rank: 3, name: "Desserts",   rev: "$1,980", orders: "145 orders", pct: 42 },
  { rank: 4, name: "Starters",   rev: "$1,340", orders: "108 orders", pct: 28 },
  { rank: 5, name: "Specials",   rev: "$910",   orders: "47 orders",  pct: 18 },
];
/* ─── Worst selling ─── */
const WORST_ITEMS = [
  { name: "Mushroom Risotto",   orders: "4 orders",  price: "$48.00", change: "-62%" },
  { name: "Vegan Buddha Bowl",  orders: "6 orders",  price: "$72.00", change: "-54%" },
  { name: "Cold Brew Kombucha", orders: "8 orders",  price: "$40.00", change: "-47%" },
  { name: "Chia Seed Pudding",  orders: "5 orders",  price: "$35.00", change: "-41%" },
  { name: "Quinoa Veggie Wrap", orders: "9 orders",  price: "$63.00", change: "-38%" },
];
const PeriodToggle = ({ periods, active, onChange }) => (
  <div className="period-toggle-group">
    {periods.map((p) => (
      <button key={p} className={`period-btn ${active === p ? "active" : ""}`} onClick={() => onChange(p)}>{p}</button>
    ))}
  </div>
);
const AnalyticsPage = () => {
  const [revPeriod, setRevPeriod] = useState("Today");
  const [ordPeriod, setOrdPeriod] = useState("Today");
  const [upsPeriod, setUpsPeriod] = useState("Today");
  return (
    <div className="analytics-page">
      {/* Row 1: Revenue Trend + No of Orders */}
      <div className="analytics-top-row">
        {/* Revenue Trend */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <span className="analytics-card-label">revenue trend</span>
              <div className="analytics-big-stat">$11,980</div>
              <div className="analytics-stat-badge positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                +12.4% vs previous today
              </div>
            </div>
            <PeriodToggle periods={["Today", "Week", "Month"]} active={revPeriod} onChange={setRevPeriod} />
          </div>
          <SparklineChart points={REV_PTS} color="var(--color-chart-black)" fillId="revFill" gradientStart="#1E1E1E" />
          <div className="analytics-x-labels">{XLABELS.map((l) => <span key={l}>{l}</span>)}</div>
        </div>
        {/* No. of Orders */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <span className="analytics-card-label">no of orders</span>
              <div className="analytics-big-stat">456</div>
              <div className="analytics-stat-badge positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                +18% peak volume
              </div>
            </div>
            <PeriodToggle periods={["Today", "Week", "Month"]} active={ordPeriod} onChange={setOrdPeriod} />
          </div>
          <SparklineChart points={ORD_PTS} color="#2563EB" fillId="ordFill" gradientStart="#2563EB" />
          <div className="analytics-x-labels">{XLABELS.map((l) => <span key={l}>{l}</span>)}</div>
        </div>
      </div>
      {/* Row 2: Upselling Performance */}
      <div className="analytics-card analytics-upsell-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title-group">
            <span className="analytics-card-label">upselling performance</span>
            <div className="analytics-big-stat">27.6%</div>
            <div className="analytics-stat-badge positive">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Avg upsell conversion
            </div>
          </div>
          <div className="upsell-stats-row">
            <div className="upsell-stat-item">
              <span className="upsell-stat-label">Items Upsold</span>
              <span className="upsell-stat-value">1,248</span>
            </div>
            <div className="upsell-stat-item">
              <span className="upsell-stat-label">Upsell Revenue</span>
              <span className="upsell-stat-value">$3,680</span>
            </div>
            <div className="upsell-stat-item">
              <span className="upsell-stat-label">Upsell Rate</span>
              <span className="upsell-stat-value">24.8%</span>
            </div>
            <PeriodToggle periods={["Today", "Week", "Month"]} active={upsPeriod} onChange={setUpsPeriod} />
          </div>
        </div>
        <SparklineChart points={UPS_PTS} color="#8B5CF6" fillId="upsFill" gradientStart="#8B5CF6" />
        <div className="analytics-x-labels">{XLABELS.map((l) => <span key={l}>{l}</span>)}</div>
      </div>
      {/* Row 3: Best Selling Category + Worst Selling Items */}
      <div className="analytics-bottom-row">
        {/* Best Selling Category */}
        <div className="analytics-card">
          <div className="bsc-header">
            <div>
              <h2 className="analytics-section-title">best selling category</h2>
              <p className="analytics-section-subtitle">By total revenue today</p>
            </div>
          </div>
          <div className="bsc-list">
            {CATEGORIES.map((cat) => (
              <div key={cat.rank} className="bsc-row">
                <span className="bsc-rank">{cat.rank}</span>
                <div className="bsc-bar-col">
                  <div className="bsc-bar-track">
                    <div className="bsc-bar-fill" style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
                <span className="bsc-name">{cat.name}</span>
                <div className="bsc-revenue-col">
                  <span className="bsc-revenue">{cat.rev}</span>
                  <span className="bsc-orders">{cat.orders}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Worst Selling Items */}
        <div className="analytics-card">
          <div className="wsi-header">
            <div>
              <h2 className="analytics-section-title">worst selling item</h2>
              <p className="analytics-section-subtitle">lowest order volume today</p>
            </div>
            <div className="needs-attention-badge">Needs attention</div>
          </div>
          <div className="wsi-list">
            {WORST_ITEMS.map((item) => (
              <div key={item.name} className="wsi-row">
                <div className="wsi-details">
                  <span className="wsi-name">{item.name}</span>
                  <span className="wsi-meta">{item.orders} · {item.price}</span>
                </div>
                <span className="wsi-change">{item.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;