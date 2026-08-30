import { useState } from "react";
import "../styles/OrderHistoryModal.css";
import { getPresetRange } from "./DateRangeFilter.jsx";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
  { label: "Custom Range", value: "custom" },
];

const STATUSES = ["All", "Incoming", "Preparing", "Ready", "Delivered"];

const OrderHistoryModal = ({ isOpen, onClose, onDateRangeChange, statusFilter, onStatusFilterChange, totalCount, totalRevenue }) => {
  const [activePreset, setActivePreset] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    if (preset === "all") {
      onDateRangeChange({ from: null, to: null });
    } else if (preset !== "custom") {
      const range = getPresetRange(preset);
      onDateRangeChange(range);
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom + "T00:00:00");
      const to = new Date(customTo + "T23:59:59");
      onDateRangeChange({ from, to });
    }
  };

  const handleResetFilters = () => {
    setActivePreset("today");
    onDateRangeChange(getPresetRange("today"));
    onStatusFilterChange("All");
    setCustomFrom("");
    setCustomTo("");
  };

  return (
    <div className="order-history-modal-backdrop" onClick={onClose}>
      <div className="order-history-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="history-modal-header">
          <div className="history-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <h2>Order History & Filters</h2>
          </div>
          <button className="history-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="history-modal-body">
          {/* Summary Stat Banner */}
          <div className="history-summary-box">
            <div className="history-stat-item">
              <span className="stat-label">Matching Orders</span>
              <span className="stat-value">{totalCount}</span>
            </div>
            <div className="history-stat-divider" />
            <div className="history-stat-item">
              <span className="stat-label">Total Period Revenue</span>
              <span className="stat-value highlight">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Date Range Section */}
          <div className="filter-section">
            <label className="filter-section-label">Select Timeframe</label>
            <div className="preset-buttons-grid">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`preset-tab-btn ${activePreset === p.value ? "active" : ""}`}
                  onClick={() => handlePresetSelect(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {activePreset === "custom" && (
              <div className="custom-date-picker-row">
                <div className="date-field">
                  <span>From:</span>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="date-field">
                  <span>To:</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
                <button type="button" className="btn-apply-custom" onClick={handleCustomApply}>
                  Apply Dates
                </button>
              </div>
            )}
          </div>

          {/* Order Status Filter */}
          <div className="filter-section">
            <label className="filter-section-label">Order Status</label>
            <div className="status-buttons-row">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`status-filter-pill ${statusFilter === st ? "active" : ""}`}
                  onClick={() => onStatusFilterChange(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="history-modal-footer">
          <button type="button" className="btn-reset-filter" onClick={handleResetFilters}>
            Reset Filters
          </button>
          <button type="button" className="btn-done-filter" onClick={onClose}>
            Show Results ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;
