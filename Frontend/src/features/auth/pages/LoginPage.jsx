import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuth.js";
import { validateEmail, validatePassword } from "../utils/authValidation.js";
import "../styles/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    const data = await login(email, password);
    if (data?.user) {
      const user = data.user;
      if (user.isAdmin) {
        navigate("/admin");
      } else if (user.role === "chef" || user.role === "waiter") {
        navigate("/kitchen");
      } else {
        navigate("/");
      }
    }
  }

  const displayError = validationError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <span className="auth-card__logo-icon">🍽️</span>
          <span className="auth-card__logo-name">Restro</span>
        </div>

        <div className="auth-card__header">
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">Sign in to your staff account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {displayError && (
            <div className="auth-alert auth-alert--error">
              <span>⚠️</span>
              <span>{displayError}</span>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="you@restaurant.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); setValidationError(""); }}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null); setValidationError(""); }}
                required
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-btn__spinner" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Request access</Link>
        </p>
        <p className="auth-footer">
          <Link to="/" className="auth-link">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
