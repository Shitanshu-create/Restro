import React, { useState, useEffect } from "react";
import { useMenu, useCustomerOrders, useCustomerAuth } from "../hooks/useCustomer.js";
import { resolveTable } from "../api/customer.api.js";
import CartDrawer from "../components/CartDrawer.jsx";
import OtpModal from "../components/OtpModal.jsx";
import MyOrdersModal from "../components/MyOrdersModal.jsx";
import DishDetailModal from "../components/DishDetailModal.jsx";
import "../styles/CustomerMenuPage.css";

const CustomerMenuPage = () => {
  const { categories, loading: menuLoading, error: menuError } = useMenu();
  const { customer, setCustomer } = useCustomerAuth();
  const { orders, handlePlaceOrder, loading: orderLoading, reload: reloadOrders } = useCustomerOrders();

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState("all");
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
  const [tableNo, setTableNo] = useState("T-01");

  // Resolve QR token or table param from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("qr");
    const directTable = params.get("table");
    if (directTable) {
      setTableNo(directTable);
    } else if (token) {
      resolveTable(token).then((res) => {
        if (res.success && res.tableNumber) {
          setTableNo(res.tableNumber);
        }
      });
    }
  }, []);

  // Build category list from backend categories
  const categoryList = [
    { id: "all", name: "All Dishes", count: 0 },
    ...categories.map((cat) => ({
      id: String(cat._id),
      name: cat.name,
      count: cat.items ? cat.items.length : 0
    }))
  ];

  // Flatten items across all categories for searching & filtering
  const allItems = categories.flatMap((cat) =>
    (cat.items || []).map((item) => ({
      ...item,
      categoryId: String(cat._id),
      categoryName: cat.name
    }))
  );

  const filteredItems = allItems.filter((item) => {
    const matchCategory = selectedCategoryId === "all" || String(item.categoryId) === String(selectedCategoryId);
    const matchDiet =
      dietaryFilter === "all" ||
      (dietaryFilter === "veg" && item.isVeg) ||
      (dietaryFilter === "non-veg" && !item.isVeg);
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchDiet && matchSearch;
  });

  // Cart Handlers
  const handleAddToCart = (item) => {
    // If dish has variants or add-ons, open customization sheet modal first
    if ((item.variants && item.variants.length > 0) || (item.addOns && item.addOns.length > 0)) {
      setSelectedDishForCustomization(item);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, count: i.count + (item.count || 1) } : i));
      }
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

  const handleRemoveItem = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const executeOrderSubmission = async () => {
    setIsSubmitting(true);
    setActionError(null);
    const orderItems = cart.map((i) => ({
      itemId: i.id,
      quantity: i.quantity || "Full",
      count: i.count || 1
    }));
    const res = await handlePlaceOrder({
      tableNo,
      items: orderItems,
      paymentMode
    });
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayModal = async (razorpayData, orderData) => {
    await loadRazorpayScript();
    const options = {
      key: razorpayData.razorpayKeyId || "rzp_test_mock",
      amount: razorpayData.amount,
      currency: razorpayData.currency || "INR",
      name: "Restro Dine-In",
      description: `Order #${orderData.orderId} Payment`,
      order_id: razorpayData.razorpayOrderId,
      handler: async function (response) {
        const { verifyPayment } = await import("../api/customer.api.js");
        const verifyRes = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
        if (verifyRes.success) {
          setOrderSuccessMsg(`Payment verified & Order #${orderData.orderId} placed for ${tableNo}!`);
        } else {
          setOrderSuccessMsg(`Order #${orderData.orderId} placed for ${tableNo}! Payment status: Pending.`);
        }
        setCart([]);
        setIsCartOpen(false);
        setTimeout(() => setOrderSuccessMsg(null), 8000);
      },
      prefill: {
        name: customer?.name || "",
        contact: customer?.phoneNo || customer?.phone || ""
      },
      theme: { color: "#FF7A1A" }
    };
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      setCart([]);
      setIsCartOpen(false);
      setOrderSuccessMsg(`Order #${orderData.orderId} placed for ${tableNo}! (Mock Payment Mode)`);
      setTimeout(() => setOrderSuccessMsg(null), 8000);
    }
  };

  const handleConfirmOrder = () => {
    const hasToken = !!sessionStorage.getItem("customerToken");
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
  const totalCartPrice = cart.reduce((sum, i) => sum + (i.price * (i.quantity === "Half" ? 0.5 : 1)) * i.count, 0);

  return (
    <div className="customer-mobile-shell">
      {/* 1. Header Navigation Bar */}
      <header className="mobile-header-bar">
        <div className="mobile-brand">
          <div className="brand-dot-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <h1 className="mobile-brand-title">Restro Digital</h1>
            <span className="mobile-table-tag">Table {tableNo}</span>
          </div>
        </div>

        <div className="mobile-header-actions">
          <button
            type="button"
            className="btn-orders-pill"
            onClick={() => {
              reloadOrders();
              setShowOrdersModal(true);
            }}
          >
            My Orders {orders.length > 0 && <span className="pill-badge">{orders.length}</span>}
          </button>

          <button
            type="button"
            className="btn-cart-pill"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalCartCount > 0 && <span className="pill-badge primary">{totalCartCount}</span>}
          </button>
        </div>
      </header>

      {/* Banners */}
      {orderSuccessMsg && (
        <div className="mobile-success-toast">
          <span>{orderSuccessMsg}</span>
          <button onClick={() => setOrderSuccessMsg(null)}>×</button>
        </div>
      )}
      {actionError && <div className="mobile-error-toast">{actionError}</div>}

      {/* 2. Controls & Search */}
      <div className="mobile-controls-container">
        <div className="mobile-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search dishes or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mobile-diet-pills">
          {["all", "veg", "non-veg"].map((d) => (
            <button
              key={d}
              type="button"
              className={`diet-switch-pill ${dietaryFilter === d ? "active" : ""}`}
              onClick={() => setDietaryFilter(d)}
            >
              {d === "all" ? "All" : d === "veg" ? "🌱 Veg" : "🍖 Non-Veg"}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Sticky Horizontal Categories Tab Bar */}
      <nav className="mobile-sticky-categories-bar">
        <div className="categories-scroll-wrapper">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`mobile-cat-pill ${selectedCategoryId === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. Swiggy/Zomato Style Dish Cards Grid */}
      <main className="mobile-dishes-list">
        {menuLoading ? (
          <div className="mobile-loading-state">Loading delicious menu...</div>
        ) : filteredItems.length === 0 ? (
          <div className="mobile-empty-state">No dishes match your selected filter</div>
        ) : (
          filteredItems.map((dish) => {
            const inCart = cart.find((i) => i.id === dish.id);
            return (
              <div key={dish.id} className="swiggy-mobile-dish-card" onClick={() => setSelectedDishForCustomization(dish)}>
                {/* Left Dish Metadata */}
                <div className="dish-card-left">
                  <div className="veg-badge-row">
                    <span className={`veg-dot-sm ${dish.isVeg ? "is-veg" : "is-nonveg"}`} />
                    {dish.isBestseller && <span className="bestseller-mini-tag">Bestseller</span>}
                  </div>
                  <h3 className="dish-card-title">{dish.name}</h3>
                  <div className="dish-card-price-row">
                    <strong className="dish-price-text">${Number(dish.price).toFixed(2)}</strong>
                    {dish.discountPrice > 0 && (
                      <span className="dish-orig-price">${Number(dish.discountPrice).toFixed(2)}</span>
                    )}
                  </div>
                  <p className="dish-desc-snippet">{dish.description || "Delicately prepared with fresh ingredients."}</p>
                </div>

                {/* Right Image + ADD Button */}
                <div className="dish-card-right">
                  <div className="dish-square-image-box">
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} className="dish-square-img" />
                    ) : (
                      <div className="dish-placeholder-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a10 10 0 0 0 0 20" />
                        </svg>
                      </div>
                    )}

                    {/* Stepper / ADD Button Overlay */}
                    <div className="add-button-overlay" onClick={(e) => e.stopPropagation()}>
                      {!dish.isAvailable ? (
                        <span className="sold-out-badge">Sold Out</span>
                      ) : inCart ? (
                        <div className="stepper-pill">
                          <button onClick={() => handleUpdateQuantity(dish.id, inCart.count - 1)}>-</button>
                          <span>{inCart.count}</span>
                          <button onClick={() => handleUpdateQuantity(dish.id, inCart.count + 1)}>+</button>
                        </div>
                      ) : (
                        <button className="btn-add-action" onClick={() => handleAddToCart(dish)}>
                          + ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* 5. Fixed Bottom Floating Cart Bar */}
      {totalCartCount > 0 && (
        <div className="floating-mobile-cart-bar">
          <div className="floating-cart-info">
            <span className="floating-item-count">{totalCartCount} {totalCartCount === 1 ? "Item" : "Items"}</span>
            <strong className="floating-cart-total">${totalCartPrice.toFixed(2)}</strong>
          </div>
          <button className="floating-cart-btn" onClick={() => setIsCartOpen(true)}>
            View Order Cart →
          </button>
        </div>
      )}

      {/* Cart Drawer */}
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

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpModal
          onSuccess={onOtpVerified}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      {/* My Orders Modal */}
      <MyOrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        orders={orders}
        loading={orderLoading}
        onRefresh={reloadOrders}
      />

      {/* Dish Customization Sheet Modal */}
      <DishDetailModal
        isOpen={!!selectedDishForCustomization}
        onClose={() => setSelectedDishForCustomization(null)}
        dish={selectedDishForCustomization}
        allItems={allItems}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default CustomerMenuPage;