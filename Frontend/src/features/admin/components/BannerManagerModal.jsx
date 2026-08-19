import React, { useState, useEffect } from "react";
import { fetchAllBanners, createBanner, updateBanner, removeBanner } from "../api/admin.api.js";
import "../styles/BannerManagerModal.css";

const BannerManagerModal = ({ isOpen, onClose, onBannersUpdated }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [altText, setAltText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAllBanners();
    if (res.success) {
      setBanners(res.banners || []);
    } else {
      setError(res.message || "Failed to load banners");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadBanners();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImage("");
    setAltText("");
    setIsActive(true);
    setOrder(banners.length);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setTitle(b.title || "");
    setSubtitle(b.subtitle || "");
    setImage(b.image || "");
    setAltText(b.altText || "");
    setIsActive(b.isActive !== false);
    setOrder(b.order || 0);
    setIsFormOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBanner = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please provide a banner image (URL or upload)");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const bannerData = {
      title,
      subtitle,
      image,
      altText: altText || title || "Promotional Banner",
      isActive,
      order: Number(order) || 0
    };

    let res;
    if (editingBanner) {
      res = await updateBanner({ id: editingBanner._id || editingBanner.id, ...bannerData });
    } else {
      res = await createBanner(bannerData);
    }

    setIsSubmitting(false);
    if (res.success) {
      setIsFormOpen(false);
      await loadBanners();
      if (onBannersUpdated) onBannersUpdated();
    } else {
      setError(res.message || "Failed to save banner");
    }
  };

  const handleToggleActive = async (b) => {
    const res = await updateBanner({
      id: b._id || b.id,
      isActive: !b.isActive
    });
    if (res.success) {
      setBanners((prev) =>
        prev.map((item) =>
          (item._id || item.id) === (b._id || b.id)
            ? { ...item, isActive: !item.isActive }
            : item
        )
      );
      if (onBannersUpdated) onBannersUpdated();
    }
  };

  const handleDeleteBanner = async (b) => {
    if (window.confirm(`Delete promotional banner "${b.title || 'Untitled'}"?`)) {
      const res = await removeBanner(b._id || b.id);
      if (res.success) {
        await loadBanners();
        if (onBannersUpdated) onBannersUpdated();
      } else {
        alert(res.message || "Failed to delete banner");
      }
    }
  };

  return (
    <div className="banner-modal-backdrop" onClick={onClose}>
      <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="banner-modal-header">
          <div>
            <h2>Promotional Food Banners</h2>
            <p>Manage customer-facing promotional banners and offers displayed on the ordering page.</p>
          </div>
          <div className="header-actions">
            {!isFormOpen && (
              <button type="button" className="btn-add-banner" onClick={handleOpenCreate}>
                + Add Banner
              </button>
            )}
            <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {error && <div className="banner-error-banner">{error}</div>}

        {/* Content Area */}
        <div className="banner-modal-body">
          {isFormOpen ? (
            /* Banner Edit / Create Form */
            <form className="banner-form" onSubmit={handleSubmitBanner}>
              <h3>{editingBanner ? "Edit Banner" : "New Promotional Banner"}</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Banner Title (Headline)</label>
                  <input
                    type="text"
                    placeholder="e.g. Indian Dishes / 20% Off Weekend"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Authentic flavors, rich spices, unforgettable taste."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Banner Image (URL or Upload)</label>
                <div className="image-input-row">
                  <input
                    type="text"
                    placeholder="https://... or upload below"
                    value={image.startsWith("data:") ? "[Uploaded Image File]" : image}
                    onChange={(e) => setImage(e.target.value)}
                    disabled={image.startsWith("data:")}
                  />
                  <label className="btn-file-upload">
                    Upload
                    <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: "none" }} />
                  </label>
                  {image && (
                    <button
                      type="button"
                      className="btn-clear-img"
                      onClick={() => setImage("")}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {image && (
                <div className="banner-preview-box">
                  <span className="preview-label">Preview:</span>
                  <img src={image} alt="Banner Preview" className="banner-live-preview" />
                </div>
              )}

              <div className="form-row-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active & Visible on Customer App</span>
                </label>

                <div className="order-input-group">
                  <label>Display Order:</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    style={{ width: "70px" }}
                  />
                </div>
              </div>

              <div className="form-footer-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save-banner"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          ) : (
            /* Banner List View */
            <div className="banner-list-container">
              {loading ? (
                <div className="banner-empty-text">Loading banners...</div>
              ) : banners.length === 0 ? (
                <div className="banner-empty-box">
                  <p>No custom promotional banners added yet.</p>
                  <span>(Default promotional banners are currently active for customers)</span>
                  <button type="button" className="btn-add-banner-empty" onClick={handleOpenCreate}>
                    + Create First Banner
                  </button>
                </div>
              ) : (
                <div className="banners-grid">
                  {banners.map((b) => (
                    <div key={b._id || b.id} className={`banner-card ${b.isActive ? "active" : "inactive"}`}>
                      <div className="banner-card-img-wrap">
                        <img src={b.image} alt={b.altText || b.title || "Banner"} />
                        <span className={`banner-status-badge ${b.isActive ? "status-live" : "status-hidden"}`}>
                          {b.isActive ? "Live" : "Disabled"}
                        </span>
                      </div>
                      <div className="banner-card-body">
                        <div className="banner-card-title">{b.title || "Untitled Banner"}</div>
                        {b.subtitle && <p className="banner-card-sub">{b.subtitle}</p>}
                        <div className="banner-card-meta">
                          <span>Order: {b.order || 0}</span>
                        </div>
                      </div>
                      <div className="banner-card-actions">
                        <button
                          type="button"
                          className="btn-toggle-active"
                          onClick={() => handleToggleActive(b)}
                        >
                          {b.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          className="btn-card-edit"
                          onClick={() => handleOpenEdit(b)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-card-delete"
                          onClick={() => handleDeleteBanner(b)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManagerModal;
