import React from "react";
import { useTables } from "../hooks/useAdmin.js";
import "../styles/RestaurantFloor.css";
const RestaurantFloor = () => {
    const { tables, loading } = useTables();
    const formattedTables = tables.map((t) => ({
        id: t.tableNumber,
        num: String(t.tableNumber).replace("T-", ""),
        status: t.isOccupied ? "occupied" : "available",
        capacity: t.capacity
    }));
    const availableTables = formattedTables.filter((t) => t.status === "available");
    const occupiedCount = formattedTables.filter((t) => t.status === "occupied").length;
    return (
        <div className="floor-card">
            <div className="floor-header">
                <div>
                    <h2 className="card-section-title">Available & All Tables</h2>
                    <p className="card-section-subtitle">Live table occupancy & seating list</p>
                </div>
                <div className="floor-legend">
                    <span className="legend-item"><span className="legend-dot dot-available" />{availableTables.length} Available</span>
                    <span className="legend-item"><span className="legend-dot dot-occupied" />{occupiedCount} Occupied</span>
                </div>
            </div>
            {loading ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--color-text-body)" }}>Loading tables list...</div>
            ) : tables.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--color-text-body)" }}>No tables created yet.</div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                    {/* Section 1: Available Tables List */}
                    <div className="available-tables-section">
                        <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                            AVAILABLE TABLES ({availableTables.length})
                        </h3>
                        {availableTables.length === 0 ? (
                            <div style={{ padding: "12px", background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: "8px", color: "#c2410c", fontSize: "12px" }}>
                                All tables are currently occupied.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", width: "100%" }}>
                                {availableTables.map((t) => (
                                    <div
                                        key={t.id}
                                        style={{
                                            background: "#f0fdf4",
                                            border: "1px solid #bbf7d0",
                                            borderRadius: "10px",
                                            padding: "10px 12px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "4px"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontWeight: "800", fontSize: "14px", color: "#166534" }}>{t.id}</span>
                                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px" }}>Available</span>
                                        </div>
                                        <span style={{ fontSize: "12px", color: "#475569" }}>Cap: <strong>{t.capacity} seats</strong></span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section 2: All Tables Grid */}
                    <div className="all-tables-section" style={{ marginTop: "4px" }}>
                        <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                            ALL TABLES MAP ({tables.length})
                        </h3>
                        <div className="floor-grid">
                            {formattedTables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`floor-table-btn table-${table.status}`}
                                    title={`${table.id} — ${table.status} (Cap: ${table.capacity})`}
                                >
                                    {table.num}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="floor-detail-card">
                <div className="floor-detail-header">
                    <span className="floor-detail-name">Floor Summary</span>
                    <span className="floor-detail-status-badge">{occupiedCount} Occupied</span>
                </div>
                <div className="floor-detail-meta">
                    <span>Total Tables: <strong>{tables.length}</strong></span>
                    <span>Available: <strong>{availableTables.length}</strong></span>
                </div>
            </div>
        </div>
    );
};

export default RestaurantFloor;


