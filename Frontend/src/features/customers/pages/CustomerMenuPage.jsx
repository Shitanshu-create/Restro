import React, { useState, useEffect } from "react";
import { useMenu, useCustomerOrders, useCustomerAuth } from "../hooks/useCustomer.js";
import { resolveTable } from "../api/customer.api.js";
import CartDrawer from "../components/CartDrawer.jsx";
import OtpModal from "../components/OtpModal.jsx";
import MyOrdersModal from "../components/MyOrdersModal.jsx";
import "../styles/CustomerMenuPage.css";
const CustomerMenuPage = () => {
  const { categories, loading: menuLoading, error: menuError } = useMenu();
  const { customer, setCustomer, handleLogout } = useCustomerAuth();
  const { orders, handlePlaceOrder, loading: orderLoading, reload: reloadOrders } = useCustomerOrders();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
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
    { id: "all", name: "All Dishes", icon: "🍽️" },
    ...categories.map((cat) => ({
      id: String(cat._id),
      name: cat.name,
      icon: "🍴"
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
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchDiet && matchSearch;
  });



  // Cart Handlers
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, count: i.count + 1 } : i));
      }
      return [...prev, { ...item, count: 1, quantity: "Full" }];
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


  const openRazorpayModal = (razorpayData, orderData) => {
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
      theme: {
        color: "#2563eb"
      }
    };
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Dev mock fallback if script isn't blocked by adblockers
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
    <div className="customer-menu-shell">
      {/* Top Customer Header */}
      <header className="customer-header">
        <div className="cust-brand-group">
          <div className="cust-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 2L6 14" /><path d="M6 2l12 14" /><path d="M12 14v8" />
            </svg>
          </div>
          <div>
            <h1 className="cust-brand-name">Restro Dine-In</h1>
            <p className="cust-brand-sub">Scan & Order directly from Table</p>
          </div>
        </div>
        <div className="cust-header-right">
          <div className="table-badge-pill">
            <span className="table-dot" />
            {tableNo}
          </div>
          <button
            className="cart-trigger-btn"
            style={{ background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1" }}
            onClick={() => {
              reloadOrders();
              setShowOrdersModal(true);
            }}
          >
            📋 My Orders {orders.length > 0 && <span className="cart-badge-count">{orders.length}</span>}
          </button>
          <button
            className="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Cart
            {totalCartCount > 0 && <span className="cart-badge-count">{totalCartCount}</span>}
          </button>
        </div>
      </header>
      {/* Success Banner */}
      {orderSuccessMsg && (
        <div className="order-success-banner">
          <span>{orderSuccessMsg}</span>
          <button onClick={() => setOrderSuccessMsg(null)}>×</button>
        </div>
      )}
      {/* Action Error Banner */}
      {actionError && (
        <div className="login-error" role="alert" style={{ margin: "16px auto", maxWidth: "1200px" }}>
          {actionError}
        </div>
      )}
      <div className="customer-menu-body">
        {/* Category Sidebar */}
        <aside className="category-sidebar">
          <span className="cat-sidebar-label">CATEGORIES</span>
          <nav className="cat-nav-list">
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                className={`cat-nav-btn ${selectedCategoryId === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <span className="cat-emoji">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Menu Grid Area */}
        <main className="menu-dishes-main">
          {/* Controls Bar: Search & Diet Filter */}
          <div className="dishes-controls-bar">
            <div className="dish-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="diet-filter-pills">
              {["all", "veg", "non-veg"].map((d) => (
                <button
                  key={d}
                  className={`diet-pill ${dietaryFilter === d ? "active" : ""}`}
                  onClick={() => setDietaryFilter(d)}
                >
                  {d === "all" ? "All" : d === "veg" ? "🌱 Veg" : "🍖 Non-Veg"}
                </button>
              ))}
            </div>
          </div>
          {/* Dishes Grid */}
          {menuLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading menu...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>No dishes available in this category.</div>
          ) : (
            <div className="dishes-cards-grid">
              {filteredItems.map((item) => {
                const inCart = cart.find((i) => i.id === item.id);
                return (
                  <div key={item.id} className="dish-card">
                    <div className="dish-info-body" style={{ padding: "20px" }}>
                      <div className="dish-header-row">
                        <div className="dish-title-group">
                          <span className={`veg-dot ${item.isVeg ? "is-veg" : "is-nonveg"}`} />
                          <h3 className="dish-name">{item.name}</h3>
                        </div>
                        <span className="dish-price">${Number(item.price).toFixed(2)}</span>
                      </div>
                      <div className="dish-card-footer" style={{ marginTop: "20px" }}>
                        {!item.isAvailable ? (
                          <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}>Currently Unavailable</span>
                        ) : inCart ? (
                          <div className="item-qty-stepper">
                            <button onClick={() => handleUpdateQuantity(item.id, inCart.count - 1)}>-</button>
                            <span>{inCart.count} in cart</span>
                            <button onClick={() => handleUpdateQuantity(item.id, inCart.count + 1)}>+</button>
                          </div>
                        ) : (
                          <button className="add-item-btn" onClick={() => handleAddToCart(item)}>
                            + Add to Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      {/* Floating Bottom Cart Bar for Mobile */}
      {totalCartCount > 0 && (
        <div className="mobile-floating-cart-bar">
          <div className="floating-cart-text">
            <span>{totalCartCount} Item(s)</span>
            <strong>${totalCartPrice.toFixed(2)}</strong>
          </div>
          <button className="floating-view-cart-btn" onClick={() => setIsCartOpen(true)}>
            View Order Cart →
          </button>
        </div>
      )}
      {/* Cart Drawer Component */}
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
    </div>
  );


};


export default CustomerMenuPage;