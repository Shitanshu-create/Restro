import React from "react";
import StatCard from "../components/StatCard.jsx";
import LiveOrdersList from "../components/LiveOrdersList.jsx";
import RestaurantFloor from "../components/RestaurantFloor.jsx";
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

  const displayRevenue = todayRevenue > 0 ? `$${todayRevenue.toFixed(2)}` : "$0.00";
  const displayOrdersCount = orders.length;

  const paidOrders = orders.filter((o) => o.paymentStatus === "Paid");
  const displayAvgValue = paidOrders.length > 0
    ? `$${(paidOrders.reduce((sum, o) => sum + Number(o.amount || o.total || 0), 0) / paidOrders.length).toFixed(2)}`
    : "$0.00";

  // Upsell proxy: orders containing customized items, variant prices, or add-ons
  const upsellOrders = orders.filter(
    (o) => o.items && o.items.some((item) => (item.selectedAddOns && item.selectedAddOns.length > 0) || item.variantPrice > 0)
  ).length;
  const displayUpsell = orders.length > 0 ? `${((upsellOrders / orders.length) * 100).toFixed(1)}%` : "0.0%";

  // QR scan proxy: orders with a tableNo set
  const qrOrders = orders.filter((o) => o.tableNo).length;
  const displayQr = orders.length > 0 ? `${((qrOrders / orders.length) * 100).toFixed(1)}%` : "100.0%";

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
          value={displayAvgValue}
          subtext="Based on paid orders"
          subtextColor="muted"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <StatCard
          title="upsell performance"
          value={displayUpsell}
          subtext="Add-ons & variants"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
        />
        <StatCard
          title="qr orders %"
          value={displayQr}
          subtext="Dine-in scan ratio"
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