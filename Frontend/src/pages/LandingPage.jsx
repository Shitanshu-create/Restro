import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/env.js";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/getMe`, { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  function handleDashboard() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.isAdmin) {
      navigate("/admin");
    } else if (user.role === "chef" || user.role === "waiter") {
      navigate("/kitchen");
    } else {
      navigate("/login");
    }
  }

  async function handleLogout() {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (e) {
      setUser(null);
    }
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav__brand">
          <span className="landing-nav__logo">🍽️</span>
          <span className="landing-nav__name">Restro</span>
        </div>
        <div className="landing-nav__actions">
          {user ? (
            <>
              <span className="landing-nav__greeting">Hi, {user.name}</span>
              <button className="btn-primary" onClick={handleDashboard}>
                Go to Dashboard
              </button>
              <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-primary" onClick={() => navigate("/register")}>Register</button>
            </>
          )}
        </div>
      </nav>

      <main className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__badge">🚀 QR-Based Ordering System</div>
          <h1 className="landing-hero__title">
            Modern Restaurant<br />
            <span className="landing-hero__title--accent">Management</span>
          </h1>
          <p className="landing-hero__subtitle">
            Streamline your restaurant operations with our all-in-one platform.
            QR ordering, kitchen display, and admin control — all in one place.
          </p>
          <div className="landing-hero__cta">
            {user ? (
              <button className="btn-primary btn-lg" onClick={handleDashboard}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button className="btn-primary btn-lg" onClick={() => navigate("/login")}>
                  Staff Login →
                </button>
                <button className="btn-secondary btn-lg" onClick={() => navigate("/menu")}>
                  View Menu
                </button>
              </>
            )}
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-card">
            <div className="landing-card__icon">👨‍🍳</div>
            <div className="landing-card__title">Kitchen Dashboard</div>
            <div className="landing-card__desc">Real-time order management for chefs</div>
          </div>
          <div className="landing-card landing-card--offset">
            <div className="landing-card__icon">📊</div>
            <div className="landing-card__title">Admin Panel</div>
            <div className="landing-card__desc">Full control over menu, staff & revenue</div>
          </div>
          <div className="landing-card">
            <div className="landing-card__icon">📱</div>
            <div className="landing-card__title">QR Ordering</div>
            <div className="landing-card__desc">Customers order directly from their phone</div>
          </div>
        </div>
      </main>

      <section className="landing-features">
        <h2 className="landing-features__title">Everything You Need</h2>
        <div className="landing-features__grid">
          {[
            { icon: "⚡", title: "Real-time Orders", desc: "Kitchen sees orders instantly as customers place them" },
            { icon: "💳", title: "Flexible Payments", desc: "Support for cash, UPI, and online payments via Razorpay" },
            { icon: "👥", title: "Staff Management", desc: "Admin approval flow for chef and waiter accounts" },
            { icon: "📈", title: "Revenue Analytics", desc: "Track daily revenue trends and top-selling items" },
            { icon: "🍽️", title: "Menu Control", desc: "Add, edit, or hide menu items and categories instantly" },
            { icon: "🔒", title: "Secure Sessions", desc: "JWT-based sessions with server-side token blacklisting" },
          ].map((f, i) => (
            <div key={i} className="landing-feature-card">
              <div className="landing-feature-card__icon">{f.icon}</div>
              <div className="landing-feature-card__title">{f.title}</div>
              <div className="landing-feature-card__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2024 Restro. Built with ❤️ for modern restaurants.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
