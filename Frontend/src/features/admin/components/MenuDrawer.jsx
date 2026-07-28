import React, { useState, useEffect } from "react";
import "../styles/MenuDrawer.css";

const MenuDrawer = ({ isOpen, onClose, item, categories, allItems, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    categoryName: "",
    price: "",
    discountPrice: "",
    preparationTime: 15,
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
    isRecommended: false,
    image: "",
    upsellItems: [],
    variants: [],
    addOns: []
  });

  const [upsellSearch, setUpsellSearch] = useState("");
  const [newVariant, setNewVariant] = useState({ name: "", price: "" });
  const [newAddOn, setNewAddOn] = useState({ name: "", price: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || "",
        name: item.name || "",
        description: item.description || "",
        categoryName: item.categoryName || (categories[0]?.name || ""),
        price: item.price !== undefined ? item.price : "",
        discountPrice: item.discountPrice !== undefined ? item.discountPrice : "",
        preparationTime: item.preparationTime || 15,
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        isBestseller: item.isBestseller || false,
        isRecommended: item.isRecommended || false,
        image: item.image || "",
        upsellItems: Array.isArray(item.upsellItems) ? item.upsellItems : [],
        variants: Array.isArray(item.variants) ? item.variants : [],
        addOns: Array.isArray(item.addOns) ? item.addOns : []
      });
    } else {
      // New item mode
      const nextId = allItems && allItems.length > 0 ? Math.max(...allItems.map(i => Number(i.id) || 0)) + 1 : 101;
      setFormData({
        id: nextId,
        name: "",
        description: "",
        categoryName: categories[0]?.name || "Main Course",
        price: "",
        discountPrice: "",
        preparationTime: 15,
        isVeg: true,
        isAvailable: true,
        isBestseller: false,
        isRecommended: false,
        image: "",
        upsellItems: [],
        variants: [],
        addOns: []
      });
    }
  }, [item, categories, allItems, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Upsell Handlers
  const handleAddUpsell = (itemId) => {
    const idNum = Number(itemId);
    if (!formData.upsellItems.includes(idNum)) {
      setFormData((prev) => ({ ...prev, upsellItems: [...prev.upsellItems, idNum] }));
    }
    setUpsellSearch("");
  };

  const handleRemoveUpsell = (itemId) => {
    setFormData((prev) => ({ ...prev, upsellItems: prev.upsellItems.filter((id) => id !== Number(itemId)) }));
  };

  // Variant Handlers
  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.price) return;
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: newVariant.name.trim(), price: Number(newVariant.price) }]
    }));
    setNewVariant({ name: "", price: "" });
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  };

  // Add-on Handlers
  const handleAddAddOn = () => {
    if (!newAddOn.name || !newAddOn.price) return;
    setFormData((prev) => ({
      ...prev,
      addOns: [...prev.addOns, { name: newAddOn.name.trim(), price: Number(newAddOn.price) }]
    }));
    setNewAddOn({ name: "", price: "" });
  };

  const handleRemoveAddOn = (index) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.name.trim()) {
      setErrorMsg("Dish name is required");
      return;
    }
    if (!formData.price && formData.price !== 0) {
      setErrorMsg("Price is required");
      return;
    }

    setIsSaving(true);
    const res = await onSave(formData);
    setIsSaving(false);
    if (!res || res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || "Failed to save dish details");
    }
  };

  const availableUpsellDishes = allItems.filter(
    (i) => i.id !== Number(formData.id) && !formData.upsellItems.includes(i.id) &&
      (!upsellSearch || i.name.toLowerCase().includes(upsellSearch.toLowerCase()))
  );

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="menu-drawer-panel">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-tag">{item ? "Edit Dish" : "Create Dish"}</span>
            <h2>{formData.name || "New Dish Item"}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {errorMsg && <div className="drawer-error-banner">{errorMsg}</div>}

        {/* Drawer Body Form */}
        <form className="drawer-body-form" onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-row grid-2">
              <div className="field-group">
                <label>Dish ID *</label>
                <input
                  type="number"
                  value={formData.id}
                  onChange={(e) => handleInputChange("id", Number(e.target.value))}
                  required
                  disabled={!!item}
                />
              </div>
              <div className="field-group">
                <label>Category *</label>
                <select
                  value={formData.categoryName}
                  onChange={(e) => handleInputChange("categoryName", e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <label>Dish Name *</label>
              <input
                type="text"
                placeholder="e.g. Truffle Wagyu Burger"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label>Description</label>
              <textarea
                rows="3"
                placeholder="Brief description of ingredients, flavor profile, and cooking style..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Pricing & Timing */}
          <div className="form-section">
            <h3 className="section-title">Pricing & Timing</h3>
            <div className="form-row grid-3">
              <div className="field-group">
                <label>Base Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="24.99"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Discount Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  value={formData.discountPrice}
                  onChange={(e) => handleInputChange("discountPrice", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Prep Time (mins)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.preparationTime}
                  onChange={(e) => handleInputChange("preparationTime", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Badges Toggles */}
          <div className="form-section">
            <h3 className="section-title">Dietary & Badges</h3>
            <div className="toggles-grid">
              <label className="toggle-card">
                <div className="toggle-text">
                  <span className="toggle-label">Dietary Type</span>
                  <span className="toggle-sub">{formData.isVeg ? "🌱 Veg" : "🍖 Non-Veg"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => handleInputChange("isVeg", e.target.checked)}
                />
              </label>

              <label className="toggle-card">
                <div className="toggle-text">
                  <span className="toggle-label">Availability</span>
                  <span className="toggle-sub">{formData.isAvailable ? "In Stock" : "Out of Stock"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange("isAvailable", e.target.checked)}
                />
              </label>

              <label className="toggle-card">
                <div className="toggle-text">
                  <span className="toggle-label">Bestseller</span>
                  <span className="toggle-sub">Highlight star dish</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => handleInputChange("isBestseller", e.target.checked)}
                />
              </label>

              <label className="toggle-card">
                <div className="toggle-text">
                  <span className="toggle-label">Chef Recommended</span>
                  <span className="toggle-sub">Top pick badge</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isRecommended}
                  onChange={(e) => handleInputChange("isRecommended", e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Section 4: Image Management */}
          <div className="form-section">
            <h3 className="section-title">Dish Image</h3>
            <div className="image-upload-box">
              {formData.image ? (
                <div className="image-preview-container">
                  <img src={formData.image} alt="Dish Preview" className="preview-img" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => handleInputChange("image", "")}
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="upload-drop-zone">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Drag & Drop image here or</span>
                  <label className="file-browse-btn">
                    Browse File
                    <input type="file" accept="image/*" onChange={handleImageFileChange} />
                  </label>
                </div>
              )}
              <div className="field-group" style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={formData.image.startsWith("data:") ? "" : formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value.trim())}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Variants */}
          <div className="form-section">
            <div className="section-header-with-action">
              <h3 className="section-title">Portion Variants (Optional)</h3>
              <span className="sub-hint">e.g. Small / Large</span>
            </div>
            <div className="items-builder-list">
              {formData.variants.map((v, idx) => (
                <div key={idx} className="builder-item-chip">
                  <span><strong>{v.name}</strong> • ${v.price.toFixed(2)}</span>
                  <button type="button" onClick={() => handleRemoveVariant(idx)}>×</button>
                </div>
              ))}
            </div>
            <div className="inline-add-row">
              <input
                type="text"
                placeholder="Variant Name (e.g. Medium)"
                value={newVariant.name}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={newVariant.price}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, price: e.target.value }))}
              />
              <button type="button" className="btn-inline-add" onClick={handleAddVariant}>
                + Add
              </button>
            </div>
          </div>

          {/* Section 6: Add-ons */}
          <div className="form-section">
            <div className="section-header-with-action">
              <h3 className="section-title">Extra Add-ons (Optional)</h3>
              <span className="sub-hint">e.g. Extra Cheese +$1.50</span>
            </div>
            <div className="items-builder-list">
              {formData.addOns.map((a, idx) => (
                <div key={idx} className="builder-item-chip">
                  <span><strong>{a.name}</strong> • +${a.price.toFixed(2)}</span>
                  <button type="button" onClick={() => handleRemoveAddOn(idx)}>×</button>
                </div>
              ))}
            </div>
            <div className="inline-add-row">
              <input
                type="text"
                placeholder="Add-on Name (e.g. Extra Cheese)"
                value={newAddOn.name}
                onChange={(e) => setNewAddOn((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Extra Price ($)"
                value={newAddOn.price}
                onChange={(e) => setNewAddOn((prev) => ({ ...prev, price: e.target.value }))}
              />
              <button type="button" className="btn-inline-add" onClick={handleAddAddOn}>
                + Add
              </button>
            </div>
          </div>

          {/* Section 7: Upsell Recommendations */}
          <div className="form-section">
            <div className="section-header-with-action">
              <h3 className="section-title">Upsell Recommendations</h3>
              <span className="sub-hint">Suggest pairings during checkout</span>
            </div>
            <div className="selected-upsells-list">
              {formData.upsellItems.map((upsellId) => {
                const upsellDish = allItems.find((i) => i.id === upsellId);
                return (
                  <div key={upsellId} className="upsell-item-row">
                    <span>{upsellDish ? upsellDish.name : `Dish #${upsellId}`}</span>
                    <button type="button" onClick={() => handleRemoveUpsell(upsellId)}>Remove</button>
                  </div>
                );
              })}
            </div>
            <div className="upsell-search-container">
              <input
                type="text"
                placeholder="Search dishes to pair..."
                value={upsellSearch}
                onChange={(e) => setUpsellSearch(e.target.value)}
              />
              {upsellSearch && (
                <div className="upsell-search-dropdown">
                  {availableUpsellDishes.length === 0 ? (
                    <div className="dropdown-empty">No matching dishes found</div>
                  ) : (
                    availableUpsellDishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="dropdown-item-row"
                        onClick={() => handleAddUpsell(dish.id)}
                      >
                        <span>{dish.name}</span>
                        <strong>${Number(dish.price).toFixed(2)}</strong>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="drawer-footer-bar">
            {item && onDelete && (
              <button
                type="button"
                className="btn-drawer-delete"
                onClick={() => {
                  if (window.confirm(`Delete "${formData.name}" permanently?`)) {
                    onDelete(item);
                    onClose();
                  }
                }}
              >
                Delete Dish
              </button>
            )}
            <button type="button" className="btn-drawer-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-drawer-submit" disabled={isSaving}>
              {isSaving ? "Saving..." : item ? "Save Changes" : "Create Dish"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

export default MenuDrawer;
