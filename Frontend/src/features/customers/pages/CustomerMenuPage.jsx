import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMenu, useCustomerOrders, useCustomerAuth } from "../hooks/useCustomer.js";
import { resolveTable, fetchPublicBanners } from "../api/customer.api.js";
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

const fallbackBanners = [
  { id: 1, src: indianBanner, alt: "Indian Specialities - Authentic Flavors & Rich Spices" },
  { id: 2, src: chineseBanner, alt: "Chinese Delights - Wok Tossed & Delicious" }
];

const categoryIconPaths = {
  all: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>
  ),
  veg: (
    <>
      <path d="M12 20V9" />
      <path d="M12 10C8 4 4 4 3 4c0 5 4 8 9 6Z" />
      <path d="M12 11c4-6 8-6 9-6 0 5-4 8-9 6Z" />
    </>
  ),
  "non-veg": (
    <>
      <path d="M7.2 11.4c-2.4 2.4-3 5.7-1.3 7.4 1.7 1.7 5 1.1 7.4-1.3l3.9-3.9-6.1-6.1-3.9 3.9Z" />
      <path d="M13.9 6.2c1.4-1.4 3.7-1.4 5.1 0s1.4 3.7 0 5.1l-1.8 1.8-5.1-5.1 1.8-1.8Z" />
      <path d="m17 5 2-2" />
      <path d="m20 8 2-2" />
    </>
  ),
  indian: (
    <>
      <path d="M5 12h14" />
      <path d="M7 12h10l-1.2 5.2A3 3 0 0 1 12.9 20h-1.8a3 3 0 0 1-2.9-2.8L7 12Z" />
      <path d="M8 8c0-1.2 1-1.6 1-2.8" />
      <path d="M12 8c0-1.2 1-1.6 1-2.8" />
      <path d="M16 8c0-1.2 1-1.6 1-2.8" />
    </>
  ),
  chinese: (
    <>
      <path d="M7 10h10" />
      <path d="M8 10v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8" />
      <path d="M9 7c0-1.2 1-1.6 1-2.8" />
      <path d="M12 7c0-1.2 1-1.6 1-2.8" />
      <path d="M15 7c0-1.2 1-1.6 1-2.8" />
    </>
  ),
  dishes: (
    <>
      <path d="M4 18h16" />
      <path d="M6 16a6 6 0 0 1 12 0" />
      <path d="M12 7V5" />
      <path d="M10 5h4" />
    </>
  )
};

const getCategoryKey = (name = "") => {
  const value = name.toLowerCase();
  if (value.includes("veg") && !value.includes("non")) return "veg";
  if (value.includes("non")) return "non-veg";
  if (value.includes("chinese")) return "chinese";
  if (value.includes("indian")) return "indian";
  return "dishes";
};

const CategoryIcon = ({ type }) => (
  <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {categoryIconPaths[type] || categoryIconPaths.dishes}
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
);

const FilterSlidersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 15, height: 15 }}>
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

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const OrdersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

/* Veg / Non-Veg square badge matching reference image 2 (RIGHT Noodles card) */
const VegNonVegBadge = ({ isVeg }) => (
  <div className={`veg-nonveg-badge ${isVeg ? "is-veg" : "is-nonveg"}`} title={isVeg ? "Veg" : "Non-Veg"}>
    <span className="badge-dot" />
  </div>
);

const CustomerMenuPage = () => {
  const { categories, loading: menuLoading, error: menuError } = useMenu();
  const { customer, setCustomer } = useCustomerAuth();
  const { orders, handlePlaceOrder, loading: orderLoading, reload: reloadOrders, readyNotifications, clearReadyNotification } = useCustomerOrders();

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default"); // 'default', 'low-to-high', 'high-to-low'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [dbBanners, setDbBanners] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  useEffect(() => {
    fetchPublicBanners().then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        setDbBanners(
          res.data.map((b) => ({
            id: b._id,
            src: b.imageUrl,
            alt: b.altText || b.title || "Promotional Banner"
          }))
        );
      }
    });
  }, []);

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
      Promise.resolve().then(() => {
        setTableError("No table QR code provided");
        setIsResolvingTable(false);
      });
    }
  }, [urlQrToken]);

  const bannerList = dbBanners;

  const categoryList = useMemo(() => [
    { id: "all", name: "All", count: 0, icon: "all" },
    ...categories.map((cat) => ({
      id: String(cat._id),
      name: cat.name,
      count: cat.items ? cat.items.length : 0,
      icon: getCategoryKey(cat.name)
    }))
  ], [categories]);

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

  const filteredItems = useMemo(() => {
    let items = allItems.filter((item) => {
      const matchCategory = selectedCategoryId === "all" || String(item.categoryId) === String(selectedCategoryId);
      const matchDiet = dietaryFilter === "all" || (dietaryFilter === "veg" && item.isVeg) || (dietaryFilter === "non-veg" && !item.isVeg);
      const query = searchQuery.toLowerCase();
      const matchSearch = !query || item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query);
      return matchCategory && matchDiet && matchSearch;
    });

    if (sortOption === "low-to-high") {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortOption === "high-to-low") {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return items;
  }, [allItems, selectedCategoryId, dietaryFilter, searchQuery, sortOption]);

  const bestSellerItems = useMemo(() => {
    const marked = allItems.filter((item) => item.isBestseller);
    return marked.length ? marked : allItems.slice(0, 6);
  }, [allItems]);

  const handleAddToCart = (item) => {
    if (!item.isAvailable) return;
    if (item.isCustomized) {
      setCart((prev) => {
        const itemKey = `${item.id}_${item.quantity}_${JSON.stringify(item.selectedAddOns || [])}`;
        const existingIdx = prev.findIndex((i) => `${i.id}_${i.quantity}_${JSON.stringify(i.selectedAddOns || [])}` === itemKey);
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
        setOrderSuccessMsg(`Order placed successfully for Table ${tableNo}! The kitchen is preparing your food.`);
        setTimeout(() => setOrderSuccessMsg(null), 8000);
      }
    } else {
      setActionError(res.message || "Failed to place order");
    }
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
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
        if (verifyRes.success) setOrderSuccessMsg(`Payment verified & Order #${orderData.orderId} placed for Table ${tableNo}!`);
        else setOrderSuccessMsg(`Order #${orderData.orderId} placed for Table ${tableNo}! Payment status: Pending.`);
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
      setOrderSuccessMsg(`Order #${orderData.orderId} placed for Table ${tableNo}! (Mock Payment Mode)`);
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
    return sum + (unitPrice * (i.quantity === "Half" ? 0.5 : 1)) * i.count;
  }, 0);

  const renderAddControl = (dish) => {
    const inCart = cart.find((i) => i.id === dish.id);
    if (!dish.isAvailable) return <span className="sold-out-badge">Sold Out</span>;
    if (inCart) {
      return (
        <div className="stepper-pill" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => handleUpdateQuantity(dish.id, inCart.count - 1)} aria-label={`Remove one ${dish.name}`}>-</button>
          <span>{inCart.count}</span>
          <button type="button" onClick={() => handleUpdateQuantity(dish.id, inCart.count + 1)} aria-label={`Add one ${dish.name}`}>+</button>
        </div>
      );
    }
    return (
      <button type="button" className="btn-add-action" onClick={(e) => { e.stopPropagation(); handleAddToCart(dish); }}>
        + Add
      </button>
    );
  };

  if (isResolvingTable) {
    return (
      <div className="customer-menu-page resolving-state">
        <div className="mobile-loading-state">Resolving Table...</div>
      </div>
    );
  }

  if (tableError || !tableNo) {
    return <NotFoundPage />;
  }

  return (
    <div className="customer-menu-page">
      {/* 1. Header (Compact Target UI Header) */}
      <header className="customer-menu-header">
        <div className="customer-brand">
          <h1 className="mobile-brand-title">Reztro</h1>
          <span className="mobile-table-tag">Table {tableNo}</span>
        </div>

        {/* Compact Search Bar */}
        <label className="mobile-search-box">
          <SearchIcon />
          <span className="sr-only">Search dishes</span>
          <input
            type="text"
            placeholder="Search for dishes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        {/* Header Actions */}
        <div className="mobile-header-actions">
          <button type="button" className="btn-icon-subtle" onClick={() => setShowReviewModal(true)} title="Leave a Review">
            <StarIcon />
          </button>
          <button type="button" className="btn-icon-subtle" onClick={() => { reloadOrders(); setShowOrdersModal(true); }} title="My Orders">
            <OrdersIcon />
            {orders.length > 0 && <span className="pill-badge">{orders.length}</span>}
          </button>
          <button type="button" className="btn-cart-pill" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
            <BagIcon />
            {totalCartCount > 0 && <span className="pill-badge primary">{totalCartCount}</span>}
          </button>
        </div>
      </header>

      {/* Notifications */}
      {orderSuccessMsg && (
        <div className="mobile-success-toast" role="status" aria-live="polite">
          <span>{orderSuccessMsg}</span>
          <button type="button" onClick={() => setOrderSuccessMsg(null)} aria-label="Dismiss message">×</button>
        </div>
      )}
      {readyNotifications.map((orderId) => (
        <div key={orderId} className="mobile-success-toast order-ready-toast" role="status" aria-live="polite">
          <span>🍽️ Your order #{orderId} is Ready! Please collect it.</span>
          <button type="button" onClick={() => clearReadyNotification(orderId)} aria-label="Dismiss message">×</button>
        </div>
      ))}
      {(actionError || menuError || tableError) && <div className="mobile-error-toast" role="alert">{tableError || actionError || menuError}</div>}

      <main className="customer-menu-main">
        {/* 2. Promotional Banner */}
        {bannerList.length > 0 && (
          <section className="customer-hero-panel">
            <Carousel
              items={bannerList}
              autoPlay={true}
              autoPlayInterval={3500}
              showDots={true}
              showArrows={false}
              itemsPerView={1}
              className="banner-carousel"
            />
          </section>
        )}

        {/* 3. Filter & Category Chips Horizontal Row */}
        <section className="category-filter-chips-row" aria-label="Categories and Filters">
          {/* Filters Chip */}
          <button
            type="button"
            className={`filter-chip-btn ${dietaryFilter !== "all" || sortOption !== "default" ? "active" : ""}`}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <FilterSlidersIcon />
            <span>filters</span>
          </button>

          {/* Category Chips */}
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip-btn ${selectedCategoryId === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <span>{cat.name.toLowerCase()}</span>
            </button>
          ))}
        </section>

        {/* 4. Bestseller Section */}
        {bestSellerItems.length > 0 && selectedCategoryId === "all" && !searchQuery && (
          <section className="bestseller-section">
            <div className="section-title-row">
              <h2>Bestseller Items</h2>
            </div>
            {menuLoading ? (
              <div className="mobile-loading-state">Loading bestseller menu...</div>
            ) : (
              <Carousel
                items={bestSellerItems}
                autoPlay={false}
                showDots={true}
                showArrows={false}
                itemsPerView={{ mobile: 1.15, tablet: 2.2, desktop: 3.5 }}
                className="bestseller-carousel"
                gap={16}
                renderItem={(dish) => (
                  <article key={dish.id} className={`bestseller-card ${!dish.isAvailable ? 'sold-out' : ''}`} onClick={() => dish.isAvailable && setSelectedDishForCustomization(dish)}>
                    <div className="bestseller-image-wrap">
                      {dish.image ? <img src={dish.image} alt={dish.name} loading="lazy" /> : <div className="dish-placeholder-icon"><CategoryIcon type="dishes" /></div>}
                      <VegNonVegBadge isVeg={dish.isVeg} />
                    </div>
                    <div className="bestseller-card-body">
                      <h3>{dish.name}</h3>
                      <p>{dish.description || "Delicately prepared with fresh ingredients."}</p>
                      <div className="dish-card-footer">
                        <strong>₹{Number(dish.price || 0).toFixed(2)}</strong>
                        {renderAddControl(dish)}
                      </div>
                    </div>
                  </article>
                )}
              />
            )}
          </section>
        )}

        {/* 5. Food Item Cards Section (Horizontal RIGHT Noodles Card Target) */}
        <section className="all-dishes-section">
          {menuLoading ? (
            <div className="mobile-loading-state">Loading dishes...</div>
          ) : filteredItems.length === 0 ? (
            <div className="mobile-empty-state">No dishes match your selected filter</div>
          ) : (
            <div className="all-dishes-list">
              {filteredItems.map((dish) => (
                <article
                  key={dish.id}
                  className={`swiggy-mobile-dish-card ${!dish.isAvailable ? 'sold-out' : ''}`}
                  onClick={() => dish.isAvailable && setSelectedDishForCustomization(dish)}
                >
                  {/* Left Column: Food Image */}
                  <div className="dish-card-image-col">
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} loading="lazy" />
                    ) : (
                      <div className="dish-placeholder-icon"><CategoryIcon type="dishes" /></div>
                    )}
                    <VegNonVegBadge isVeg={dish.isVeg} />
                  </div>

                  {/* Right Column: Title, Desc, Price, Add */}
                  <div className="dish-card-right">
                    <h3 className="dish-card-title">{dish.name}</h3>
                    <p className="dish-desc-snippet">{dish.description || "Delicately prepared with fresh ingredients."}</p>
                    <div className="dish-card-footer">
                      <strong className="dish-price-text">₹{Number(dish.price || 0).toFixed(2)}</strong>
                      {renderAddControl(dish)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Cart Bar */}
      {totalCartCount > 0 && (
        <div className="floating-mobile-cart-bar">
          <div className="cart-mini-icon"><BagIcon /><span>{totalCartCount}</span></div>
          <span className="floating-item-count">{totalCartCount} {totalCartCount === 1 ? "Item" : "Items"}</span>
          <span className="floating-divider" />
          <span className="floating-subtotal">Subtotal</span>
          <strong className="floating-cart-total">₹{totalCartPrice.toFixed(2)}</strong>
          <button type="button" className="floating-cart-btn" onClick={() => setIsCartOpen(true)}>
            View Cart <ArrowRightIcon />
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        sortOption={sortOption}
        setSortOption={setSortOption}
        dietaryFilter={dietaryFilter}
        setDietaryFilter={setDietaryFilter}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} tableNo={tableNo} paymentMode={paymentMode} onPaymentModeChange={setPaymentMode} onPlaceOrder={handleConfirmOrder} isSubmitting={isSubmitting} />
      {showOtpModal && <OtpModal onSuccess={onOtpVerified} onClose={() => setShowOtpModal(false)} />}
      <MyOrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} orders={orders} loading={orderLoading} onRefresh={reloadOrders} />
      <DishDetailModal isOpen={!!selectedDishForCustomization} onClose={() => setSelectedDishForCustomization(null)} dish={selectedDishForCustomization} onAddToCart={handleAddToCart} />
      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} tableNo={tableNo} customerName={customer?.name} />
    </div>
  );
};

export default CustomerMenuPage;
