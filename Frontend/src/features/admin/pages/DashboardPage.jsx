import React from "react";
import StatCard from "../components/StatCard.jsx";
import LiveOrdersList from "../components/LiveOrdersList.jsx";
import RestaurantFloor from "../components/RestaurantFloor.jsx";
import NotificationsPanel from "../components/NotificationsPanel.jsx";
import RevenueTrendChart from "../components/RevenueTrendChart.jsx";
import TopSellingItems from "../components/TopSellingItems.jsx";
import { useTables, useOrders } from "../hooks/useAdmin.js";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const { tables } = useTables();
  const { orders } = useOrders();

  const todayRevenue = orders
    .filter((o) => {
      const isToday = o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString();
      return isToday && o.paymentStatus === "Paid";
    })
    .reduce((sum, o) => sum + Number(o.amount || o.total || 0), 0);

  const displayRevenue = todayRevenue > 0 ? `$${todayRevenue.toFixed(2)}` : "$14,850.00";
  const displayOrdersCount = orders.length > 0 ? orders.length : 342;

  return (
    <div className="dashboard-page">
      {/* Top Row: 5 KPI Cards like Attachment */}
      <div className="stats-grid-5">
        <StatCard
          title="revenue"
          value={displayRevenue}
          subtext="~^ +12.4% vs yesterday"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="no of orders"
          value={displayOrdersCount}
          subtext="~^ +18% Peak  60% Done"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />
        <StatCard
          title="avg order value"
          value="$43.40"
          subtext="~^ +$4.20 vs avg"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <StatCard
          title="upsell performance"
          value="24.8%"
          subtext="~^ +5.2% Conversion"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
        />
        <StatCard
          title="qr orders %"
          value="91.5%"
          subtext="~^ +4.8% Scan ratio"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
        />
      </div>

      {/* Row 2: Recent Orders + Restaurant Status */}
      <div className="dashboard-mid-row">
        <LiveOrdersList />
        <RestaurantFloor />
      </div>

      {/* Row 3: Notification + Recent Customer Review */}
      <div className="dashboard-mid-row">
        <NotificationsPanel />
        <div className="recent-review-card">
          <div className="review-header-row">
            <h2 className="review-title">recent customer review</h2>
            <span className="review-rating-badge">★ 4.9 Rating</span>
          </div>
          <div className="review-body">
            <div className="reviewer-info">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                alt="Sarah Jenkins"
                className="reviewer-avatar"
              />
              <div>
                <span className="reviewer-name">Sarah Jenkins</span>
                <span className="reviewer-table">• Table 08</span>
                <div className="review-meta-time">QR Scan Order #408 • 12 mins ago</div>
              </div>
              <span className="review-stars">★★★★★</span>
            </div>
            <p className="review-comment">
              "The QR menu was super crisp with clear photos! Our Truffle Wagyu burger arrived in under 10 minutes and was cooked to perfection. Amazing digital ordering experience!"
            </p>
            <div className="review-tags-row">
              <span className="review-tag">Fast Service</span>
              <span className="review-tag">Great Ambiance</span>
              <button type="button" className="quick-reply-btn">Quick Reply</button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Revenue Trend Chart + Top Selling Items */}
      <div className="dashboard-bottom-row">
        <RevenueTrendChart orders={orders} />
        <div className="dashboard-right-col">
          <TopSellingItems orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;