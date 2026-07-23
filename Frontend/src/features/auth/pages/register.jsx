import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { validateRegisterInput } from "../utils/authValidation.js";
import "../styles/register.css";
const Register = ({ onBack, onOpenLogin, onRegisterSuccess }) => {
  const { handleRegister } = useAuth();
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const formData = new FormData(event.currentTarget);
    const validation = validateRegisterInput({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      role: String(formData.get("role") || "waiter")
    });
    if (validation.message) {
      setError(validation.message);
      return;
    }
    setLoading(true);
    const res = await handleRegister(validation.values);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || "Account creation request sent to the admin for approval.");
    } else {
      setError(res.message || "Registration failed");
    }
  };
  return (
    <section className="register-page">
      <div className="register-card">
        <button className="register-back-button" type="button" onClick={onBack}>
          Back
        </button>
        <div className="register-heading">
          <p>Create staff profile</p>
          <h1>Join Restro</h1>
          <span>Set up a secure staff account for the restaurant console.</span>
        </div>
        {error && <p className="register-error" role="alert">{error}</p>}
        {successMsg ? (
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
            <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "8px" }}>Request Submitted!</p>
            <p style={{ fontSize: "14px", marginBottom: "16px" }}>{successMsg}</p>
            <button className="register-submit-button" type="button" onClick={onOpenLogin}>
              Go to Login
            </button>
          </div>
        ) : (
          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              <span>Full Name</span>
              <input name="name" type="text" placeholder="Your full name" required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" placeholder="staff@restro.com" required />
            </label>
            <label>
              <span>Role</span>
              <select name="role" required defaultValue="waiter" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--color-border, #cbd5e1)", background: "var(--color-bg-card, #fff)", fontSize: "14px", color: "var(--color-text-title, #1e293b)", outline: "none" }}>
                <option value="waiter">Waiter</option>
                <option value="chef">Chef / Kitchen Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" placeholder="Create password" required />
            </label>
            <button className="register-submit-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
            <button className="register-login-button" type="button" onClick={onOpenLogin}>
              Login
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
export default Register;
