import { useState, useMemo } from "react";
import { useMenu, useBanners } from "../hooks/useAdmin.js";
import MenuDrawer from "../components/MenuDrawer.jsx";
import "../styles/MenuPage.css";

const BannerModalManager = ({ isOpen, onClose }) => {
  const { banners, loading, handleCreateBanner, handleDeleteBanner } = useBanners();
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImageUrl(evt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setIsSubmitting(true);
    const res = await handleCreateBanner({ imageUrl: imageUrl.trim() });
    setIsSubmitting(false);
    if (res.success) {
      setImageUrl("");
      setMsg("Banner added successfully!");
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="category-modal-card banner-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px", width: "92%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Banner Management</h3>
          <button type="button" className="btn-modal-cancel" onClick={onClose} style={{ border: 0, background: "transparent", fontSize: "22px", cursor: "pointer" }}>×</button>
        </div>

        {msg && <div style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", fontWeight: "600" }}>{msg}</div>}

        {/* Add Banner Section */}
        <div style={{ marginBottom: "24px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#334155" }}>Add Banner</h4>
          <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Paste Image URL or select file →"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
              <label style={{ padding: "9px 12px", borderRadius: "8px", background: "#ffffff", border: "1px solid #cbd5e1", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "#475569", whiteSpace: "nowrap" }}>
                Upload File
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>
            {imageUrl && (
              <div style={{ width: "100%", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <button
              type="submit"
              className="btn-modal-submit"
              disabled={isSubmitting || !imageUrl.trim()}
              style={{ padding: "10px", borderRadius: "8px", background: "var(--color-primary, #FF7A1A)", color: "#ffffff", border: 0, fontWeight: "700", fontSize: "14px", cursor: isSubmitting || !imageUrl.trim() ? "not-allowed" : "pointer", opacity: isSubmitting || !imageUrl.trim() ? 0.6 : 1 }}
            >
              {isSubmitting ? "Adding Banner..." : "+ Add Banner"}
            </button>
          </form>
        </div>

        {/* Existing Banners Section */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#334155" }}>
            Existing Banners ({banners.length})
          </h4>
          {loading ? (
            <div style={{ fontSize: "13px", color: "#64748b", padding: "12px 0" }}>Loading banners...</div>
          ) : banners.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: "13px", padding: "16px 0", textAlign: "center" }}>No active banners. Add a banner above!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "260px", overflowY: "auto" }}>
              {banners.map((b) => (
                <div
                  key={b._id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#ffffff" }}
                >
                  <img
                    src={b.imageUrl}
                    alt="Banner preview"
                    style={{ width: "120px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid #f1f5f9" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Remove this banner from customer menu?")) handleDeleteBanner(b._id);
                    }}
                    style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuPage = () => {
  const {
    categories, items, loading,
    handleCreateItem, handleCreateCategory,
    handleRemoveItem, handleRemoveCategory,
    handleToggleAvailability, handleUpdateMenuItem,
    handleUpdateCategory, handleReorderCategories,
    handleBulkOperations
  } = useMenu();

  // State management
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all"); // all, veg, non-veg
  const [stockFilter, setStockFilter] = useState("all"); // all, available, unavailable
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name"); // name, price-asc, price-desc, updated

  // Bulk Operations State
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState("");
  const [bulkPricePct, setBulkPricePct] = useState(10);

  // Modal / Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null); // 'create' or 'rename'
  const [targetCategoryName, setTargetCategoryName] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [actionMsg, setActionMsg] = useState(null);

  // Drag and drop categories
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);

  // Build unified items list mapped with categoryName
  const allDishes = useMemo(() => {
    const dishMap = new Map();
    // Gather from categories
    categories.forEach((cat) => {
      (cat.items || []).forEach((i) => {
        dishMap.set(Number(i.id), { ...i, categoryName: cat.name });
      });
    });
    // Gather loose items from items array
    items.forEach((i) => {
      if (!dishMap.has(Number(i.id))) {
        dishMap.set(Number(i.id), { ...i, categoryName: "Unassigned" });
      }
    });
    return Array.from(dishMap.values());
  }, [categories, items]);

  // Filtering & Sorting
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      // Category filter
      if (selectedCategoryId !== "all") {
        const cat = categories.find((c) => String(c._id) === String(selectedCategoryId));
        if (cat && dish.categoryName !== cat.name) return false;
      }
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = dish.name.toLowerCase().includes(q);
        const matchDesc = dish.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      // Diet filter
      if (dietFilter === "veg" && !dish.isVeg) return false;
      if (dietFilter === "non-veg" && dish.isVeg) return false;

      // Stock filter
      if (stockFilter === "available" && !dish.isAvailable) return false;
      if (stockFilter === "unavailable" && dish.isAvailable) return false;

      // Bestseller filter
      if (bestsellerOnly && !dish.isBestseller) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "updated") return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      return a.name.localeCompare(b.name);
    });
  }, [allDishes, categories, selectedCategoryId, searchQuery, dietFilter, stockFilter, bestsellerOnly, sortBy]);

  // Handle Opening Drawer
  const handleOpenAddDish = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDish = (dish) => {
    setEditingItem(dish);
    setIsDrawerOpen(true);
  };

  // Save Dish Handler
  const handleSaveDish = async (formData) => {
    if (editingItem) {
      const res = await handleUpdateMenuItem(formData);
      if (res.success) {
        setActionMsg(`Updated dish "${formData.name}" successfully!`);
        setTimeout(() => setActionMsg(null), 4000);
      }
      return res;
    } else {
      const res = await handleCreateItem(formData);
      if (res.success) {
        setActionMsg(`Created dish "${formData.name}" successfully!`);
        setTimeout(() => setActionMsg(null), 4000);
      }
      return res;
    }
  };

  // Duplicate Dish Handler
  const handleDuplicateDish = async (dish) => {
    const res = await handleBulkOperations({
      action: "duplicate",
      itemIds: [dish.id]
    });
    if (res.success) {
      setActionMsg(`Duplicated "${dish.name}"`);
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  // Delete Single Dish Handler
  const handleDeleteDish = async (dish) => {
    if (window.confirm(`Delete food item "${dish.name}"?`)) {
      await handleRemoveItem({ id: dish.id, name: dish.name });
      setActionMsg(`Deleted "${dish.name}"`);
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  // Category Drag and Drop Reordering
  const handleCatDragStart = (idx) => {
    setDraggedCatIndex(idx);
  };

  const handleCatDrop = async (dropIdx) => {
    if (draggedCatIndex === null || draggedCatIndex === dropIdx) return;
    const catList = [...categories];
    const [moved] = catList.splice(draggedCatIndex, 1);
    catList.splice(dropIdx, 0, moved);
    setDraggedCatIndex(null);

    const orderedNames = catList.map((c) => c.name);
    await handleReorderCategories(orderedNames);
  };

  // Category CRUD
  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    const res = await handleCreateCategory(newCategoryInput.trim());
    if (res.success) {
      setNewCategoryInput("");
      setCategoryModal(null);
      setActionMsg(`Created category "${newCategoryInput}"`);
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleRenameCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim() || !targetCategoryName) return;
    const res = await handleUpdateCategory({
      oldName: targetCategoryName,
      newName: newCategoryInput.trim()
    });
    if (res.success) {
      setNewCategoryInput("");
      setCategoryModal(null);
      setActionMsg(`Renamed category to "${newCategoryInput}"`);
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleDeleteCategoryClick = async (catName) => {
    if (window.confirm(`Delete menu category "${catName}"? Dishes inside will be unassigned.`)) {
      await handleRemoveCategory(catName);
      setSelectedCategoryId("all");
    }
  };

  // Bulk Selection Handlers
  const toggleSelectDish = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredDishes.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredDishes.map((d) => d.id));
    }
  };

  const handleExecuteBulk = async () => {
    if (!bulkAction || selectedItemIds.length === 0) return;

    let payload = { action: bulkAction, itemIds: selectedItemIds };

    if (bulkAction === "changeCategory") {
      if (!bulkCategoryTarget) {
        alert("Please choose a target category");
        return;
      }
      payload.targetCategory = bulkCategoryTarget;
    } else if (bulkAction === "adjustPrice") {
      payload.percentage = bulkPricePct;
    }

    const res = await handleBulkOperations(payload);
    if (res.success) {
      setSelectedItemIds([]);
      setBulkAction("");
      setActionMsg(`Bulk operation '${bulkAction}' applied!`);
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  // Export / Import Menu JSON
  const handleExportMenu = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allDishes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `restro_menu_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportMenu = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const importedDishes = JSON.parse(evt.target.result);
        if (Array.isArray(importedDishes)) {
          for (const dish of importedDishes) {
            await handleCreateItem(dish);
          }
          setActionMsg(`Successfully imported ${importedDishes.length} menu items!`);
          setTimeout(() => setActionMsg(null), 4000);
        }
      } catch {
        alert("Invalid JSON menu file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="swiggy-menu-page">
      {/* 1. Header Bar */}
      <header className="swiggy-menu-header">
        {actionMsg && <div className="login-error" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>{actionMsg}</div>}
        <div className="header-right-actions">
          <label className="btn-import-menu">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import JSON
            <input type="file" accept=".json" onChange={handleImportMenu} />
          </label>
          <button type="button" className="btn-export-menu" onClick={() => setIsBannerModalOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Manage Banners
          </button>
          <button type="button" className="btn-add-dish-primary" onClick={handleOpenAddDish}>
            + Add Dish
          </button>
        </div>
      </header>

      {/* 2. Sticky Horizontal Category Navigation Bar */}
      <nav className="sticky-category-nav-bar">
        <div className="category-scroll-container">
          <button
            type="button"
            className={`cat-tab-btn ${selectedCategoryId === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategoryId("all")}
          >
            All Dishes
            <span className="cat-count-badge">{allDishes.length}</span>
          </button>

          {categories.map((cat, idx) => (
            <div
              key={cat._id}
              className={`cat-tab-wrapper ${selectedCategoryId === String(cat._id) ? "active" : ""}`}
              draggable
              onDragStart={() => handleCatDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleCatDrop(idx)}
            >
              <button
                type="button"
                className="cat-tab-btn-content"
                onClick={() => setSelectedCategoryId(String(cat._id))}
              >
                {cat.name}
                <span className="cat-count-badge">{cat.items ? cat.items.length : 0}</span>
              </button>

              {/* Category Quick Actions */}
              <div className="cat-quick-options">
                <button
                  type="button"
                  title="Rename category"
                  onClick={() => {
                    setTargetCategoryName(cat.name);
                    setNewCategoryInput(cat.name);
                    setCategoryModal("rename");
                  }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  title="Delete category"
                  onClick={() => handleDeleteCategoryClick(cat.name)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-new-category-tab"
          onClick={() => {
            setNewCategoryInput("");
            setCategoryModal("create");
          }}
        >
          + New Category
        </button>
      </nav>

      {/* 3. Toolbar (Search, Filter, Sort) */}
      <div className="swiggy-menu-toolbar">
        {/* Search Bar */}
        <div className="toolbar-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by dish name or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="toolbar-filters-group">
          {/* Diet Filter */}
          <div className="filter-pill-switch">
            {["all", "veg", "non-veg"].map((d) => (
              <button
                key={d}
                type="button"
                className={`switch-btn ${dietFilter === d ? "active" : ""}`}
                onClick={() => setDietFilter(d)}
              >
                {d === "all" ? "All Diets" : d === "veg" ? "Veg" : "Non-Veg"}
              </button>
            ))}
          </div>

          {/* Stock Filter */}
          <div className="filter-pill-switch">
            {["all", "available", "unavailable"].map((s) => (
              <button
                key={s}
                type="button"
                className={`switch-btn ${stockFilter === s ? "active" : ""}`}
                onClick={() => setStockFilter(s)}
              >
                {s === "all" ? "All Stock" : s === "available" ? "In Stock" : "Out of Stock"}
              </button>
            ))}
          </div>

          {/* Bestseller Toggle Pill */}
          <button
            type="button"
            className={`bestseller-toggle-pill ${bestsellerOnly ? "active" : ""}`}
            onClick={() => setBestsellerOnly(!bestsellerOnly)}
          >
            ★ Bestsellers Only
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="toolbar-sort-group">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Dish Name (A-Z)</option>
            <option value="price-asc">Price (Low → High)</option>
            <option value="price-desc">Price (High → Low)</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Select All Row */}
      {filteredDishes.length > 0 && (
        <div className="select-all-bar">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedItemIds.length === filteredDishes.length && filteredDishes.length > 0}
              onChange={toggleSelectAll}
            />
            Select All ({filteredDishes.length} Dishes)
          </label>
          {selectedItemIds.length > 0 && (
            <span className="selected-count-tag">{selectedItemIds.length} items selected</span>
          )}
        </div>
      )}

      {/* 4. Menu Items Grid */}
      {loading ? (
        <div className="swiggy-loading-state">Loading menu items...</div>
      ) : filteredDishes.length === 0 ? (
        <div className="swiggy-empty-state">
          <h3>No dishes match your filters</h3>
          <p>Try adjusting your search query, dietary, or stock filter settings.</p>
        </div>
      ) : (
        <div className="swiggy-dishes-grid">
          {filteredDishes.map((dish) => {
            const isSelected = selectedItemIds.includes(dish.id);
            return (
              <div
                key={dish.id}
                className={`dish-card-item ${!dish.isAvailable ? "is-out-of-stock" : ""} ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleOpenEditDish(dish)}
              >
                {/* Select Checkbox */}
                <div
                  className="card-checkbox-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectDish(dish.id);
                  }}
                >
                  <input type="checkbox" checked={isSelected} readOnly />
                </div>

                {/* Card Image Box */}
                <div className="card-image-box">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="dish-cover-img" />
                  ) : (
                    <div className="dish-img-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 0 0 20" />
                      </svg>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="card-badges-row">
                    <span className={`veg-dot-badge ${dish.isVeg ? "is-veg" : "is-nonveg"}`} />
                    {dish.isBestseller && <span className="bestseller-badge">Bestseller</span>}
                    {dish.isRecommended && <span className="recommended-badge">Chef Pick</span>}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="card-content-body">
                  <div className="card-title-row">
                    <h3 className="dish-card-name">{dish.name}</h3>
                    <span className="dish-card-id">#{dish.id}</span>
                  </div>

                  <span className="dish-card-category">{dish.categoryName}</span>

                  <div className="card-price-row">
                    <span className="current-price">₹{Number(dish.price).toFixed(2)}</span>
                    {dish.discountPrice > 0 && (
                      <span className="discount-price">₹{Number(dish.discountPrice).toFixed(2)}</span>
                    )}
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="card-hover-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="hover-action-btn btn-edit"
                      onClick={() => handleOpenEditDish(dish)}
                      title="Edit dish"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="hover-action-btn btn-dup"
                      onClick={() => handleDuplicateDish(dish)}
                      title="Duplicate dish"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className={`hover-action-btn ${dish.isAvailable ? "btn-stock" : "btn-unstock"}`}
                      onClick={() => handleToggleAvailability({ id: dish.id, name: dish.name })}
                      title="Toggle availability"
                    >
                      {dish.isAvailable ? "In Stock" : "Out"}
                    </button>
                    <button
                      type="button"
                      className="hover-action-btn btn-delete"
                      onClick={() => handleDeleteDish(dish)}
                      title="Delete dish"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Bulk Actions Floating Toolbar */}
      {selectedItemIds.length > 0 && (
        <div className="floating-bulk-bar">
          <span className="bulk-count"><strong>{selectedItemIds.length}</strong> Dishes Selected</span>
          <div className="bulk-controls">
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">-- Choose Bulk Action --</option>
              <option value="markAvailable">Mark Available</option>
              <option value="markUnavailable">Mark Out of Stock</option>
              <option value="changeCategory">Change Category</option>
              <option value="adjustPrice">Adjust Prices (%)</option>
              <option value="duplicate">Duplicate Selected</option>
              <option value="delete">Delete Selected</option>
            </select>

            {bulkAction === "changeCategory" && (
              <select value={bulkCategoryTarget} onChange={(e) => setBulkCategoryTarget(e.target.value)}>
                <option value="">-- Select Target Category --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}

            {bulkAction === "adjustPrice" && (
              <input
                type="number"
                placeholder="% Change (e.g. +10 or -10)"
                value={bulkPricePct}
                onChange={(e) => setBulkPricePct(Number(e.target.value))}
                style={{ width: "160px" }}
              />
            )}

            <button type="button" className="btn-apply-bulk" onClick={handleExecuteBulk}>
              Apply Action
            </button>
            <button type="button" className="btn-cancel-bulk" onClick={() => setSelectedItemIds([])}>
              Cancel Selection
            </button>
          </div>
        </div>
      )}

      {/* 6. Persistent Right Side Editing Drawer */}
      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={editingItem}
        categories={categories}
        allItems={allDishes}
        onSave={handleSaveDish}
        onDelete={handleDeleteDish}
      />

      {/* Category Create / Rename Modal */}
      {categoryModal && (
        <div className="modal-backdrop" onClick={() => setCategoryModal(null)}>
          <div className="category-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{categoryModal === "create" ? "Create New Category" : `Rename Category "${targetCategoryName}"`}</h3>
            <form onSubmit={categoryModal === "create" ? handleCreateCategorySubmit : handleRenameCategorySubmit}>
              <div className="field-group" style={{ margin: "16px 0" }}>
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chef Specials"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setCategoryModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  {categoryModal === "create" ? "Create Category" : "Save Name"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Management Modal */}
      {isBannerModalOpen && (
        <BannerModalManager isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} />
      )}
    </div>
  );
};

export default MenuPage;
