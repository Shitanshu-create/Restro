import React, { useState } from "react";
import { useOrders } from "../hooks/useAdmin.js";
import { useNavigate } from "react-router-dom";
import "../styles/LiveOrdersList.css";

const LiveOrdersList = () => {
    const { orders, loading } = useOrders();
    const [activeTab, setActiveTab] = useState("All");
    const navigate = useNavigate();
    const tabs = ["All", "Incoming", "Preparing", "Ready"];

    const formattedOrders = orders.map((o) => {
        const itemSummary = Array.isArray(o.items)
            ? o.items.map((i) => `${i.name || i.itemId}${i.quantity && i.quantity !== "Full" ? ` (${i.quantity})` : ""}`).join(", ")
            : String(o.items || "");
        
        const tableNum = String(o.tableNo || "").replace("T-", "").padStart(1, "0");
        
        let status = o.orderStatus || "Preparing";
        if (status === "Pending") status = "Incoming";

        return {
            id: o.orderId || o._id,
            tableNo: tableNum || "1",
            customer: o.customerName || `Cust #${o.customerId || "01"}`,
            items: itemSummary || "Order items",
            total: Number(o.amount || o.total || 0),
            timeAgo: o.createdAt ? calculateTimeAgo(o.createdAt) : "2m ago",
            status: status,
        };
    });

    function calculateTimeAgo(dateStr) {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const mins = Math.max(1, Math.floor(diffMs / 60000));
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ago`;
    }

    const filteredOrders = formattedOrders.filter((order) => {
        if (activeTab === "All") return true;
        return order.status.toLowerCase() === activeTab.toLowerCase();
    }).slice(0, 4);

    return (
        <div className="recent-orders-card">
            <div className="recent-orders-header">
                <h2 className="recent-orders-title">recent orders</h2>
                <div className="recent-orders-nav">
                    <div className="recent-orders-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`recent-tab-btn ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="view-all-orders-link"
                        onClick={() => navigate("/admin/orders")}
                    >
                        view all orders ↗
                    </button>
                </div>
            </div>
            <div className="recent-orders-list">
                {loading ? (
                    <div className="empty-recent-msg">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-recent-msg">No recent orders</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="recent-order-row">
                            <div className="tbl-square-badge">
                                <span className="tbl-sub">TBL</span>
                                <span className="tbl-number">{order.tableNo}</span>
                            </div>
                            <div className="recent-order-info">
                                <div className="recent-order-meta">
                                    <span className="recent-order-id">#{order.id}</span>
                                    <span className="recent-dot">•</span>
                                    <span className="recent-cust-name">{order.customer}</span>
                                    <span className={`recent-status-pill status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="recent-dishes-summary">{order.items}</div>
                            </div>
                            <div className="recent-order-amount-col">
                                <span className="recent-amount">${order.total.toFixed(2)}</span>
                                <span className="recent-time-ago">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {order.timeAgo}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveOrdersList;
