import React from "react";
import "../styles/FilterModal.css";

const FilterModal = ({ isOpen, onClose, sortOption, setSortOption, dietaryFilter, setDietaryFilter }) => {
  if (!isOpen) return null;

  const handleReset = () => {
    setSortOption("default");
    setDietaryFilter("all");
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Filter & Sort</h3>
          <button type="button" className="filter-close-btn" onClick={onClose} aria-label="Close filters">
            ×
          </button>
        </div>

        <div className="filter-modal-body">
          {/* Sort By Price */}
          <div className="filter-section">
            <h4 className="filter-section-title">Sort By Price</h4>
            <div className="filter-options-grid">
              <button
                type="button"
                className={`filter-chip-btn ${sortOption === "low-to-high" ? "active" : ""}`}
                onClick={() => setSortOption("low-to-high")}
              >
                Low → High
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${sortOption === "high-to-low" ? "active" : ""}`}
                onClick={() => setSortOption("high-to-low")}
              >
                High → Low
              </button>
            </div>
          </div>

          {/* Dietary Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Dietary</h4>
            <div className="filter-options-grid">
              <button
                type="button"
                className={`filter-chip-btn ${dietaryFilter === "all" ? "active" : ""}`}
                onClick={() => setDietaryFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${dietaryFilter === "veg" ? "active" : ""}`}
                onClick={() => setDietaryFilter("veg")}
              >
                <span className="diet-dot veg-dot" /> Veg Only
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${dietaryFilter === "non-veg" ? "active" : ""}`}
                onClick={() => setDietaryFilter("non-veg")}
              >
                <span className="diet-dot nonveg-dot" /> Non-Veg
              </button>
            </div>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button type="button" className="filter-btn-reset" onClick={handleReset}>
            Reset All
          </button>
          <button type="button" className="filter-btn-apply" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
