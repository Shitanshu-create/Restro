import React from "react";
import "../styles/CartDrawer.css";



const CartDrawer = ({
    isOpen,
    onClose,
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    tableNo,
    paymentMode,
    onPaymentModeChange,
    onPlaceOrder,
    isSubmitting,
}) => {


    
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.price * (item.quantity === "Half" ? 0.5 : 1)) * item.count,
        0
    );
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;



    return (
        <>
            <div
                className={`cart-drawer-backdrop ${isOpen ? "active" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`cart-drawer-panel ${isOpen ? "open" : ""}`}>
                {/* Cart Header */}
                <div className="cart-drawer-header">
                    <div className="cart-title-group">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <h2>Your Order Cart</h2>
                    </div>
                    <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                {/* Table Indicator Row */}
                <div className="cart-table-selector" style={{ background: "var(--color-bg-subtle, #f8fafc)", padding: "12px 16px", borderRadius: "10px", margin: "16px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-title, #1e293b)" }}>
                        Assigned Table: <strong>{tableNo}</strong>
                    </span>
                </div>
                {/* Cart Item List */}
                <div className="cart-items-body">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty-state">
                            <div className="empty-cart-icon">🛒</div>
                            <h3>Your cart is empty</h3>
                            <p>Explore the menu and add delicious dishes to start your order.</p>
                        </div>
                    ) : (
                        cartItems.map((item) => {
                            const itemUnitPrice = item.price * (item.quantity === "Half" ? 0.5 : 1);
                            return (
                                <div key={item.id} className="cart-item-row">
                                    <div className="cart-item-info">
                                        <div className="cart-item-title-row">
                                            <span className={`veg-dot-sm ${item.isVeg ? "is-veg" : "is-nonveg"}`} />
                                            <span className="cart-item-name">{item.name}</span>
                                        </div>
                                        <span className="cart-item-unit-price">${itemUnitPrice.toFixed(2)} each ({item.quantity || "Full"})</span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="cart-qty-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => onUpdateQuantity(item.id, item.count - 1)}
                                            >
                                                -
                                            </button>
                                            <span className="qty-val">{item.count}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => onUpdateQuantity(item.id, item.count + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="cart-item-total-price">
                                            ${(itemUnitPrice * item.count).toFixed(2)}
                                        </span>
                                        <button
                                            className="cart-item-delete-btn"
                                            onClick={() => onRemoveItem(item.id)}
                                            title="Remove item"
                                        >  × </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                {/* Footer Checkout Summary */}
                {cartItems.length > 0 && (
                    <div className="cart-drawer-footer">
                        {/* Payment Mode Selector */}
                        <div className="payment-mode-section">
                            <span className="pm-label">Select Payment Method</span>
                            <div className="pm-options">
                                <button
                                    type="button"
                                    className={`pm-btn ${paymentMode === "Online" ? "active" : ""}`}
                                    onClick={() => onPaymentModeChange("Online")}
                                >
                                    Online / UPI (Razorpay)
                                </button>
                                <button
                                    type="button"
                                    className={`pm-btn ${paymentMode === "Cash" ? "active" : ""}`}
                                    onClick={() => onPaymentModeChange("Cash")}
                                >
                                    Pay at Counter
                                </button>
                            </div>
                        </div>
                        {/* Bill Summary Breakdown */}
                        <div className="bill-summary-rows">
                            <div className="bill-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="bill-row">
                                <span>GST / Taxes (5%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="bill-row total-row">
                                <span>Grand Total</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        {/* Submit Button */}
                        <button
                            className="place-order-submit-btn"
                            onClick={onPlaceOrder}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Placing Order..." : `Confirm & Place Order • $${grandTotal.toFixed(2)}`}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};
export default CartDrawer;
