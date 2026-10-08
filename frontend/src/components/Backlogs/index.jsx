import { useEffect, useState, useMemo } from "react";
import { getBacklogs, clearBacklog, deleteBacklog } from "../../services/api";
import "./index.css";

const Backlogs = () => {
  const [backlogs, setBacklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBacklog, setSelectedBacklog] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [backlogMarks, setBacklogMarks] = useState("");
  const [clearedSemester, setClearedSemester] = useState(1);

  const fetchBacklogsList = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBacklogs();
      if (response && response.success) {
        setBacklogs(response.data || response.backlogs || []);
      } else {
        setError(response?.message || "Failed to load backlogs");
      }
    } catch (err) {
      console.error("Fetch backlogs error:", err);
      setError(err.message || "Failed to load backlogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklogsList();
  }, []);

  const pendingCount = backlogs.filter(
    (b) => String(b.status).toLowerCase() === "pending"
  ).length;

  const clearedCount = backlogs.filter(
    (b) => String(b.status).toLowerCase() === "cleared"
  ).length;

  const filteredBacklogs = useMemo(() => {
    return backlogs.filter((b) => {
      const matchStatus =
        statusFilter === "All" ||
        String(b.status).toLowerCase() === statusFilter.toLowerCase();

      const search = searchTerm.trim().toLowerCase();
      const matchSearch =
        !search ||
        (b.studentCode && b.studentCode.toLowerCase().includes(search)) ||
        (b.fullName && b.fullName.toLowerCase().includes(search)) ||
        (b.subject && b.subject.toLowerCase().includes(search));

      return matchStatus && matchSearch;
    });
  }, [backlogs, statusFilter, searchTerm]);

  const handleOpenClear = (backlogItem) => {
    setSelectedBacklog(backlogItem);
    setBacklogMarks("");
    setClearedSemester(backlogItem.semester || 1);
    setError("");
    setSuccess("");
    setShowClearModal(true);
  };

  const handleCloseClearModal = () => {
    setShowClearModal(false);
    setSelectedBacklog(null);
    setBacklogMarks("");
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!selectedBacklog) return;

    const marks = Number(backlogMarks);
    if (backlogMarks === "" || Number.isNaN(marks) || marks < 0 || marks > 100) {
      setError("Please enter valid marks between 0 and 100");
      return;
    }

    try {
      setClearing(true);
      setError("");

      const response = await clearBacklog(
        selectedBacklog._id || selectedBacklog.id,
        {
          clearedMarks: marks,
          clearedSemester: Number(clearedSemester),
        }
      );

      if (response && response.success) {
        setSuccess(
          `Backlog cleared successfully for ${selectedBacklog.fullName} (${selectedBacklog.subject}).`
        );
        setShowClearModal(false);
        fetchBacklogsList();
      } else {
        setError(response?.message || "Failed to save backlog result");
      }
    } catch (err) {
      console.error("Clear backlog error:", err);
      setError(err.message || "Failed to record backlog result");
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (id, subject, studentName) => {
    const confirmDelete = window.confirm(
      `Delete backlog record for ${subject} (${studentName})?`
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteBacklog(id);
      if (response && response.success) {
        setSuccess("Backlog record deleted successfully.");
        fetchBacklogsList();
      } else {
        setError(response?.message || "Failed to delete backlog");
      }
    } catch (err) {
      console.error("Delete backlog error:", err);
      setError(err.message || "Failed to delete backlog");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Backlogs</h1>
          <p className="page-description">
            View pending student backlogs and record backlog exam results.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBacklogsList}
          className="btn-secondary"
        >
          Refresh Backlogs
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary KPI boxes */}
      <div className="form-grid">
        <div className="content-card" style={{ borderTop: "3px solid var(--warning-color)" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Pending Backlogs
          </span>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--warning-color)", marginTop: "4px" }}>
            {pendingCount}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-light)" }}>Awaiting exam clearance</span>
        </div>

        <div className="content-card" style={{ borderTop: "3px solid var(--success-color)" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Cleared Backlogs
          </span>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--success-color)", marginTop: "4px" }}>
            {clearedCount}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-light)" }}>Passed after re-attempt</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="content-card" style={{ padding: "16px 20px" }}>
        <div className="form-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="searchBacklog">Search Student or Subject</label>
            <input
              id="searchBacklog"
              type="text"
              className="form-control"
              placeholder="Search by Roll No, Name, Subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="statusFilter">Status Filter</label>
            <select
              id="statusFilter"
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Pending">Pending Backlogs</option>
              <option value="Cleared">Cleared Backlogs</option>
              <option value="All">All Backlogs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backlogs Table */}
      {loading ? (
        <div className="loading-box">Loading backlog records...</div>
      ) : filteredBacklogs.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Cleared Marks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBacklogs.map((b) => {
                const isPending = String(b.status).toLowerCase() === "pending";

                return (
                  <tr key={b._id || b.id}>
                    <td>
                      <div>
                        <strong>{b.fullName}</strong>
                        <div style={{ fontSize: "12px" }}>
                          <span className="roll-badge">{b.studentCode}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{b.subject}</strong>
                    </td>
                    <td>Semester {b.semester}</td>
                    <td>
                      <span
                        className={`badge ${
                          isPending ? "badge-pending" : "badge-cleared"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.clearedMarks ? (
                        <strong>{b.clearedMarks} / 100</strong>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {isPending && (
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            style={{ backgroundColor: "var(--success-color)", borderColor: "var(--success-color)" }}
                            onClick={() => handleOpenClear(b)}
                          >
                            Enter Marks
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(
                              b._id || b.id,
                              b.subject,
                              b.fullName
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Pending Backlogs</h3>
          <p>All recorded student subjects are currently cleared.</p>
        </div>
      )}

      {/* Enter Marks (Clear Backlog) Modal */}
      {showClearModal && selectedBacklog && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3>Enter Backlog Marks</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseClearModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="modal-form">
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid var(--border-color)" }}>
                <div>Student: <strong>{selectedBacklog.fullName}</strong> ({selectedBacklog.studentCode})</div>
                <div>Subject: <strong>{selectedBacklog.subject}</strong></div>
                <div>Original Semester: <strong>Semester {selectedBacklog.semester}</strong></div>
              </div>

              <div className="form-group">
                <label htmlFor="backlogMarks">
                  Backlog Exam Marks (0 - 100) <span className="req">*</span>
                </label>
                <input
                  id="backlogMarks"
                  type="number"
                  name="backlogMarks"
                  className="form-control"
                  min="0"
                  max="100"
                  placeholder="e.g. 68 (Passing marks >= 40)"
                  value={backlogMarks}
                  onChange={(e) => setBacklogMarks(e.target.value)}
                  required
                />
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Marks &ge; 40 will automatically mark this subject as Cleared/PASS and update semester results.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="clearedSemester">Exam Cleared In Semester</label>
                <select
                  id="clearedSemester"
                  className="form-control"
                  value={clearedSemester}
                  onChange={(e) => setClearedSemester(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseClearModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ backgroundColor: "var(--success-color)", borderColor: "var(--success-color)" }}
                  disabled={clearing}
                >
                  {clearing ? "Saving..." : "Save Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backlogs;