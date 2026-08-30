import { useState } from "react";
import StatCard from "../components/StatCard.jsx";
import { useOrders } from "../hooks/useAdmin.js";
import AdminOrderDetailModal from "../components/AdminOrderDetailModal.jsx";
import ExportModal from "../components/ExportModal.jsx";
import "../styles/PaymentsPage.css";
import DateRangeFilter, { getPresetRange } from "../components/DateRangeFilter.jsx";

const PaymentsPage = () => {
  const { orders, loading, error, handleMarkCashPaid, reload } = useOrders();
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [dateRange, setDateRange] = useState(() => getPresetRange("today"));
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (!dateRange.from || !dateRange.to || !o.createdAt) return true;
    const date = new Date(o.createdAt);
    return date >= dateRange.from && date <= dateRange.to;
  });

  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === "Paid");
  const totalVolume = paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const onlinePaymentsCount = paidOrders.filter((o) => o.paymentMode === "Online" || o.paymentMode === "UPI").length;
  const cashPaymentsCount = paidOrders.filter((o) => o.paymentMode === "Cash").length;
  return (
    <div className="payments-page">
      {/* Top Bar Controls */}
      <div className="payments-banner" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <DateRangeFilter onChange={setDateRange} />
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #cbd5e1)",
              background: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f172a",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📊 Export CSV / PDF
          </button>
          <button
            onClick={reload}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #cbd5e1)",
              background: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f172a",
              cursor: "pointer"
            }}
          >
            🔄 Refresh Payments
          </button>
        </div>
      </div>
      {error && <div className="login-error" role="alert">{error}</div>}
      {/* Stat Summary Cards */}
      <div className="payments-stats-grid">
        <StatCard
          title="Selected Settled Volume"
          value={`$${totalVolume.toFixed(2)}`}
          subtext="Processed in selected period"
          subtextColor="green"
        />
        <StatCard
          title="Total Transactions"
          value={filteredOrders.length}
          subtext={`${paidOrders.length} settled`}
          subtextColor="orange"
        />
        <StatCard
          title="Online / Digital"
          value={onlinePaymentsCount}
          subtext="Razorpay / UPI transactions"
          subtextColor="blue"
        />
        <StatCard
          title="Cash Paid"
          value={cashPaymentsCount}
          subtext="Cash settled by staff"
          subtextColor="green"
        />
      </div>
      {/* Ledger Table */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading payments ledger...</div>
      ) : (
        <div className="payments-table-card">
          <table className="payments-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>TABLE</th>
                <th>PAYMENT METHOD</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>No payment records found</td>
                </tr>
              ) : (
                filteredOrders.map((txn) => (
                  <tr
                    key={txn.orderId}
                    className="payment-table-row"
                    onClick={() => setSelectedTxn(txn)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="txn-id-cell">#{txn.orderId}</td>
                    <td className="table-name-cell">{txn.tableNo}</td>
                    <td className="method-cell">{txn.paymentMode || "Cash"}</td>
                    <td className="amount-cell">${Number(txn.amount || 0).toFixed(2)}</td>
                    <td className="status-cell">
                      <span className={`settled-pill ${txn.paymentStatus === "Paid" ? "" : "pending-pill"}`}>
                        <span className="settled-dot" />
                        {txn.paymentStatus}
                      </span>
                    </td>
                    <td className="time-cell">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {selectedTxn && (
        <AdminOrderDetailModal
          order={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onMarkPaid={async (id) => {
            await handleMarkCashPaid(id);
            setSelectedTxn(null);
          }}
        />
      )}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        orders={orders}
      />
    </div>
  );
};
export default PaymentsPage;