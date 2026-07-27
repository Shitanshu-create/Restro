import React, { useState } from "react";
import { useMenu } from "../hooks/useAdmin.js";
import "../styles/MenuPage.css";


const MenuPage = () => {
  const {
    categories, items, loading, error,
    handleCreateItem, handleCreateCategory,
    handleRemoveItem, handleRemoveCategory,
    handleToggleAvailability,
    handleAssignItemToCategory, handleRemoveItemFromCategory
  } = useMenu();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [actionError, setActionError] = useState(null);


  const [itemImage, setItemImage] = useState("");
  const [editingImageItem, setEditingImageItem] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setItemImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addItem = async (event) => {
    event.preventDefault();
    setActionError(null);
    const formData = new FormData(event.currentTarget);
    const newItem = {
      id: Number(formData.get("id")),
      name: String(formData.get("name") || ""),
      price: Number(formData.get("price") || 0),
      isVeg: formData.get("type") === "Veg",
      isAvailable: formData.get("available") === "on",
      image: itemImage
    };

    const res = await handleCreateItem(newItem);
    if (res.success) {
      setItemImage("");
      setActiveModal(null);
    } else {
      setActionError(res.message || "Failed to create item");
    }
  };

  const handleSaveImageUpdate = async (e) => {
    e.preventDefault();
    if (!editingImageItem) return;
    const res = await handleUpdateItemImage({
      id: editingImageItem.id,
      name: editingImageItem.name,
      image: newImageUrl
    });
    if (res.success) {
      setEditingImageItem(null);
      setNewImageUrl("");
    } else {
      setActionError(res.message || "Failed to update item image");
    }
  };
  const addCategory = async (event) => {
    event.preventDefault();
    setActionError(null);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();

    const res = await handleCreateCategory(name);
    if (res.success) {
      setActiveModal(null);
    } else {
      setActionError(res.message || "Failed to create category");
    }
  };




  const assignItemToCategory = async () => {
    if (!selectedItemId || !selectedCategoryName) return;
    setActionError(null);
    const item = items.find((i) => String(i.id) === String(selectedItemId));
    if (!item) return;


    const res = await handleAssignItemToCategory({
      itemId: item.id,
      itemName: item.name,
      categoryName: selectedCategoryName
    });
    if (!res.success) {
      setActionError(res.message || "Failed to assign item");
    }
  };




  const removeItemFromCat = async (categoryName, item) => {
    await handleRemoveItemFromCategory({
      itemId: item.id,
      itemName: item.name,
      categoryName
    });
  };
  const deleteCategory = async (name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      await handleRemoveCategory(name);
    }
  };
  const deleteItem = async (item) => {
    if (window.confirm(`Delete food item "${item.name}"?`)) {
      await handleRemoveItem({ id: item.id, name: item.name });
    }
  };
  return (
    <div className="menu-page">
      {/* Header Bar */}
      <div className="menu-top-bar">
        <div>
          <h1 className="menu-header-title">Menu Setup</h1>
          <p className="menu-header-subtitle">Catalog tools and category assignment</p>
        </div>
        <div className="menu-actions-row">
          <button className="menu-btn-primary" type="button" onClick={() => setActiveModal("item")}>
            + Add Item
          </button>
          <button className="menu-btn-secondary" type="button" onClick={() => setActiveModal("category")}>
            + Add Category
          </button>
        </div>
      </div>
      {error && <div className="login-error" role="alert">{error}</div>}
      {actionError && <div className="login-error" role="alert">{actionError}</div>}
      {/* Category Assignment Panel */}
      <div className="menu-assign-card">
        <div className="assign-header">
          <h3>Add Item to Category</h3>
          <p>Assign existing dish items to a menu category</p>
        </div>
        <div className="assign-controls">
          <div className="control-field">
            <label>Select Item</label>
            <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
              <option value="">-- Choose Item --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} (${item.price})</option>
              ))}
            </select>
          </div>
          <div className="control-field">
            <label>Select Category</label>
            <select value={selectedCategoryName} onChange={(e) => setSelectedCategoryName(e.target.value)}>
              <option value="">-- Choose Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button className="assign-action-btn" type="button" onClick={assignItemToCategory}>
            Assign Item
          </button>
        </div>
      </div>
      {/* Full Menu Category Cards Grid */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading menu...</div>
      ) : categories.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>No menu categories found. Create a category or add items to start.</div>
      ) : (
        <div className="menu-categories-grid">
          {categories.map((category) => (
            <div key={category._id} className="category-card">
              <div className="category-card-header">
                <div>
                  <span className="category-tag">Category</span>
                  <h3 className="category-name">{category.name}</h3>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="item-count-badge">{category.items ? category.items.length : 0} items</span>
                  <button
                    onClick={() => deleteCategory(category.name)}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="category-items-list">
                {category.items && category.items.map((item) => (
                  <div key={item.id} className="menu-item-card-row">
                    <div className="item-main-info">
                      <div className="item-title-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🍽️</div>
                        )}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className={`veg-dot ${item.isVeg ? "is-veg" : "is-nonveg"}`} />
                            <strong className="item-title">{item.name} (ID: {item.id})</strong>
                          </div>
                          <span className="item-price-text">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="item-actions-right">
                      <button
                        className="item-remove-btn"
                        type="button"
                        onClick={() => {
                          setEditingImageItem(item);
                          setNewImageUrl(item.image || "");
                        }}
                        title="Change Photo"
                      >
                        🖼️ Photo
                      </button>
                      <button
                        className={`avail-badge ${item.isAvailable ? "in-stock" : "out-of-stock"}`}
                        onClick={() => handleToggleAvailability({ id: item.id, name: item.name })}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                      <button
                        className="item-remove-btn"
                        type="button"
                        onClick={() => removeItemFromCat(category.name, item)}
                        title="Remove from category"
                      >
                        Remove
                      </button>
                      <button
                        className="item-remove-btn"
                        type="button"
                        onClick={() => deleteItem(item)}
                        style={{ color: "#dc2626" }}
                        title="Delete item permanently"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(!category.items || category.items.length === 0) && (
                  <div className="empty-category-notice">No items assigned yet</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modals */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{activeModal === "item" ? "Add New Dish Item" : "Add New Category"}</h3>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {activeModal === "item" ? (
              <form className="modal-form" onSubmit={addItem}>
                <div className="form-group">
                  <label>Item ID (Unique Number)</label>
                  <input name="id" type="number" placeholder="e.g. 101" required />
                </div>
                <div className="form-group">
                  <label>Item Name</label>
                  <input name="name" type="text" placeholder="e.g. Truffle Wagyu Burger" required />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input name="price" type="number" step="0.01" min="0" placeholder="e.g. 25.00" required />
                </div>
                <div className="form-group">
                  <label>Dietary Type</label>
                  <select name="type" defaultValue="Veg">
                    <option value="Veg">Veg</option>
                    <option value="Non-veg">Non-veg</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Item Photo (Upload File)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div className="form-group">
                  <label>Or Paste Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={itemImage.startsWith("data:") ? "" : itemImage}
                    onChange={(e) => setItemImage(e.target.value.trim())}
                  />
                  {itemImage && (
                    <img
                      src={itemImage}
                      alt="Preview"
                      style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", marginTop: "8px" }}
                    />
                  )}
                </div>
                <div className="form-check-group">
                  <input name="available" type="checkbox" id="avail-check" defaultChecked />
                  <label htmlFor="avail-check">Available for ordering</label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn-save">Create Item</button>
                </div>
              </form>
            ) : (
              <form className="modal-form" onSubmit={addCategory}>
                <div className="form-group">
                  <label>Category Name</label>
                  <input name="name" type="text" placeholder="e.g. Chef Specials" required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn-save">Create Category</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Item Image Modal */}
      {editingImageItem && (
        <div className="modal-backdrop" onClick={() => setEditingImageItem(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Photo for {editingImageItem.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditingImageItem(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSaveImageUpdate}>
              <div className="form-group">
                <label>Upload New Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setNewImageUrl(reader.result);
                    reader.readAsDataURL(file);
                  }}
                  style={{ fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label>Or Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
              </div>
              {newImageUrl && (
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    style={{ width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover" }}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingImageItem(null)}>Cancel</button>
                <button type="submit" className="btn-save">Save Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MenuPage;
