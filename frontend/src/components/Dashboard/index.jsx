import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/api";
import "./index.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardStats();

      if (response && response.success) {
        setStats(response.stats || {});
        setRecentStudents(response.recentStudents || []);
      } else {
        setError(response?.message || "Unable to load dashboard statistics");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "studying" || s === "current student") return "badge badge-studying";
    if (s === "graduated") return "badge badge-graduated";
    if (s === "discontinued") return "badge badge-discontinued";
    return "badge";
  };

  const formatStatus = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "studying" || s === "current student") return "Current Student";
    if (s === "graduated") return "Graduated";
    if (s === "discontinued") return "Discontinued";
    return status || "Current Student";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-box">Loading dashboard...</div>
      </div>
    );
  }

  const total = stats?.totalStudents ?? 0;
  const current = stats?.currentlyStudying ?? stats?.studyingStudents ?? 0;
  const graduated = stats?.graduated ?? stats?.graduatedStudents ?? 0;
  const backlogs = stats?.pendingBacklogs ?? stats?.totalBacklogs ?? 0;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Manage students, subjects, marks, attendance and semester results from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="btn-secondary"
        >
          Refresh Data
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 4 Summary Cards */}
      <div className="dashboard-summary-grid">
        <div className="summary-card card-navy">
          <span className="summary-title">Total Students</span>
          <div className="summary-value">{total}</div>
          <span className="summary-desc">Total registered in college</span>
        </div>

        <div className="summary-card card-green">
          <span className="summary-title">Current Students</span>
          <div className="summary-value">{current}</div>
          <span className="summary-desc">Active studying on campus</span>
        </div>

        <div className="summary-card card-blue">
          <span className="summary-title">Graduated Students</span>
          <div className="summary-value">{graduated}</div>
          <span className="summary-desc">Passed-out alumni</span>
        </div>

        <div className="summary-card card-orange">
          <span className="summary-title">Pending Backlogs</span>
          <div className="summary-value">{backlogs}</div>
          <span className="summary-desc">Awaiting exam clearance</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="content-card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="quick-actions-row">
          <Link to="/add-student" className="quick-action-link">
            <strong>Add New Student</strong>
            <span>Register a new admission</span>
          </Link>

          <Link to="/marks" className="quick-action-link">
            <strong>Enter Marks</strong>
            <span>Record semester scores</span>
          </Link>

          <Link to="/attendance" className="quick-action-link">
            <strong>Record Attendance</strong>
            <span>Log subject attendance</span>
          </Link>

          <Link to="/backlogs" className="quick-action-link">
            <strong>Manage Backlogs</strong>
            <span>Record clearance exams</span>
          </Link>
        </div>
      </div>

      {/* Recently Added Students */}
      <div className="content-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 className="card-title" style={{ margin: 0 }}>Recently Added Students</h2>
          <Link to="/students" style={{ fontSize: "13px", fontWeight: 600 }}>
            View All Students &rarr;
          </Link>
        </div>

        {recentStudents && recentStudents.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr key={student._id || student.id}>
                    <td>
                      <span className="roll-badge">{student.studentId}</span>
                    </td>
                    <td>
                      <strong>{student.fullName}</strong>
                    </td>
                    <td>{student.department || "Computer Science"}</td>
                    <td>{student.course || "B.Tech"}</td>
                    <td>
                      <span className={getStatusBadge(student.status)}>
                        {formatStatus(student.status)}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/students/${student._id || student.id}`}
                        className="btn-secondary btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Students Added Yet</h3>
            <p>Click &quot;Add New Student&quot; to register your first student record.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
