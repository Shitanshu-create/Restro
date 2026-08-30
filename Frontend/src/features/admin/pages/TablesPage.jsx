import { useState, useEffect } from "react";
import QRCode from "qrcode";
import StatCard from "../components/StatCard.jsx";
import { useTables } from "../hooks/useAdmin.js";
import { env } from "../../../config/env.js";
import "../styles/TablesPage.css";



const FILTER_TABS = ["All", "Occupied", "Available"];

const TablesPage = () => {
    const { tables, loading, error, handleCreateTable, handleRemoveTable, handleToggleTableAvailability } = useTables();
    const [activeTab, setActiveTab] = useState("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedQrTable, setSelectedQrTable] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [isGeneratingQr, setIsGeneratingQr] = useState(false);
    const [newCapacity, setNewCapacity] = useState("4");
    const [actionError, setActionError] = useState(null);

    const displayTables = tables.map((t) => ({
        id: t.tableNumber,
        tableNumber: t.tableNumber,
        qrToken: t.qrToken || "N/A",
        name: `Table ${t.tableNumber.replace("T-", "")}`,
        status: t.isOccupied ? "Occupied" : "Available",
        capacity: t.capacity,
        qrImageBase64: t.qrImageBase64 || null,
        qrUrl: t.qrUrl
    }));

    const occupiedCount = displayTables.filter((t) => t.status === "Occupied").length;
    const availableCount = displayTables.filter((t) => t.status === "Available").length;
    const filteredTables = displayTables.filter((t) => {
        if (activeTab === "All") return true;
        return t.status === activeTab;
    });

    // Generate or fetch QR code when modal opens
    useEffect(() => {
        if (!selectedQrTable) {
            Promise.resolve().then(() => setQrDataUrl(""));
            return;
        }

        const buildAndSaveQr = async () => {
            setIsGeneratingQr(true);
            try {
                if (selectedQrTable.qrImageBase64) {
                    setQrDataUrl(selectedQrTable.qrImageBase64);
                } else {
                    const clientUrl = (env.clientUrl || window.location.origin).replace(/\/+$/, "");
                    const fullQrUrl = `${clientUrl}/menu/${selectedQrTable.qrToken}`;
                    const url = await QRCode.toDataURL(fullQrUrl, { width: 320, margin: 2 });
                    setQrDataUrl(url);
                    // Persist to DB asynchronously - disabled
                    // handleSaveQr(selectedQrTable.tableNumber, url);
                }
            } catch (err) {
                console.error("QR Generation Failed:", err);
            } finally {
                setIsGeneratingQr(false);
            }
        };

        buildAndSaveQr();
    }, [selectedQrTable]);

    // const handleRefreshQrClick = async () => { ... } // Disabled

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

    const handleDeleteTable = async (tableNumber, e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to remove ${tableNumber}?`)) {
            await handleRemoveTable(tableNumber);
        }
    };

    return (
        <div className="tables-page">
            {/* Page Header Bar */}
            <div className="tables-top-bar">
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
                        <div
                            key={t.id}
                            className="table-status-card"
                            onClick={() => setSelectedQrTable(t)}
                            title="Click to view & download Table QR Code"
                        >
                            <div className="table-card-top-row">
                                <div className="table-card-info-stack">
                                    <span className="table-card-name">{t.name}</span>
                                    <span className="table-card-token-sub">({t.qrToken})</span>
                                </div>
                                <span
                                    className={`table-status-pill pill-${t.status.toLowerCase()}`}
                                    style={{ cursor: "pointer" }}
                                    title="Click to toggle availability"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (t.status === "Occupied") {
                                            if (!window.confirm(`Warning: Table ${t.tableNumber.replace("T-", "")} is currently occupied with active orders. Are you sure you want to override and mark it as Available?`)) {
                                                return;
                                            }
                                        }
                                        handleToggleTableAvailability(t.tableNumber);
                                    }}
                                >
                                    <span className="pill-dot" />
                                    {t.status}
                                </span>
                            </div>
                            <div className="table-card-bottom-row" style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="table-card-time">Capacity: {t.capacity} Guests</span>
                                <button
                                    onClick={(e) => handleDeleteTable(t.tableNumber, e)}
                                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Preview Modal */}
            {selectedQrTable && (
                <div className="modal-backdrop" onClick={() => setSelectedQrTable(null)}>
                    <div className="modal-content-card qr-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{selectedQrTable.name} QR Code</h3>
                                <p className="qr-modal-subtext">Scan to view customer menu</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setSelectedQrTable(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="qr-preview-container">
                            {isGeneratingQr ? (
                                <div className="qr-loading-placeholder">Generating QR Code...</div>
                            ) : qrDataUrl ? (
                                <img src={qrDataUrl} alt={`${selectedQrTable.name} QR Code`} className="qr-preview-img" />
                            ) : (
                                <div className="qr-loading-placeholder">Failed to load QR code</div>
                            )}
                            <div className="qr-token-display">Token: <code>{selectedQrTable.qrToken}</code></div>
                        </div>

                        <div className="qr-modal-actions">
                            {/* Refresh QR Button Removed */}

                            {qrDataUrl && (
                                <a
                                    href={qrDataUrl}
                                    download={`${selectedQrTable.name.replace(/\s+/g, "_")}_QR.png`}
                                    className="qr-btn-download"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download QR
                                </a>
                            )}
                        </div>
                    </div>
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

