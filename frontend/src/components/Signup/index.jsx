import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCollege } from "../../services/api";
import logo from "../../assets/logo.svg";
import "../Login/index.css";
import "./index.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    collegeName: "",
    email: "",
    principalName: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.collegeName.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("College name, college email, and password are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await registerCollege({
        collegeName: formData.collegeName.trim(),
        email: formData.email.trim().toLowerCase(),
        principalName: formData.principalName.trim(),
        contactNumber: formData.contactNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccess("College account registered successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(response.message || "Unable to register college");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card signup-card-wide">
        <div className="auth-logo-header">
          <img src={logo} alt="Student CMS Logo" className="auth-logo" />
        </div>

        <h2 className="auth-title">Register College Account</h2>
        <p className="auth-subtitle">Create a college administrator account</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="collegeName">College Name *</label>
            <input
              id="collegeName"
              type="text"
              name="collegeName"
              className="form-control"
              placeholder="e.g. National Institute of Technology"
              value={formData.collegeName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">College Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. admin@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="principalName">Principal / Admin Name</label>
              <input
                id="principalName"
                type="text"
                name="principalName"
                className="form-control"
                placeholder="e.g. Dr. K. Sharma"
                value={formData.principalName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                type="text"
                name="contactNumber"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create College Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;