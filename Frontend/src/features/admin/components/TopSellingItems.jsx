import React from "react";
import "../styles/TopSellingItems.css";
const items = [
  { rank: 1, name: "Truffle Wagyu Burger", category: "Mains · 142 orders", revenue: "$3,479.00", change: "+28%" },
  { rank: 2, name: "Artisanal Woodfired Pizza", category: "Mains · 96 orders", revenue: "$2,112.00", change: "+14%" },
  { rank: 3, name: "Smoked Caramel Latte", category: "Beverages · 210 orders", revenue: "$1,050.00", change: "+9%" },
];
const TopSellingItems = () => {
  return (
    <div className="top-items-card">
      <div className="top-items-header">
        <div>
          <h2 className="card-section-title">Top Selling Items</h2>
          <p className="card-section-subtitle">Best performers today</p>
        </div>
        <button className="view-menu-btn">
          Menu
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="top-items-list">
        {items.map((item) => (
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
        ))}
      </div>
    </div>
  );
};
export default TopSellingItems;
