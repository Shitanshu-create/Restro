import { useState, useEffect, useCallback } from "react";
import StatCard from "../components/StatCard.jsx";
import { getAllStaff, toggleStaffApproval, removeStaff } from "../api/admin.api.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import "../styles/StaffsPage.css";
const FILTER_TABS = ["All", "Pending", "Approved"];
const StaffsPage = () => {
    const { user: currentUser } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);
    const [activeTab, setActiveTab] = useState("All");
    const loadStaff = useCallback(async () => {
        setError(null);
        const res = await getAllStaff();
        if (res.success) {
            setStaffList(res.staff || []);
        } else {
            setError(res.message || "Failed to load staff list");
        }
        setLoading(false);
    }, []);
    useEffect(() => {
        Promise.resolve().then(loadStaff);
    }, [loadStaff]);
    const handleToggleApproval = async (staffId, name) => {
        setActionMsg(null);
        const res = await toggleStaffApproval(staffId);
        if (res.success) {
            setActionMsg(`Updated status for ${name}`);
            loadStaff();
            setTimeout(() => setActionMsg(null), 4000);
        } else {
            setError(res.message || "Failed to update staff status");
        }
    };
    const handleRemove = async (staffId, name) => {
        if (window.confirm(`Are you sure you want to reject/remove staff request for ${name}?`)) {
            setActionMsg(null);
            const res = await removeStaff(staffId);
            if (res.success) {
                setActionMsg(`Staff request for ${name} deleted.`);
                loadStaff();
                setTimeout(() => setActionMsg(null), 4000);
            } else {
                setError(res.message || "Failed to remove staff");
            }
        }
    };
    const pendingCount = staffList.filter((s) => !s.isActive).length;
    const approvedCount = staffList.filter((s) => s.isActive).length;
    const adminCount = staffList.filter((s) => s.isAdmin || s.role === "admin").length;
    const filteredStaff = staffList.filter((s) => {
        if (activeTab === "Pending") return !s.isActive;
        if (activeTab === "Approved") return s.isActive;
        return true;
    });
    // Group staff: Admins -> Chefs -> Waiters
    const admins = filteredStaff.filter((s) => s.isAdmin || s.role === "admin");
    const chefs = filteredStaff.filter((s) => (s.role === "chef") && !s.isAdmin);
    const waiters = filteredStaff.filter((s) => (s.role === "waiter") && !s.isAdmin);
    const sections = [
        { title: "👑 Administrators", list: admins },
        { title: "👨‍🍳 Chefs & Kitchen Staff", list: chefs },
        { title: "🛎️ Waiters & Service Staff", list: waiters }
    ];
    const renderStaffCard = (member) => {
        const isYou = (currentUser?.email && member.email === currentUser.email) ||
            (currentUser?.staffId && member.staffId === currentUser.staffId);
        return (
            <div key={member.staffId} className={`staff-card ${member.isActive ? "status-active" : "status-pending"}`}>
                <div className="staff-card-header">
                    <div className="staff-info-group">
                        <span className="staff-avatar">{member.name.charAt(0).toUpperCase()}</span>
                        <div>
                            <h3 className="staff-name">
                                {member.name} {isYou && <span className="you-badge">(You)</span>}
                            </h3>
                            <span className="staff-email">{member.email}</span>
                        </div>
                    </div>
                    <span className={`staff-status-badge ${member.isActive ? "badge-approved" : "badge-pending"}`}>
                        {member.isActive ? "Approved" : "Pending Approval"}
                    </span>
                </div>
                <div className="staff-meta-row">
                    <span className="staff-tag">ID: {member.staffId}</span>
                    <span className="staff-role-tag">Role: {member.role ? member.role.toUpperCase() : "STAFF"}</span>
                    {member.isAdmin && <span className="staff-admin-tag">ADMIN</span>}
                </div>
                <div className="staff-card-actions">
                    <button
                        className={`btn-action-toggle ${member.isActive ? "btn-deactivate" : "btn-approve"}`}
                        onClick={() => handleToggleApproval(member.staffId, member.name, member.isActive)}
                    >
                        {member.isActive ? "Deactivate Access" : "✓ Accept Request"}
                    </button>
                    <button
                        className="btn-action-reject"
                        onClick={() => handleRemove(member.staffId, member.name)}
                    >
                        Reject / Remove
                    </button>
                </div>
            </div>
        );
    };
    return (
        <div className="staffs-page">
            {actionMsg && <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{actionMsg}</div>}
            {error && <div className="login-error" role="alert" style={{ marginBottom: "16px" }}>{error}</div>}
            {/* Stat Cards */}
            <div className="staffs-stats-grid">
                <StatCard title="Total Registered Staff" value={staffList.length} subtext="Staff accounts" subtextColor="muted" />
                <StatCard title="Pending Approval" value={pendingCount} subtext="Requires admin review" subtextColor="orange" />
                <StatCard title="Approved & Active" value={approvedCount} subtext="Console access granted" subtextColor="green" />
                <StatCard title="Administrators" value={adminCount} subtext="Full access privileges" subtextColor="muted" />
            </div>
            {/* Filter Tabs */}
            <div className="staffs-filter-tabs">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`staff-tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {/* Staff Sections: Admins -> Chefs -> Waiters */}
            {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>Loading staff accounts...</div>
            ) : filteredStaff.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-body)" }}>No staff records found in this view.</div>
            ) : (
                <div className="staffs-sections-container" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {sections.map((section) => {
                        if (section.list.length === 0) return null;
                        return (
                            <div key={section.title} className="staff-role-section">
                                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-title, #0f172a)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--color-border, #e2e8f0)" }}>
                                    {section.title} ({section.list.length})
                                </h2>
                                <div className="staffs-cards-grid">
                                    {section.list.map((member) => renderStaffCard(member))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default StaffsPage;