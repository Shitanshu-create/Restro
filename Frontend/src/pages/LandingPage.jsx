import "../styles/globals.css";
import { useNavigate } from "react-router-dom";



const LandingPage = ({ isLoggedIn, user }) => {

  const navigate = useNavigate();
  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "chef" || user.role === "waiter") return "/kitchen";
    if (user.isAdmin || user.role === "admin") return "/admin";
    return "/admin";
  };
  const targetPath = getDashboardPath();


  return (
    <div className="landing-shell">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="brand-logo-group">
          <div className="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2L6 14" />
              <path d="M6 2l12 14" />
              <path d="M12 14v8" />
            </svg>
          </div>
          <span className="brand-name">Reztro</span>
        </div>
        <div className="nav-actions">
          {isLoggedIn ? (
            <button className="landing-btn-primary" onClick={() => navigate(targetPath)}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className="landing-btn-secondary" onClick={() => navigate("/login")}>
                Sign In
              </button>
              <button className="landing-btn-primary" onClick={() => navigate("/register")}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <span className="hero-pill-tag">✨ QR Dine-In & Staff Console</span>
          <h1 className="hero-title">
            Smart Restaurant Operations & Real-Time Checkout
          </h1>
          <p className="hero-subtitle">
            Manage live table orders, staff shifts, cashless payments, and kitchen workflows seamlessly with Reztro.
          </p>
          <div className="hero-cta-group">
            <button
              className="hero-btn-primary"
              onClick={() => navigate(isLoggedIn ? targetPath : "/login")}
            >
              {isLoggedIn ? "Open Dashboard" : "Staff Console Login"}
            </button>
            <button
              className="hero-btn-secondary"
              onClick={() => navigate(isLoggedIn ? targetPath : "/register")}
            >
              Register New Restaurant
            </button>
          </div>
        </div>
        {/* Feature Cards Grid */}
        <div className="landing-features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3>Real-Time Live Queue</h3>
            <p>Track incoming kitchen orders, table assignments, and preparation statuses instantly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 18v3M20 18v3M4 11h16M3 7h18M5 7v4M19 7v4" />
              </svg>
            </div>
            <h3>Interactive Table Map</h3>
            <p>Visual floor plan monitoring seated tables, active bills, and walk-in capacity in real time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3>Cashless Payments</h3>
            <p>Instant QR checkout ledger with staff tip distribution and automated settlement reporting.</p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Reztro SaaS Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default LandingPage;