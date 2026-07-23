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
  const preparingCount = orders.filter((o) => o.orderStatus === "Preparing").length;
  const occupiedTables = tables.filter((t) => t.isOccupied).length;
  const todayRevenue = orders
    .filter((o) => {
      const isToday = o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString();
      return isToday && o.paymentStatus === "Paid";
    })
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);
  return (
    <div className="dashboard-page">
      {/* Stat Summary Row */}
      <div className="stats-grid">
        <StatCard
          title="Today Revenue"
          value={`$${todayRevenue.toFixed(2)}`}
          subtext="Settled orders today"
          subtextColor="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="Live Orders"
          value={preparingCount}
          subtext="Preparing in kitchen"
          subtextColor="orange"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          subtext="All active & history"
          subtextColor="blue"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <StatCard
          title="Active Tables"
          value={`${occupiedTables}/${tables.length}`}
          subtext="Occupied right now"
          subtextColor="orange"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 18v3M20 18v3M4 11h16M3 7h18M5 7v4M19 7v4" />
            </svg>
          }
        />
      </div>
      {/* Mid Row: Live Orders + Available Tables Section */}
      <div className="dashboard-mid-row">
        <LiveOrdersList />
        <RestaurantFloor />
      </div>
      {/* Bottom Row: Revenue Chart + Top Selling Items */}
      <div className="dashboard-bottom-row">
        <RevenueTrendChart />
        <div className="dashboard-right-col">
          <TopSellingItems />
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;