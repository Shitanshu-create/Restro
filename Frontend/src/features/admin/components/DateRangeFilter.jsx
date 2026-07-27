import React, { useState } from "react";
import "../styles/DateRangeFilter.css";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "This Month", value: "month" },
  { label: "Custom", value: "custom" },
];

export function getPresetRange(preset) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (preset === "today") {
    return { from: todayStart, to: todayEnd };
  }
  if (preset === "yesterday") {
    const yStart = new Date(todayStart);
    yStart.setDate(yStart.getDate() - 1);
    const yEnd = new Date(todayEnd);
    yEnd.setDate(yEnd.getDate() - 1);
    return { from: yStart, to: yEnd };
  }
  if (preset === "7days") {
    const d7 = new Date(todayStart);
    d7.setDate(d7.getDate() - 6);
    return { from: d7, to: todayEnd };
  }
  if (preset === "month") {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return { from: mStart, to: todayEnd };
  }
  return { from: null, to: null };
}

const DateRangeFilter = ({ onChange }) => {
  const [activePreset, setActivePreset] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    if (preset !== "custom") {
      const range = getPresetRange(preset);
      onChange(range);
    }
  };

  const handleCustomChange = (fromStr, toStr) => {
    if (fromStr && toStr) {
      const from = new Date(fromStr + "T00:00:00");
      const to = new Date(toStr + "T23:59:59");
      onChange({ from, to });
    }
  };

  return (
    <div className="date-range-filter">
      <div className="date-preset-group">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            className={`date-preset-btn ${activePreset === p.value ? "active" : ""}`}
            onClick={() => handlePresetChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {activePreset === "custom" && (
        <div className="date-custom-inputs">
          <input
            type="date"
            className="date-input"
            value={customFrom}
            onChange={(e) => {
              setCustomFrom(e.target.value);
              handleCustomChange(e.target.value, customTo);
            }}
          />
          <span className="date-sep">to</span>
          <input
            type="date"
            className="date-input"
            value={customTo}
            onChange={(e) => {
              setCustomTo(e.target.value);
              handleCustomChange(customFrom, e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
