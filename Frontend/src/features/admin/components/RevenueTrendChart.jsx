import React, { useMemo } from "react";
import "../styles/RevenueTrendChart.css";

const W = 560;
const H = 180;
const PAD = 10;

function buildPath(pts) {
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
}

function buildFill(pts, height) {
  if (!pts || pts.length < 2) return "";
  const line = buildPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L ${last[0]},${height} L ${first[0]},${height} Z`;
}

const xLabels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "12 AM"];

const RevenueTrendChart = ({ orders = [] }) => {
  const chartPoints = useMemo(() => {
    const hours = [0, 4, 8, 12, 16, 20, 24];
    const revenueByHour = hours.map((h) => {
      if (h === 24) return 0; // midnight end-of-day anchor
      return orders
        .filter((o) => {
          if (!o.createdAt || o.paymentStatus !== "Paid") return false;
          const hr = new Date(o.createdAt).getHours();
          return hr >= h && hr < h + 4;
        })
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);
    });

    const maxRev = Math.max(...revenueByHour, 100);
    const stepX = W / (hours.length - 1);

    return hours.map((_, idx) => {
      const x = idx * stepX;
      const rev = revenueByHour[idx];
      const y = H - (rev / maxRev) * (H - 40) - 20;
      return [x, y];
    });
  }, [orders]);

  const linePath = buildPath(chartPoints);
  const fillPath = buildFill(chartPoints, H);

  return (
    <div className="revenue-chart-card">
      <div className="revenue-chart-header">
        <div>
          <h2 className="card-section-title">Revenue Trend</h2>
          <p className="card-section-subtitle">Live order revenue</p>
        </div>
        <div className="revenue-badge-positive">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Live Data
        </div>
      </div>
      <div className="revenue-chart-svg-wrapper">
        <svg
          viewBox={`0 0 ${W} ${H + PAD}`}
          preserveAspectRatio="none"
          className="revenue-svg"
          aria-label="Revenue trend chart"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line
              key={i}
              x1="0"
              y1={H * frac}
              x2={W}
              y2={H * frac}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          ))}
          <path d={fillPath} fill="url(#revenueGradient)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animated-chart-line"
          />
        </svg>
      </div>
      <div className="revenue-x-labels">
        {xLabels.map((l) => (
          <span key={l} className="x-label">{l}</span>
        ))}
      </div>
    </div>
  );
};
export default RevenueTrendChart;