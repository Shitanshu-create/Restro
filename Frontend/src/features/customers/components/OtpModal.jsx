import React, { useState } from "react";
import { useCustomerAuth } from "../hooks/useCustomer.js";
import "../styles/OtpModal.css";
const OtpModal = ({ onSuccess, onClose }) => {
    const { handleSendOtp, handleVerifyOtp, loading } = useCustomerAuth();
    const [step, setStep] = useState("phone"); // "phone" | "otp"
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const [devOtp, setDevOtp] = useState(null);
    const handleSendOtpSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) return setError("Please enter your name");
        if (!phone.trim()) return setError("Please enter your phone number");
        const res = await handleSendOtp(phone);
        if (res.success) {
            if (res.devOtp) {
                setDevOtp(res.devOtp);
            } else {
                setDevOtp(null);
            }
            setStep("otp");
        } else {
            setError(res.message || "Failed to send OTP");
        }
    };
    const handleVerifyOtpSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!otp.trim()) return setError("Please enter the 6-digit OTP");
        const res = await handleVerifyOtp({ phone, otp, name });
        if (res.success) {
            onSuccess(res.customer);
        } else {
            setError(res.message || "OTP verification failed");
        }
    };
    return (
        <div className="otp-modal-backdrop" onClick={onClose}>
            <div className="otp-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="otp-close-btn" onClick={onClose} aria-label="Close modal">
                    ×
                </button>
                {step === "phone" ? (
                    <form onSubmit={handleSendOtpSubmit} className="otp-form">
                        <div className="otp-header">
                            <h2>Verify Your Phone</h2>
                            <p>Enter your details to receive an OTP via WhatsApp</p>
                        </div>
                        {error && <div className="otp-error-msg">{error}</div>}
                        <div className="otp-field-group">
                            <label>Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Alex Rivera"
                                required
                            />
                        </div>
                        <div className="otp-field-group">
                            <label>Phone Number (WhatsApp)</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 9876543210"
                                required
                            />
                        </div>
                        <button type="submit" className="otp-submit-btn" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtpSubmit} className="otp-form">
                        <div className="otp-header">
                            <h2>Enter Verification Code</h2>
                            <p>Sent to {phone} via WhatsApp</p>
                        </div>
                        {error && <div className="otp-error-msg">{error}</div>}
                        <div className="otp-field-group">
                            <label>6-Digit OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="otp-submit-btn" disabled={loading}>
                            {loading ? "Verifying..." : "Verify & Confirm Order"}
                        </button>
                        <button
                            type="button"
                            className="otp-back-link"
                            onClick={() => setStep("phone")}
                        >
                            ← Change Phone Number
                        </button>
                        {devOtp && (
                            <div className="otp-dev-hint">
                                Your OTP is: <strong>{devOtp}</strong>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};
export default OtpModal;
