import React from "react";
import "../styles/RevenueTrendChart.css";
// Orange SVG sparkline path matching screenshot 4
const CHART_POINTS = [
  [0, 170], [60, 150], [130, 110], [200, 125], [270, 90], [340, 70], [410, 50], [480, 65], [560, 80],
];
const W = 560;
const H = 180;
const PAD = 10;
function buildPath(pts) {
  if (pts.length < 2) return "";
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
  const line = buildPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L ${last[0]},${height} L ${first[0]},${height} Z`;
}
const xLabels = ["11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM"];
const RevenueTrendChart = () => {
  const linePath = buildPath(CHART_POINTS);
  const fillPath = buildFill(CHART_POINTS, H);
  return (
    <div className="revenue-chart-card">
      <div className="revenue-chart-header">
        <div>
          <h2 className="card-section-title">Revenue Trend</h2>
          <p className="card-section-subtitle">Hourly revenue for today</p>
        </div>
        <div className="revenue-badge-positive">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          +12.4%
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
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
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
          <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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