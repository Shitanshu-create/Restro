import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedSidebar from "../../../components/SharedSidebar.jsx";
import { useAdminMenu } from "../hooks/useAdmin.js";
import API_BASE_URL from "../../../config/env.js";
import "../styles/AdminDashboard.css";
import "../styles/AdminMenuPage.css";

function AdminMenuPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { menu, loading, error, addItem, updateItem, deleteItem } = useAdminMenu();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ categoryName: "", name: "", price: "", isVeg: true });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => setCurrentUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  function openAdd() {
    setForm({ categoryName: "", name: "", price: "", isVeg: true });
    setFormError("");
    setEditItem(null);
    setShowAddModal(true);
  }

  function openEdit(categoryName, item) {
    setForm({ categoryName, name: item.name, price: String(item.price), isVeg: item.isVeg });
    setFormError("");
    setEditItem(item);
    setShowAddModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryName) {
      setFormError("All fields are required.");
      return;
    }
    setFormLoading(true);
    setFormError("");

    let res;
    if (editItem) {
      res = await updateItem(editItem.id, { name: form.name, price: Number(form.price), isVeg: form.isVeg });
    } else {
      res = await addItem({ categoryName: form.categoryName, name: form.name, price: Number(form.price), isVeg: form.isVeg });
    }

    setFormLoading(false);
    if (res.success) {
      setShowAddModal(false);
    } else {
      setFormError(res.message || "Operation failed");
    }
  }

  async function handleDelete(itemId, name) {
    if (!window.confirm(`Remove "${name}" from the menu?`)) return;
    await deleteItem(itemId);
  }

  async function handleToggleAvailability(item) {
    await updateItem(item.id, { isAvailable: !item.isAvailable });
  }

  const categories = menu || [];

  return (
    <div className="admin-layout">
      <SharedSidebar role="admin" user={currentUser} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Menu</h1>
            <p className="admin-topbar__sub">{categories.length} categories</p>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__refresh admin-btn-primary" onClick={openAdd}>
              + Add Item
            </button>
            <div className="admin-topbar__avatar">
              {currentUser?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AD"}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="admin-loading-placeholder">Loading menu...</div>
          ) : error ? (
            <div className="admin-empty" style={{ color: "var(--color-error)" }}>{error}</div>
          ) : categories.length === 0 ? (
            <div className="admin-empty">
              <p>No menu items yet.</p>
              <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>Add First Item</button>
            </div>
          ) : (
            <div className="admin-menu-categories">
              {categories.map(category => (
                <div key={category._id} className="admin-card admin-menu-category">
                  <div className="admin-card__header">
                    <h2 className="admin-card__title">{category.name}</h2>
                    <span className="admin-badge admin-badge--orange">{category.items?.length || 0} items</span>
                  </div>
                  <div className="admin-menu-items">
                    {(category.items || []).map(item => (
                      <div key={item.id} className={`admin-menu-item ${!item.isAvailable ? "admin-menu-item--unavailable" : ""}`}>
                        <div className="admin-menu-item__left">
                          <span className={`veg-dot ${item.isVeg ? "veg-dot--veg" : "veg-dot--nonveg"}`} />
                          <div>
                            <div className="admin-menu-item__name">{item.name}</div>
                            <div className="admin-menu-item__price">₹{item.price}</div>
                          </div>
                        </div>
                        <div className="admin-menu-item__actions">
                          <button
                            className={`admin-availability-toggle ${item.isAvailable ? "admin-availability-toggle--on" : "admin-availability-toggle--off"}`}
                            onClick={() => handleToggleAvailability(item)}
                            title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </button>
                          <button className="admin-menu-item__btn" onClick={() => openEdit(category.name, item)}>✏️</button>
                          <button className="admin-menu-item__btn admin-menu-item__btn--danger" onClick={() => handleDelete(item.id, item.name)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{editItem ? "Edit Item" : "Add Menu Item"}</h2>
              <button className="admin-modal__close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form className="admin-modal__body" onSubmit={handleSubmit}>
              {formError && (
                <div className="admin-form-error">{formError}</div>
              )}
              <div className="admin-form-field">
                <label className="admin-form-label">Category</label>
                <input
                  className="admin-form-input"
                  value={form.categoryName}
                  onChange={e => setForm(f => ({ ...f, categoryName: e.target.value }))}
                  placeholder="e.g. Starters, Main Course"
                  disabled={!!editItem}
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Item Name</label>
                <input
                  className="admin-form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Paneer Tikka"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Price (₹)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 250"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Type</label>
                <select
                  className="admin-form-input"
                  value={form.isVeg ? "veg" : "nonveg"}
                  onChange={e => setForm(f => ({ ...f, isVeg: e.target.value === "veg" }))}
                >
                  <option value="veg">🟢 Vegetarian</option>
                  <option value="nonveg">🔴 Non-Vegetarian</option>
                </select>
              </div>
              <button type="submit" className="admin-modal__action-btn" disabled={formLoading}>
                {formLoading ? "Saving..." : editItem ? "Update Item" : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenuPage;
