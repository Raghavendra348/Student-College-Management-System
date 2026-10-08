import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../services/api";
import logo from "../../assets/logo.svg";
import "../Login/index.css";
import "./index.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setResetUrl("");

    if (!email.trim()) {
      setError("Please enter your registered college email");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPasswordApi({
        email: email.trim().toLowerCase(),
      });

      if (response.success) {
        setSuccess(
          response.message || "Password reset token generated successfully."
        );
        if (response.resetUrl) {
          setResetUrl(response.resetUrl);
        }
      } else {
        setError(response.message || "Unable to process request");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Unable to send password reset request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-logo-header">
          <img src={logo} alt="Student CMS Logo" className="auth-logo" />
        </div>

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your registered college email to reset your password
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            {success}
            {resetUrl && (
              <div className="reset-direct-link">
                <Link to={resetUrl} className="btn-primary reset-action-btn">
                  Proceed to Reset Password &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">College Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
