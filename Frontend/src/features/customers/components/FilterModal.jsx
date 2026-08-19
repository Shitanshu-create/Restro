import React, { useState, useEffect } from "react";
import "../styles/FilterModal.css";

const FilterModal = ({
  isOpen,
  onClose,
  currentSort = "none",
  currentDiet = "all",
  onApply
}) => {
  const [selectedSort, setSelectedSort] = useState(currentSort);
  const [selectedDiet, setSelectedDiet] = useState(currentDiet);

  useEffect(() => {
    if (isOpen) {
      setSelectedSort(currentSort);
      setSelectedDiet(currentDiet);
    }
  }, [isOpen, currentSort, currentDiet]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      sort: selectedSort,
      diet: selectedDiet
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedSort("none");
    setSelectedDiet("all");
    onApply({
      sort: "none",
      diet: "all"
    });
    onClose();
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal-header">
          <div className="filter-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <h2>Filters & Sort</h2>
          </div>
          <button type="button" className="filter-close-btn" onClick={onClose} aria-label="Close filters">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="filter-modal-body">
          {/* Sort by Price Section */}
          <div className="filter-group">
            <h3 className="filter-group-title">Sort by Price</h3>
            <div className="filter-options-grid">
              <button
                type="button"
                className={`filter-chip-btn ${selectedSort === "price-asc" ? "active" : ""}`}
                onClick={() => setSelectedSort(selectedSort === "price-asc" ? "none" : "price-asc")}
              >
                <span>Price: Low → High</span>
                {selectedSort === "price-asc" && <span className="chip-check">✓</span>}
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedSort === "price-desc" ? "active" : ""}`}
                onClick={() => setSelectedSort(selectedSort === "price-desc" ? "none" : "price-desc")}
              >
                <span>Price: High → Low</span>
                {selectedSort === "price-desc" && <span className="chip-check">✓</span>}
              </button>
            </div>
          </div>

          {/* Dietary Section */}
          <div className="filter-group">
            <h3 className="filter-group-title">Dietary Preference</h3>
            <div className="filter-options-grid">
              <button
                type="button"
                className={`filter-chip-btn ${selectedDiet === "all" ? "active" : ""}`}
                onClick={() => setSelectedDiet("all")}
              >
                <span>All Dishes</span>
                {selectedDiet === "all" && <span className="chip-check">✓</span>}
              </button>
              <button
                type="button"
                className={`filter-chip-btn diet-veg ${selectedDiet === "veg" ? "active" : ""}`}
                onClick={() => setSelectedDiet("veg")}
              >
                <span className="diet-veg-dot" />
                <span>Veg Only</span>
                {selectedDiet === "veg" && <span className="chip-check">✓</span>}
              </button>
              <button
                type="button"
                className={`filter-chip-btn diet-nonveg ${selectedDiet === "non-veg" ? "active" : ""}`}
                onClick={() => setSelectedDiet("non-veg")}
              >
                <span className="diet-nonveg-dot" />
                <span>Non-Veg Only</span>
                {selectedDiet === "non-veg" && <span className="chip-check">✓</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="filter-modal-footer">
          <button type="button" className="filter-reset-btn" onClick={handleReset}>
            Clear All
          </button>
          <button type="button" className="filter-apply-btn" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
