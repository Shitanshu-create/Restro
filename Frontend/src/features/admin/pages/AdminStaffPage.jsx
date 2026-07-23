import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedSidebar from "../../../components/SharedSidebar.jsx";
import API_BASE_URL from "../../../config/env.js";
import "../styles/AdminDashboard.css";
import "../styles/AdminMenuPage.css";
import "../styles/AdminStaffPage.css";

function AdminStaffPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => setCurrentUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/staff`, { withCredentials: true });
      setStaff(res.data.staff || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStaff(); }, []);

  async function handleToggleApproval(staffId) {
    setActionLoading(prev => ({ ...prev, [staffId]: "approval" }));
    try {
      await axios.patch(`${API_BASE_URL}/api/auth/staff/${staffId}/approve`, {}, { withCredentials: true });
      await fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(prev => ({ ...prev, [staffId]: null }));
    }
  }

  async function handleRemove(staffId, name) {
    if (!window.confirm(`Remove staff member "${name}"? This cannot be undone.`)) return;
    setActionLoading(prev => ({ ...prev, [staffId]: "remove" }));
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/staff/${staffId}`, { withCredentials: true });
      await fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Remove failed");
    } finally {
      setActionLoading(prev => ({ ...prev, [staffId]: null }));
    }
  }

  // Group by role
  const byRole = { admin: [], chef: [], waiter: [] };
  staff.forEach(s => {
    if (s.isAdmin) byRole.admin.push(s);
    else if (s.role === "chef") byRole.chef.push(s);
    else byRole.waiter.push(s);
  });

  const roleLabels = { admin: "Admins", chef: "Chefs", waiter: "Waiters" };
  const roleIcons = { admin: "👑", chef: "👨‍🍳", waiter: "🤵" };
  const roleColors = { admin: "blue", chef: "orange", waiter: "green" };

  function StaffCard({ member }) {
    const isMe = currentUser?.staffId === member.staffId;
    const busy = actionLoading[member.staffId];
    return (
      <div className={`staff-card ${!member.isActive && !member.isAdmin ? "staff-card--pending" : ""}`}>
        <div className="staff-card__avatar">
          {member.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
        </div>
        <div className="staff-card__info">
          <div className="staff-card__name">
            {member.name}
            {isMe && <span className="staff-you-badge">(You)</span>}
          </div>
          <div className="staff-card__email">{member.email}</div>
          <div className="staff-card__meta">
            <span className="staff-card__id">{member.staffId}</span>
            <span className={`staff-card__status staff-card__status--${member.isActive || member.isAdmin ? "active" : "pending"}`}>
              {member.isAdmin ? "Admin" : member.isActive ? "Active" : "Pending"}
            </span>
          </div>
        </div>
        {!member.isAdmin && !isMe && (
          <div className="staff-card__actions">
            <button
              className={`staff-action-btn staff-action-btn--${member.isActive ? "deactivate" : "approve"}`}
              onClick={() => handleToggleApproval(member.staffId)}
              disabled={!!busy}
            >
              {busy === "approval" ? "..." : member.isActive ? "Deactivate" : "Approve"}
            </button>
            <button
              className="staff-action-btn staff-action-btn--remove"
              onClick={() => handleRemove(member.staffId, member.name)}
              disabled={!!busy}
            >
              {busy === "remove" ? "..." : "Remove"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <SharedSidebar role="admin" user={currentUser} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Staff Management</h1>
            <p className="admin-topbar__sub">{staff.length} total members</p>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__refresh" onClick={fetchStaff}>↻ Refresh</button>
            <div className="admin-topbar__avatar">
              {currentUser?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AD"}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="admin-loading-placeholder">Loading staff...</div>
          ) : error ? (
            <div className="admin-empty" style={{ color: "var(--color-error)" }}>{error}</div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--orange">👥</div>
                  <div>
                    <div className="admin-stat-card__value">{staff.length}</div>
                    <div className="admin-stat-card__label">Total Staff</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--green">✅</div>
                  <div>
                    <div className="admin-stat-card__value">{staff.filter(s => s.isActive || s.isAdmin).length}</div>
                    <div className="admin-stat-card__label">Active</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--yellow">⏳</div>
                  <div>
                    <div className="admin-stat-card__value">{staff.filter(s => !s.isActive && !s.isAdmin).length}</div>
                    <div className="admin-stat-card__label">Pending Approval</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--blue">👑</div>
                  <div>
                    <div className="admin-stat-card__value">{staff.filter(s => s.isAdmin).length}</div>
                    <div className="admin-stat-card__label">Admins</div>
                  </div>
                </div>
              </div>

              {/* Grouped by role */}
              {Object.entries(byRole).map(([role, members]) => (
                members.length > 0 && (
                  <div key={role} className="admin-card staff-group" style={{ marginBottom: 20 }}>
                    <div className="admin-card__header">
                      <h2 className="admin-card__title">
                        {roleIcons[role]} {roleLabels[role]}
                      </h2>
                      <span className={`admin-badge admin-badge--${roleColors[role]}`}>{members.length}</span>
                    </div>
                    <div className="staff-cards-list">
                      {members.map(member => (
                        <StaffCard key={member.staffId} member={member} />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminStaffPage;
