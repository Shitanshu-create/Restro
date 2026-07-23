import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import customerApi from "../api/customerApi.js";
import { useMenu, useCart, usePlaceOrder } from "../hooks/useCustomer.js";
import "./CustomerMenuPage.css";

function CartDrawer({ cart, total, onAdd, onRemove, onClose, onCheckout, submitting }) {
  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Order</h2>
          <button className="cart-drawer__close" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-drawer__empty-icon">🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cart.map((item, i) => (
                <div key={i} className="cart-item">
                  <div className="cart-item__info">
                    <span className={`veg-indicator ${item.isVeg ? "veg" : "nonveg"}`} />
                    <div>
                      <div className="cart-item__name">{item.name}</div>
                      {item.quantity && item.quantity !== "Full" && (
                        <div className="cart-item__qty">{item.quantity}</div>
                      )}
                    </div>
                  </div>
                  <div className="cart-item__right">
                    <div className="cart-item__controls">
                      <button className="cart-counter-btn" onClick={() => onRemove(item.id, item.quantity)}>−</button>
                      <span className="cart-counter-num">{item.count}</span>
                      <button className="cart-counter-btn" onClick={() => onAdd(item)}>+</button>
                    </div>
                    <div className="cart-item__price">₹{item.price * item.count}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__total">
                <span>Total</span>
                <span className="cart-drawer__total-amount">₹{total}</span>
              </div>
              <button
                className="cart-drawer__checkout-btn"
                onClick={onCheckout}
                disabled={submitting}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CustomerMenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { menu, loading, error } = useMenu();
  const { cart, addToCart, removeFromCart, clearCart, total, itemCount } = useCart();
  const { placeOrder, loading: submitting, error: orderError } = usePlaceOrder();
  const [cartOpen, setCartOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");

  // Get table from URL query param
  const tableNo = new URLSearchParams(location.search).get("table");

  // Create/restore customer session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tbl = params.get("table");

    if (!tbl) {
      setSessionLoading(false);
      return;
    }

    customerApi.createSession(tbl, null)
      .then(res => {
        setSession(res.data);
        setSessionLoading(false);
      })
      .catch(() => setSessionLoading(false));
  }, [location.search]);

  useEffect(() => {
    if (menu.length > 0 && !activeCategory) {
      setActiveCategory(menu[0]?.name);
    }
  }, [menu]);

  async function handleCheckout() {
    if (!session) {
      alert("Session expired. Please scan the QR code again.");
      return;
    }
    const items = cart.map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      count: c.count,
      isVeg: c.isVeg,
      quantity: c.quantity || "Full",
    }));

    const res = await placeOrder(session.tableNo, items, "Cash");
    if (res.success) {
      clearCart();
      setCartOpen(false);
      setOrderSuccess(res.data.order);
    }
  }

  const filteredMenu = menu.map(cat => ({
    ...cat,
    items: (cat.items || []).filter(item =>
      item.isAvailable !== false &&
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  if (sessionLoading) {
    return (
      <div className="customer-loading">
        <div className="customer-spinner" />
      </div>
    );
  }

  return (
    <div className="customer-menu-page">
      {/* Header */}
      <header className="customer-header">
        <div className="customer-header__brand">
          <span className="customer-header__icon">🍽️</span>
          <span className="customer-header__name">Restro</span>
          {session?.tableNo && (
            <span className="customer-header__table">Table {session.tableNo}</span>
          )}
        </div>
        <div className="customer-header__right">
          <Link to="/my-orders" className="customer-header__link">My Orders</Link>
          <button
            className={`customer-cart-btn ${itemCount > 0 ? "customer-cart-btn--active" : ""}`}
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart
            {itemCount > 0 && <span className="customer-cart-badge">{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* Order success message */}
      {orderSuccess && (
        <div className="customer-order-success">
          <span>🎉</span>
          <div>
            <strong>Order Placed!</strong> Order #{orderSuccess.orderId} is being prepared.{" "}
            <Link to="/my-orders" className="customer-order-success__link">View Orders →</Link>
          </div>
          <button onClick={() => setOrderSuccess(null)}>✕</button>
        </div>
      )}

      {/* Search */}
      <div className="customer-search-bar">
        <input
          className="customer-search-input"
          type="text"
          placeholder="🔍 Search dishes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      {!search && (
        <div className="customer-categories">
          {menu.map(cat => (
            <button
              key={cat._id}
              className={`customer-cat-pill ${activeCategory === cat.name ? "customer-cat-pill--active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.name);
                document.getElementById(`cat-${cat._id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu content */}
      <div className="customer-menu-content">
        {loading ? (
          <div className="customer-loading"><div className="customer-spinner" /></div>
        ) : error ? (
          <div className="customer-error">{error}</div>
        ) : filteredMenu.length === 0 ? (
          <div className="customer-error">No items found</div>
        ) : (
          filteredMenu.map(cat => (
            <div key={cat._id} id={`cat-${cat._id}`} className="customer-menu-section">
              <h2 className="customer-menu-section__title">{cat.name}</h2>
              <div className="customer-menu-grid">
                {cat.items.map(item => {
                  const cartItem = cart.find(c => c.id === item.id);
                  return (
                    <div key={item.id} className="customer-menu-card">
                      <div className="customer-menu-card__header">
                        <span className={`veg-indicator ${item.isVeg ? "veg" : "nonveg"}`} />
                        <div className="customer-menu-card__name">{item.name}</div>
                      </div>
                      <div className="customer-menu-card__footer">
                        <div className="customer-menu-card__price">₹{item.price}</div>
                        {cartItem ? (
                          <div className="customer-counter">
                            <button className="customer-counter__btn" onClick={() => removeFromCart(item.id, item.quantity)}>−</button>
                            <span className="customer-counter__num">{cartItem.count}</span>
                            <button className="customer-counter__btn" onClick={() => addToCart({ ...item })}>+</button>
                          </div>
                        ) : (
                          <button
                            className="customer-add-btn"
                            onClick={() => addToCart({ ...item })}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating cart button on mobile */}
      {itemCount > 0 && !cartOpen && (
        <button className="customer-float-cart" onClick={() => setCartOpen(true)}>
          🛒 {itemCount} items · ₹{total}
        </button>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={total}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onCheckout={handleCheckout}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default CustomerMenuPage;
