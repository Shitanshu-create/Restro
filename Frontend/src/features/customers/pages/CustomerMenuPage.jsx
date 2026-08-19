import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMenu, useCustomerOrders, useCustomerAuth } from "../hooks/useCustomer.js";
import { resolveTable, getPublicBanners } from "../api/customer.api.js";
import CartDrawer from "../components/CartDrawer.jsx";
import OtpModal from "../components/OtpModal.jsx";
import MyOrdersModal from "../components/MyOrdersModal.jsx";
import DishDetailModal from "../components/DishDetailModal.jsx";
import FilterModal from "../components/FilterModal.jsx";
import Carousel from "../utils/Carousel.jsx";
import NotFoundPage from "../../../pages/404NotFound.jsx";
import ReviewModal from "../components/ReviewModal.jsx";
import indianBanner from "../../../../assets/indian.png";
import chineseBanner from "../../../../assets/chinese.png";
import "../styles/CustomerMenuPage.css";

const defaultBanners = [
  { id: "def-1", src: indianBanner, alt: "Indian Dishes - Authentic flavors, rich spices, unforgettable taste." },
  { id: "def-2", src: chineseBanner, alt: "Chinese Delights - Wok Tossed & Delicious" }
];

// Clean FSSAI Veg / Non-Veg Indian Standard Icons
const VegIcon = () => (
  <span className="fssai-symbol veg" title="Vegetarian">
    <span className="fssai-circle" />
  </span>
);

const NonVegIcon = () => (
  <span className="fssai-symbol nonveg" title="Non-Vegetarian">
    <span className="fssai-circle" />
  </span>
);

const DishTag = ({ isVeg }) => (
  <span className="fssai-badge-wrap">
    {isVeg ? <VegIcon /> : <NonVegIcon />}
  </span>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="search-svg-icon">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="bag-svg-icon">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
);

const SlidersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sliders-svg-icon">
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
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const CustomerMenuPage = () => {
  const { categories, loading: menuLoading, error: menuError } = useMenu();
  const { customer, setCustomer } = useCustomerAuth();
  const { orders, handlePlaceOrder, loading: orderLoading, reload: reloadOrders, readyNotifications, clearReadyNotification } = useCustomerOrders();

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState("all"); // all, veg, non-veg
  const [sortBy, setSortBy] = useState("none"); // none, price-asc, price-desc
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedDishForCustomization, setSelectedDishForCustomization] = useState(null);
  const [paymentMode, setPaymentMode] = useState("Online");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { qrToken: urlQrToken } = useParams();
  const [tableNo, setTableNo] = useState(null);
  const [tableError, setTableError] = useState(null);
  const [isResolvingTable, setIsResolvingTable] = useState(true);
  const [banners, setBanners] = useState(defaultBanners);

  // Table Resolution
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = urlQrToken || params.get("token") || params.get("qr");
    if (token) {
      resolveTable(token).then((res) => {
        if (res.success && res.tableNumber) {
          setTableNo(res.tableNumber);
          setTableError(null);
        } else {
          setTableError(res.message || "Invalid table QR code");
        }
        setIsResolvingTable(false);
      });
    } else {
      setTableError("No table QR code provided");
      setIsResolvingTable(false);
    }
  }, [urlQrToken]);

  // Load Promotional Banners
  useEffect(() => {
    getPublicBanners().then((res) => {
      if (res.success && Array.isArray(res.banners) && res.banners.length > 0) {
        setBanners(
          res.banners.map((b) => ({
            id: b._id || b.id,
            src: b.image,
            alt: b.altText || b.title || "Promotional Banner"
          }))
        );
      } else {
        setBanners(defaultBanners);
      }
    });
  }, []);

  // Category List
  const categoryList = useMemo(() => [
    { id: "all", name: "All", count: 0 },
    ...categories.map((cat) => ({
      id: String(cat._id),
      name: cat.name,
      count: cat.items ? cat.items.length : 0
    }))
  ], [categories]);

  // Unify all dishes
  const allItems = useMemo(() => {
    const dishMap = new Map();
    categories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        if (!dishMap.has(item.id)) {
          dishMap.set(item.id, { ...item, categoryId: String(cat._id), categoryName: cat.name });
        }
      });
    });
    return Array.from(dishMap.values());
  }, [categories]);

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        const matchCategory = selectedCategoryId === "all" || String(item.categoryId) === String(selectedCategoryId);
        const matchDiet =
          dietaryFilter === "all" ||
          (dietaryFilter === "veg" && item.isVeg) ||
          (dietaryFilter === "non-veg" && !item.isVeg);
        const query = searchQuery.trim().toLowerCase();
        const matchSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.categoryName?.toLowerCase().includes(query);
        return matchCategory && matchDiet && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
        if (sortBy === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
        return 0;
      });
  }, [allItems, selectedCategoryId, dietaryFilter, searchQuery, sortBy]);

  // Bestsellers
  const bestSellerItems = useMemo(() => {
    const marked = allItems.filter((item) => item.isBestseller);
    return marked.length ? marked : allItems.slice(0, 6);
  }, [allItems]);

  // Add To Cart
  const handleAddToCart = (item) => {
    if (!item.isAvailable) return;
    if (item.isCustomized) {
      setCart((prev) => {
        const itemKey = `${item.id}_${item.quantity}_${JSON.stringify(item.selectedAddOns || [])}`;
        const existingIdx = prev.findIndex(
          (i) => `${i.id}_${i.quantity}_${JSON.stringify(i.selectedAddOns || [])}` === itemKey
        );
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].count += item.count || 1;
          return updated;
        }
        return [...prev, { ...item, count: item.count || 1 }];
      });
      return;
    }

    if ((item.variants && item.variants.length > 0) || (item.addOns && item.addOns.length > 0)) {
      setSelectedDishForCustomization(item);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, count: i.count + (item.count || 1) } : i));
      return [...prev, { ...item, count: item.count || 1, quantity: item.quantity || "Full" }];
    });
  };

  const handleUpdateQuantity = (itemId, newCount) => {
    if (newCount <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, count: newCount } : i)));
  };

  const handleRemoveItem = (itemId) => setCart((prev) => prev.filter((i) => i.id !== itemId));

  const executeOrderSubmission = async () => {
    setIsSubmitting(true);
    setActionError(null);
    const orderItems = cart.map((i) => ({
      itemId: i.id,
      quantity: i.quantity || "Full",
      variantPrice: i.variantPrice || null,
      selectedAddOns: i.selectedAddOns || [],
      count: i.count || 1
    }));
    const res = await handlePlaceOrder({ tableNo, items: orderItems, paymentMode });
    setIsSubmitting(false);
    if (res.success) {
      if (paymentMode === "Online" && res.razorpay) {
        openRazorpayModal(res.razorpay, res.order);
      } else {
        setCart([]);
        setIsCartOpen(false);
        setOrderSuccessMsg(`Order placed successfully for ${tableNo}! The kitchen is preparing your food.`);
        setTimeout(() => setOrderSuccessMsg(null), 8000);
      }
    } else {
      setActionError(res.message || "Failed to place order");
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpayModal = async (razorpayData, orderData) => {
    await loadRazorpayScript();
    const options = {
      key: razorpayData.razorpayKeyId || "rzp_test_mock",
      amount: razorpayData.amount,
      currency: razorpayData.currency || "INR",
      name: "Reztro Dine-In",
      description: `Order #${orderData.orderId} Payment`,
      order_id: razorpayData.razorpayOrderId,
      handler: async function (response) {
        const { verifyPayment } = await import("../api/customer.api.js");
        const verifyRes = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
        if (verifyRes.success) setOrderSuccessMsg(`Payment verified & Order #${orderData.orderId} placed for ${tableNo}!`);
        else setOrderSuccessMsg(`Order #${orderData.orderId} placed for ${tableNo}! Payment status: Pending.`);
        setCart([]);
        setIsCartOpen(false);
        setTimeout(() => setOrderSuccessMsg(null), 8000);
      },
      prefill: { name: customer?.name || "", contact: customer?.phoneNo || customer?.phone || "" },
      theme: { color: "#FF7A1A" }
    };
    if (window.Razorpay) new window.Razorpay(options).open();
    else {
      setCart([]);
      setIsCartOpen(false);
      setOrderSuccessMsg(`Order #${orderData.orderId} placed for ${tableNo}! (Mock Payment Mode)`);
      setTimeout(() => setOrderSuccessMsg(null), 8000);
    }
  };

  const handleConfirmOrder = () => {
    const hasToken = !!localStorage.getItem("customerToken");
    if (!customer || !hasToken) {
      setShowOtpModal(true);
      return;
    }
    executeOrderSubmission();
  };

  const onOtpVerified = (customerData) => {
    setShowOtpModal(false);
    setCustomer(customerData);
    executeOrderSubmission();
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.count, 0);
  const totalCartPrice = cart.reduce((sum, i) => {
    const unitPrice = i.variantPrice !== null && i.variantPrice !== undefined ? Number(i.variantPrice) : Number(i.price || 0);
    const addOnsTotal = Array.isArray(i.selectedAddOns)
      ? i.selectedAddOns.reduce((aSum, a) => aSum + Number(a.price || 0), 0)
      : 0;
    return sum + ((unitPrice * (i.quantity === "Half" ? 0.5 : 1)) + addOnsTotal) * i.count;
  }, 0);

  // Render Add or Stepper Control
  const renderAddControl = (dish) => {
    const inCart = cart.find((i) => i.id === dish.id);
    if (!dish.isAvailable) return <span className="sold-out-badge">Sold Out</span>;
    if (inCart) {
      return (
        <div className="card-stepper-pill" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => handleUpdateQuantity(dish.id, inCart.count - 1)} aria-label={`Remove one ${dish.name}`}>
            -
          </button>
          <span>{inCart.count}</span>
          <button type="button" onClick={() => handleUpdateQuantity(dish.id, inCart.count + 1)} aria-label={`Add one ${dish.name}`}>
            +
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        className="btn-card-add"
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart(dish);
        }}
      >
        + Add
      </button>
    );
  };

  const isFilterActive = sortBy !== "none" || dietaryFilter !== "all";

  if (isResolvingTable) {
    return (
      <div className="customer-menu-page page-centered-loading">
        <div className="mobile-loading-state">
          Resolving Table...
        </div>
      </div>
    );
  }

  if (tableError || !tableNo) {
    return <NotFoundPage />;
  }

  return (
    <div className="customer-menu-container">
      {/* ── 1. Compact Modern Header ── */}
      <header className="zomato-header">
        <div className="zomato-header-inner">
          <div className="header-brand-column">
            <h1 className="header-restaurant-title">Reztro</h1>
            <span className="header-table-badge">Table {tableNo}</span>
          </div>

          {/* Compact Search Bar */}
          <div className="header-search-wrap">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search for dishes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
            />
            {searchQuery && (
              <button type="button" className="btn-search-clear" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          {/* Cart Icon Button */}
          <button
            type="button"
            className="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View Cart"
          >
            <BagIcon />
            {totalCartCount > 0 && <span className="cart-badge-dot">{totalCartCount}</span>}
          </button>
        </div>
      </header>

      {/* Floating Status & Notifications */}
      {orderSuccessMsg && (
        <div className="mobile-success-toast" role="status" aria-live="polite">
          <span>{orderSuccessMsg}</span>
          <button type="button" onClick={() => setOrderSuccessMsg(null)} aria-label="Dismiss">✕</button>
        </div>
      )}
      {readyNotifications.map((orderId) => (
        <div key={orderId} className="mobile-success-toast order-ready-toast" role="status" aria-live="polite">
          <span>🍽️ Your order #{orderId} is Ready! Please collect it.</span>
          <button type="button" onClick={() => clearReadyNotification(orderId)} aria-label="Dismiss">✕</button>
        </div>
      ))}
      {(actionError || menuError || tableError) && (
        <div className="mobile-error-toast" role="alert">{tableError || actionError || menuError}</div>
      )}

      <main className="customer-content-flow">
        {/* ── 2. Promotional Food Banner ── */}
        <section className="promo-banner-section">
          <Carousel
            items={banners}
            autoPlay={true}
            autoPlayInterval={3500}
            showDots={true}
            showArrows={false}
            itemsPerView={1}
            className="promo-carousel"
          />
        </section>

        {/* ── 3. Category & Filter Chips (Single Horizontal Scrolling Row) ── */}
        <section className="category-chips-bar" aria-label="Filter and Categories">
          <div className="chips-horizontal-scroll">
            {/* Filters Button (1st Chip) */}
            <button
              type="button"
              className={`chip-pill filter-trigger-chip ${isFilterActive ? "active-filter" : ""}`}
              onClick={() => setIsFilterModalOpen(true)}
            >
              <SlidersIcon />
              <span>filters</span>
              {isFilterActive && <span className="active-dot" />}
            </button>

            {/* Dynamic Category Chips */}
            {categoryList
              .filter((cat) => cat.id !== "all")
              .map((cat) => {
                const isActive = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip-pill ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategoryId(isActive ? "all" : cat.id);
                    }}
                  >
                    <span>{cat.name.toLowerCase()}</span>
                  </button>
                );
              })}
          </div>
        </section>

        {/* ── 4. Bestseller Items Section ── */}
        {selectedCategoryId === "all" && !searchQuery && (
          <section className="bestsellers-container">
            <h2 className="section-heading">Bestseller Items</h2>
            {menuLoading ? (
              <div className="menu-loading-text">Loading bestsellers...</div>
            ) : (
              <div className="bestsellers-scroll-row">
                {bestSellerItems.map((dish) => (
                  <article
                    key={dish.id}
                    className={`bestseller-item-card ${!dish.isAvailable ? "is-sold-out" : ""}`}
                    onClick={() => dish.isAvailable && setSelectedDishForCustomization(dish)}
                  >
                    <div className="bestseller-img-wrap">
                      <img
                        src={dish.image || dish.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80"}
                        alt={dish.name}
                        loading="lazy"
                      />
                      <DishTag isVeg={dish.isVeg} />
                    </div>
                    <div className="bestseller-card-info">
                      <h3 className="bestseller-dish-title">{dish.name}</h3>
                      <p className="bestseller-dish-desc">
                        {dish.description || "Delicately prepared with fresh ingredients."}
                      </p>
                      <div className="bestseller-card-footer">
                        <strong className="bestseller-price">₹{Number(dish.price || 0).toFixed(2)}</strong>
                        {renderAddControl(dish)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 5. Main Food Item Cards (Matching Target Noodles Card Style) ── */}
        <section className="main-dishes-section">
          {selectedCategoryId !== "all" && (
            <h2 className="section-heading">
              {categoryList.find((c) => c.id === selectedCategoryId)?.name || "Dishes"}
            </h2>
          )}

          {menuLoading ? (
            <div className="menu-loading-text">Loading delicious menu...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-dishes-box">
              <p>No dishes match your selected filter or search.</p>
              <button
                type="button"
                className="btn-clear-filter-state"
                onClick={() => {
                  setSelectedCategoryId("all");
                  setDietaryFilter("all");
                  setSortBy("none");
                  setSearchQuery("");
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="noodles-food-cards-list">
              {filteredItems.map((dish) => (
                <article
                  key={dish.id}
                  className={`noodles-dish-card ${!dish.isAvailable ? "is-sold-out" : ""}`}
                  onClick={() => dish.isAvailable && setSelectedDishForCustomization(dish)}
                >
                  {/* Left: Large Food Image with Veg/Non-Veg Tag */}
                  <div className="dish-left-col">
                    <img
                      src={dish.image || dish.imageUrl || "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80"}
                      alt={dish.name}
                      loading="lazy"
                    />
                    <DishTag isVeg={dish.isVeg} />
                  </div>

                  {/* Right: Details + Price + Add Button */}
                  <div className="dish-right-col">
                    <div className="dish-text-block">
                      <h3 className="noodles-dish-name">{dish.name}</h3>
                      <p className="noodles-dish-desc">
                        {dish.description || "Delicately prepared with fresh ingredients."}
                      </p>
                    </div>
                    <div className="noodles-dish-footer">
                      <strong className="noodles-dish-price">₹{Number(dish.price || 0).toFixed(2)}</strong>
                      {renderAddControl(dish)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── 6. Floating Mobile Cart Bar ── */}
      {totalCartCount > 0 && (
        <div className="floating-cart-footer-bar">
          <div className="floating-cart-info">
            <div className="floating-cart-icon-wrap">
              <BagIcon />
              <span className="cart-count-pill">{totalCartCount}</span>
            </div>
            <div className="floating-cart-labels">
              <span className="floating-cart-item-count">{totalCartCount} {totalCartCount === 1 ? "Item" : "Items"}</span>
              <strong className="floating-cart-total-price">₹{totalCartPrice.toFixed(2)}</strong>
            </div>
          </div>
          <button type="button" className="btn-floating-view-cart" onClick={() => setIsCartOpen(true)}>
            <span>View Cart</span>
            <ArrowRightIcon />
          </button>
        </div>
      )}

      {/* ── Modals & Drawers ── */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentSort={sortBy}
        currentDiet={dietaryFilter}
        onApply={({ sort, diet }) => {
          setSortBy(sort);
          setDietaryFilter(diet);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        tableNo={tableNo}
        paymentMode={paymentMode}
        onPaymentModeChange={setPaymentMode}
        onPlaceOrder={handleConfirmOrder}
        isSubmitting={isSubmitting}
      />

      {showOtpModal && <OtpModal onSuccess={onOtpVerified} onClose={() => setShowOtpModal(false)} />}
      <MyOrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} orders={orders} loading={orderLoading} onRefresh={reloadOrders} />
      <DishDetailModal isOpen={!!selectedDishForCustomization} onClose={() => setSelectedDishForCustomization(null)} dish={selectedDishForCustomization} onAddToCart={handleAddToCart} />
      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} tableNo={tableNo} customerName={customer?.name} />
    </div>
  );
};

export default CustomerMenuPage;
