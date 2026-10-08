import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.svg";
import "./index.css";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <div className="sidebar-title-group">
          <span className="sidebar-app-name">Student College Management System</span>
          <span className="sidebar-college-name">{currentUser?.collegeName || "College Admin"}</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Dashboard
        </NavLink>

        <div className="sidebar-section-divider"></div>

        <NavLink
          to="/students"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Students
        </NavLink>

        <NavLink
          to="/add-student"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Add Student
        </NavLink>

        <div className="sidebar-section-divider"></div>

        <NavLink
          to="/marks"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Marks
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Attendance
        </NavLink>

        <NavLink
          to="/backlogs"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Backlogs
        </NavLink>

        <NavLink
          to="/semester-results"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Semester Results
        </NavLink>

        <div className="sidebar-section-divider"></div>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          College Profile
        </NavLink>
      </nav>

      {/* Footer Logout */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;