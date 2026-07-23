import React, { useState } from "react";
import StatCard from "../components/StatCard.jsx";
import { useTables } from "../hooks/useAdmin.js";
import "../styles/TablesPage.css";



const FILTER_TABS = ["All", "Occupied", "Available"];

const TablesPage = () => {
    const { tables, loading, error, handleCreateTable, handleRemoveTable } = useTables();
    const [activeTab, setActiveTab] = useState("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCapacity, setNewCapacity] = useState("4");
    const [actionError, setActionError] = useState(null);

    const displayTables = tables.map((t) => ({
        id: t.tableNumber,
        tableNumber: t.tableNumber,
        name: `Table ${t.tableNumber.replace("T-", "")}`,
        status: t.isOccupied ? "Occupied" : "Available",
        capacity: t.capacity,
        qrUrl: t.qrUrl
    }));

    const occupiedCount = displayTables.filter((t) => t.status === "Occupied").length;
    const availableCount = displayTables.filter((t) => t.status === "Available").length;
    const filteredTables = displayTables.filter((t) => {
        if (activeTab === "All") return true;
        return t.status === activeTab;
    });

    const handleAddTableSubmit = async (e) => {
        e.preventDefault();
        setActionError(null);
        const res = await handleCreateTable(Number(newCapacity));
        if (res.success) {
            setShowAddModal(false);
        } else {
            setActionError(res.message || "Failed to create table");
        }
    };

    const handleDeleteTable = async (tableNumber) => {
        if (window.confirm(`Are you sure you want to remove ${tableNumber}?`)) {
            await handleRemoveTable(tableNumber);
        }
    };
    return (
        <div className="tables-page">
            {/* Page Header Bar */}
            <div className="tables-top-bar">
                <div>
                    <h1 className="tables-header-title">Tables</h1>
                    <p className="tables-header-subtitle">Overview and management for tables</p>
                </div>
                <button className="add-table-primary-btn" onClick={() => setShowAddModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Table
                </button>
            </div>
            {/* Top 4 Stat Cards */}
            {error && <div className="login-error" role="alert">{error}</div>}
            {/* Stat Cards */}
            <div className="tables-stats-grid">
                <StatCard
                    title="Total Tables"
                    value={tables.length}
                    subtext="Dining capacity"
                    subtextColor="muted"
                />
                <StatCard
                    title="Occupied"
                    value={occupiedCount}
                    subtext="Seated and ordering"
                    subtextColor="orange"
                />
                <StatCard
                    title="Available"
                    value={availableCount}
                    subtext="Ready for walk-in"
                    subtextColor="green"
                />

            </div>
            {/* Filter Tabs */}
            <div className="tables-filter-tabs">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`table-tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {/* Tables Grid */}
            {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading tables...</div>
            ) : filteredTables.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>No tables found. Add a new table to get started.</div>
            ) : (
                <div className="tables-cards-grid">
                    {filteredTables.map((t) => (
                        <div key={t.id} className="table-status-card">
                            <div className="table-card-top-row">
                                <span className="table-card-name">{t.name} ({t.id})</span>
                                <span className={`table-status-pill pill-${t.status.toLowerCase()}`}>
                                    <span className="pill-dot" />
                                    {t.status}
                                </span>
                            </div>
                            <div className="table-card-bottom-row" style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="table-card-time">Capacity: {t.capacity} Guests</span>
                                <button
                                    onClick={() => handleDeleteTable(t.tableNumber)}
                                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Add Table Modal */}
            {showAddModal && (
                <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Table</h3>
                            <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        {actionError && <div className="login-error" role="alert" style={{ marginBottom: "12px" }}>{actionError}</div>}
                        <form onSubmit={handleAddTableSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Seating Capacity</label>
                                <select value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)}>
                                    <option value="2">2 Guests</option>
                                    <option value="4">4 Guests</option>
                                    <option value="6">6 Guests</option>
                                    <option value="8">8 Guests</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    Create Table
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TablesPage;

