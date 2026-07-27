import React, { useState } from "react";
import { useOrders } from "../hooks/useAdmin.js";
import "../styles/LiveOrdersList.css";





const LiveOrdersList = () => {


    
    const { orders, loading, handleMarkReady } = useOrders();
    const [activeTab, setActiveTab] = useState("All");
    const tabs = ["All", "Preparing", "Ready"];


    const formattedOrders = orders.map((o) => {
        const itemSummary = Array.isArray(o.items)
            ? o.items.map((i) => `${i.name || i.itemId}${i.quantity ? ` (${i.quantity})` : ""}`).join(", ")
            : String(o.items || "");
        return {
            id: o.orderId,
            tableNo: o.tableNo,
            customer: `Cust #${o.customerId}`,
            items: itemSummary || "Order items",
            total: Number(o.amount || 0),
            time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            status: o.orderStatus || "Preparing",
        };
    });


    const filteredOrders = formattedOrders.filter((order) => {
        if (activeTab === "All") return true;
        return order.status.toLowerCase() === activeTab.toLowerCase();
    }).slice(0, 4);

    return (
        <div className="live-orders-card">
            <div className="live-orders-header">
                <div className="live-orders-title-group">
                    <h2 className="card-section-title">Live Orders</h2>
                    <p className="card-section-subtitle">Kitchen queue and service handoff</p>
                </div>
                <div className="live-orders-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`live-tab-btn ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="live-orders-list">
                {loading ? (
                    <div className="empty-orders-msg">Loading live queue...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-orders-msg">No active orders in queue</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="live-order-row">
                            <div className="table-badge">
                                <span className="tbl-label">TBL</span>
                                <span className="tbl-num">{order.tableNo}</span>
                            </div>
                            <div className="order-main-details">
                                <div className="order-meta-header">
                                    <span className="order-number">#{order.id}</span>
                                    <span className="customer-name">{order.customer}</span>
                                </div>
                                <div className="order-items-text">{order.items}</div>
                            </div>
                            <div className="order-price-time">
                                <span className="order-amount-text">
                                    ${order.total.toFixed(2)}
                                </span>
                                <span className="order-time-stamp">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {order.time}
                                </span>
                            </div>
                            <div className="order-status-badge-container">
                                <span className={`status-pill status-${order.status.toLowerCase()}`}>
                                    <span className="status-dot"></span>
                                    {order.status}
                                </span>
                            </div>
                            <div className="order-action-btn-container">
                                {order.status === "Preparing" && (
                                    <button
                                        className="action-btn btn-ready"
                                        onClick={() => handleMarkReady(order.id)}
                                    >
                                        Ready
                                    </button>
                                )}
                                {order.status === "Ready" && (
                                    <button className="action-btn btn-outline" disabled>
                                        Ready
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default LiveOrdersList;

