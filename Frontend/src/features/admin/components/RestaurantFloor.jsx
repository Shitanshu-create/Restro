import React, { useState } from "react";
import { useTables, useOrders } from "../hooks/useAdmin.js";
import "../styles/RestaurantFloor.css";

const RestaurantFloor = () => {
    const { tables, loading: tablesLoading } = useTables();
    const { orders } = useOrders();
    const [selectedTableId, setSelectedTableId] = useState(null);

    // Section 3: Compute TWO statuses only — Active (isOccupied = true) & Inactive (isOccupied = false)
    const tableList = tables.map((t) => {
        const tableNum = String(t.tableNumber || t.id || "").replace("T-", "").padStart(2, "0");
        const rawNum = String(t.tableNumber || t.id || "");
        
        // Find active orders for this table
        const tableOrders = orders.filter((o) => {
            const oNum = String(o.tableNo || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
            const tNum = String(t.tableNumber || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
            return oNum && tNum && oNum === tNum;
        });
        const activeOrder = tableOrders.find((o) => o.orderStatus !== "Ready");
        
        const status = t.isOccupied ? "active" : "inactive";
        const currentBill = activeOrder ? Number(activeOrder.amount || activeOrder.total || 0) : 0;

        return {
            id: t._id || t.tableNumber,
            rawNum,
            tableNum,
            capacity: t.capacity || 4,
            status,
            activeOrder,
            currentBill
        };
    });

    const activeCount = tableList.filter((t) => t.status === "active").length;
    const inactiveCount = tableList.filter((t) => t.status === "inactive").length;

    const selectedTable = tableList.find((t) => t.id === selectedTableId) || tableList[0] || null;

    return (
        <div className="restaurant-status-card">
            {/* Header */}
            <div className="status-card-header">
                <div>
                    <h2 className="status-card-title">restaurant table status</h2>
                    <p className="status-card-subtitle">Click table for live details • {tables.length} Tables Total</p>
                </div>
                <div className="live-layout-badge">
                    <span className="live-pulse-dot" /> Live Status
                </div>
            </div>

            {/* Legend Row — ONLY TWO STATUSES */}
            <div className="status-legend-row">
                <span className="legend-item"><span className="legend-circle circle-occupied" /> Active</span>
                <span className="legend-item"><span className="legend-circle circle-available" /> Inactive</span>
            </div>

            {/* Table Circles Container */}
            <div className="tables-circle-container">
                {tablesLoading ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>Loading table layout...</div>
                ) : tableList.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No tables found.</div>
                ) : (
                    <div className="tables-circle-grid">
                        {tableList.map((t) => {
                            const isSelected = selectedTable && selectedTable.id === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setSelectedTableId(t.id)}
                                    className={`table-circle-btn status-${t.status === "active" ? "occupied" : "available"} ${isSelected ? "selected" : ""}`}
                                    title={`Table ${t.tableNum} — ${t.status.toUpperCase()} (Seats: ${t.capacity})`}
                                >
                                    {t.tableNum}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Selected Table Detail Box */}
            {selectedTable && (
                <div className="selected-table-detail-box">
                    <div className="detail-box-top">
                        <div className="detail-title-group">
                            <span className="detail-table-name">Table {selectedTable.tableNum}</span>
                            <span className="detail-zone">Main Dining Room</span>
                        </div>
                        <span className={`detail-status-tag tag-${selectedTable.status === "active" ? "occupied" : "available"}`}>
                            {selectedTable.status}
                        </span>
                    </div>
                    <div className="detail-box-bottom">
                        <span>Capacity: <strong>{selectedTable.capacity} Guests</strong></span>
                        <span>Current Bill: <strong className="bill-amount">₹{selectedTable.currentBill.toFixed(2)}</strong></span>
                    </div>
                </div>
            )}

            {/* Bottom 2 Summary Metric Cards */}
            <div className="status-summary-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="summary-card occupied-box">
                    <span className="summary-label">active tables</span>
                    <span className="summary-value">{activeCount} / {tables.length}</span>
                </div>
                <div className="summary-card available-box">
                    <span className="summary-label">inactive tables</span>
                    <span className="summary-value">{inactiveCount} Free</span>
                </div>
            </div>
        </div>
    );
};

export default RestaurantFloor;
