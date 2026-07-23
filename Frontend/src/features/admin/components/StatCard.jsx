import React from "react";
import "../styles/StatCard.css";
const StatCard = ({ title, value, subtext, subtextColor = "green", icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className="stat-card-icon-box">{icon}</div>}
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {subtext && (
          <div className={`stat-card-subtext subtext-${subtextColor}`}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
export default StatCard;

