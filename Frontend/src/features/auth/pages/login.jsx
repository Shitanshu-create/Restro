import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { validateLoginInput } from "../utils/authValidation.js";
import "../styles/login.css";

const Login = ({ onBack, onOpenRegister, onLoginSuccess }) => {
  const { handleLogin } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "email_exists") {
      setError("This email is already registered. Please log in with your email and password.");
    } else if (err === "oauth_failed") {
      setError("Social login failed. Please try again.");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const validation = validateLoginInput({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    });

    if (validation.message) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    const res = await handleLogin(validation.values);
    setLoading(false);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setError(res.message || "Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="login-back-button" type="button" onClick={onBack}>
          Back
        </button>

        <div className="login-heading">
          <p>Staff access</p>
          <h1>Welcome back</h1>
          <span>Sign in to manage live tables, orders, and kitchen flow.</span>
        </div>

        {error && <p className="login-error" role="alert">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" name="email" placeholder="staff@restro.com" required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" name="password" placeholder="Enter password" required />
          </label>

          <button className="login-submit-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <span>New staff member?</span>
          <button className="login-register-button" type="button" onClick={onOpenRegister}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
