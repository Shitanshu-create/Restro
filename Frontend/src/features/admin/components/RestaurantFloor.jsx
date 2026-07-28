import React, { useState } from "react";
import { useTables, useOrders } from "../hooks/useAdmin.js";
import "../styles/RestaurantFloor.css";

const RestaurantFloor = () => {
    const { tables, loading: tablesLoading } = useTables();
    const { orders } = useOrders();
    const [selectedTableId, setSelectedTableId] = useState(null);

    // Compute live status and order details for each backend table
    const tableList = tables.map((t) => {
        const tableNum = String(t.tableNumber || t.id || "").replace("T-", "").padStart(2, "0");
        const rawNum = String(t.tableNumber || t.id || "");
        
        // Find active orders for this table
        const tableOrders = orders.filter((o) => String(o.tableNo) === rawNum || String(o.tableNo) === `T-${tableNum}`);
        const activeOrder = tableOrders.find((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Completed");
        
        let status = t.isOccupied ? "occupied" : "available";
        if (activeOrder) {
            if (activeOrder.paymentStatus === "Pending" && activeOrder.orderStatus === "Ready") {
                status = "waiting";
            } else {
                status = "occupied";
            }
        }

        const currentBill = activeOrder ? Number(activeOrder.amount || activeOrder.total || 0) : (t.isOccupied ? 38.50 : 0);

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

    const occupiedCount = tableList.filter((t) => t.status === "occupied").length;
    const availableCount = tableList.filter((t) => t.status === "available").length;
    const waitingCount = tableList.filter((t) => t.status === "waiting").length;

    const selectedTable = tableList.find((t) => t.id === selectedTableId) || tableList[0] || null;

    return (
        <div className="restaurant-status-card">
            {/* Header */}
            <div className="status-card-header">
                <div>
                    <h2 className="status-card-title">restaurant status</h2>
                    <p className="status-card-subtitle">Click table for live details • {tables.length} Tables Total</p>
                </div>
                <div className="live-layout-badge">
                    <span className="live-pulse-dot" /> Live Layout
                </div>
            </div>

            {/* Legend Row */}
            <div className="status-legend-row">
                <span className="legend-item"><span className="legend-circle circle-occupied" /> Occupied</span>
                <span className="legend-item"><span className="legend-circle circle-available" /> Available</span>
                <span className="legend-item"><span className="legend-circle circle-waiting" /> Waiting for bill</span>
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
                                    className={`table-circle-btn status-${t.status} ${isSelected ? "selected" : ""}`}
                                    title={`Table ${t.tableNum} — ${t.status} (Seats: ${t.capacity})`}
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
                            <span className="detail-zone">Main Hall</span>
                        </div>
                        <span className={`detail-status-tag tag-${selectedTable.status}`}>
                            {selectedTable.status === "occupied" ? "occupied" : selectedTable.status === "waiting" ? "waiting for bill" : "available"}
                        </span>
                    </div>
                    <div className="detail-box-bottom">
                        <span>Guests: <strong>{selectedTable.status === "available" ? `0/${selectedTable.capacity}` : `3/${selectedTable.capacity}`}</strong></span>
                        <span>Server: <strong>Alex R.</strong></span>
                        <span>Current Bill: <strong className="bill-amount">${selectedTable.currentBill.toFixed(2)}</strong></span>
                    </div>
                </div>
            )}

            {/* Bottom 3 Summary Metric Cards */}
            <div className="status-summary-grid">
                <div className="summary-card occupied-box">
                    <span className="summary-label">occupied tables</span>
                    <span className="summary-value">{occupiedCount} / {tables.length}</span>
                </div>
                <div className="summary-card available-box">
                    <span className="summary-label">available tables</span>
                    <span className="summary-value">{availableCount} Free</span>
                </div>
                <div className="summary-card waiting-box">
                    <span className="summary-label">waiting for bill</span>
                    <span className="summary-value">{waitingCount} Tables</span>
                </div>
            </div>
        </div>
    );
};

export default RestaurantFloor;
