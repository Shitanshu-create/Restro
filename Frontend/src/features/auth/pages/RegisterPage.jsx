import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../hooks/useAuth.js";
import { validateEmail, validatePassword, validateName } from "../utils/authValidation.js";
import "../styles/RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, success, setError } = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("waiter");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    if (!validateName(name)) {
      setValidationError("Name must be at least 2 characters.");
      return;
    }
    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    await register(name, email, password, role);
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
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__subtitle">Request staff access to Restro</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {displayError && (
            <div className="auth-alert auth-alert--error">
              <span>⚠️</span>
              <span>{displayError}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert auth-alert--success">
              <span>✅</span>
              <span>{success} An admin will review your request.</span>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="auth-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => { setName(e.target.value); setError(null); setValidationError(""); }}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              className="auth-input"
              type="email"
              placeholder="you@restaurant.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); setValidationError(""); }}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="reg-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
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

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              className="auth-input auth-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
            </select>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !!success}
          >
            {loading ? (
              <span className="auth-btn__spinner" />
            ) : (
              "Submit Request"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
        <p className="auth-footer">
          <Link to="/" className="auth-link">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
