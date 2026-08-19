import React, { useState } from "react";
import DateRangeFilter, { getPresetRange } from "./DateRangeFilter.jsx";

const ExportModal = ({ isOpen, onClose, orders }) => {
  const [dateRange, setDateRange] = useState(() => getPresetRange("thisMonth"));

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (!dateRange.from || !dateRange.to || !o.createdAt) return true;
    const date = new Date(o.createdAt);
    return date >= dateRange.from && date <= dateRange.to;
  });

  const handleExportCSV = () => {
    const headers = ["Order ID", "Table", "Customer", "Payment Method", "Amount (₹)", "Status", "Date & Time"];
    const rows = filteredOrders.map((o) => [
      `"#${o.orderId || o.id}"`,
      `"${o.tableNo || ""}"`,
      `"${o.customerName || o.customer || ""}"`,
      `"${o.paymentMode || "Cash"}"`,
      Number(o.amount || o.total || 0).toFixed(2),
      `"${o.paymentStatus || "Pending"}"`,
      `"${o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payments_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payments Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 30px; color: #121212; }
            h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
            p { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; font-weight: 700; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .status-paid { color: #16a34a; font-weight: 600; }
            .status-pending { color: #ea580c; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Payments & Settlement Report</h1>
          <p>Generated on ${new Date().toLocaleString()} | Total Records: ${filteredOrders.length}</p>
          <table>
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
              ${filteredOrders.map(o => `
                <tr>
                  <td>#${o.orderId || o.id}</td>
                  <td>${o.tableNo}</td>
                  <td>${o.paymentMode || 'Cash'}</td>
                  <td>₹${Number(o.amount || o.total || 0).toFixed(2)}</td>
                  <td class="${o.paymentStatus === 'Paid' ? 'status-paid' : 'status-pending'}">${o.paymentStatus}</td>
                  <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
      zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div className="category-modal-card" onClick={(e) => e.stopPropagation()} style={{
        background: "#ffffff", borderRadius: "16px", padding: "24px", width: "min(100%, 460px)",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Export Payments Data</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>×</button>
        </div>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
          Select date range filter to export corresponding payment transactions.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#475569" }}>
            DATE RANGE FILTER
          </label>
          <DateRangeFilter onChange={setDateRange} />
        </div>

        <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
          <strong>Selected Records:</strong> {filteredOrders.length} transactions
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1",
              background: "#ffffff", fontWeight: "600", cursor: "pointer", color: "#0f172a", fontSize: "13px"
            }}
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            style={{
              padding: "10px 16px", borderRadius: "8px", border: "none",
              background: "#FF7A1A", fontWeight: "700", cursor: "pointer", color: "#ffffff", fontSize: "13px"
            }}
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
