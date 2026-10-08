import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.svg";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired") === "true") {
      setSessionExpired(true);
    }
  }, [location]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSessionExpired(false);

    if (!form.email.trim()) {
      setError("Please enter your college email");
      return;
    }

    if (!form.password) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);
      const response = await loginApi({
        email: form.email.trim(),
        password: form.password,
      });

      if (response.success && response.token) {
        login(response.token, response.user);
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.message || "Invalid college email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid college email or password");
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

        <h2 className="auth-title">College Login</h2>
        <p className="auth-subtitle">Sign in to manage your college records</p>

        {sessionExpired && (
          <div className="alert alert-danger">
            Session expired. Please login again.
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">College Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. admin@college.edu"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have a college account?{" "}
            <Link to="/signup" className="auth-link">
              Create College Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;