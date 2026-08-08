import React, { useState, useEffect } from "react";
import "../styles/DishDetailModal.css";

const DishDetailModal = ({ isOpen, onClose, dish, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (dish && Array.isArray(dish.variants) && dish.variants.length > 0) {
      setSelectedVariant(dish.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setSelectedAddOns([]);
    setQuantity(1);
  }, [dish, isOpen]);

  if (!isOpen || !dish) return null;

  const variants = Array.isArray(dish.variants) ? dish.variants : [];
  const addOns = Array.isArray(dish.addOns) ? dish.addOns : [];

  const basePrice = selectedVariant ? Number(selectedVariant.price || 0) : Number(dish.price || 0);
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;
  const isSubmitDisabled = variants.length > 0 && !selectedVariant;

  const toggleAddOn = (addon) => {
    setSelectedAddOns((prev) =>
      prev.some((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const handleAddSubmit = () => {
    onAddToCart({
      ...dish,
      isCustomized: true,
      price: unitPrice,
      variantPrice: selectedVariant ? selectedVariant.price : null,
      quantity: selectedVariant ? selectedVariant.name : "Full",
      selectedAddOns,
      count: quantity
    });
    onClose();
  };

  return (
    <div className="dish-modal-backdrop" onClick={onClose}>
      <div className="dish-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Sheet Handle */}
        <div className="sheet-drag-handle" />

        {/* Dish Hero Image / Header */}
        <div className="dish-hero-box">
          {dish.image ? (
            <img src={dish.image} alt={dish.name} className="dish-hero-img" />
          ) : (
            <div className="dish-hero-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 0 0 20" />
              </svg>
            </div>
          )}
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close sheet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Sheet Content */}
        <div className="dish-sheet-body">
          {/* Header info */}
          <div className="dish-title-section">
            <div className="dish-badge-name-row">
              <span className={`veg-dot-sm ${dish.isVeg ? "is-veg" : "is-nonveg"}`} />
              <h2 className="dish-sheet-title">{dish.name}</h2>
            </div>
            <p className="dish-sheet-desc">{dish.description}</p>
            <div className="dish-meta-tags">
              {dish.preparationTime && <span>⏱️ {dish.preparationTime} mins prep</span>}
              {dish.isBestseller && <span className="bestseller-tag">★ Bestseller</span>}
            </div>
          </div>

          {/* Variants Section */}
          {variants.length > 0 && (
            <div className="customization-group">
              <h3>Select Portion Size</h3>
              <div className="options-radio-list">
                {variants.map((v, idx) => (
                  <label key={idx} className="option-radio-card">
                    <input
                      type="radio"
                      name="portionVariant"
                      checked={selectedVariant?.name === v.name}
                      onChange={() => setSelectedVariant(v)}
                    />
                    <span className="option-label">{v.name}</span>
                    <strong className="option-price">${Number(v.price).toFixed(2)}</strong>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {addOns.length > 0 && (
            <div className="customization-group">
              <h3>Add Extras (Optional)</h3>
              <div className="options-checkbox-list">
                {addOns.map((a, idx) => {
                  const isChecked = selectedAddOns.some((item) => item.name === a.name);
                  return (
                    <label key={idx} className="option-checkbox-card">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddOn(a)}
                      />
                      <span className="option-label">{a.name}</span>
                      <strong className="option-price">+${Number(a.price).toFixed(2)}</strong>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sheet Footer Bar */}
        <div className="dish-sheet-footer">
          <div className="stepper-count-box">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
          <button
            className="add-to-cart-submit-btn"
            onClick={handleAddSubmit}
            disabled={isSubmitDisabled}
            style={{ opacity: isSubmitDisabled ? 0.6 : 1, cursor: isSubmitDisabled ? "not-allowed" : "pointer" }}
          >
            {isSubmitDisabled ? "Select Portion Size" : `Add to Order • $${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishDetailModal;
