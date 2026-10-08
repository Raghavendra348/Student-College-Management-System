import { useEffect, useState, useMemo } from "react";
import {
  getAcademicRecords,
  getStudents,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
} from "../../services/api";
import "./index.css";

const emptyAcademicForm = {
  studentId: "",
  year: 1,
  semester: 1,
  academicYear: "2024-2025",
  status: "Current",
};

const Academic = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(emptyAcademicForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [academicRes, studentsRes] = await Promise.all([
        getAcademicRecords(),
        getStudents(),
      ]);

      if (academicRes && academicRes.success) {
        setRecords(academicRes.records || []);
      }
      if (studentsRes && studentsRes.success) {
        setStudents(studentsRes.students || []);
      }
    } catch (err) {
      console.error("Load academic data error:", err);
      setError(err.message || "Failed to load academic records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSemester =
        semesterFilter === "All" ||
        String(r.semester) === String(semesterFilter);

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        (r.studentCode && r.studentCode.toLowerCase().includes(search)) ||
        (r.fullName && r.fullName.toLowerCase().includes(search)) ||
        (r.academicYear && r.academicYear.toLowerCase().includes(search));

      return matchesSemester && matchesSearch;
    });
  }, [records, semesterFilter, searchTerm]);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students[0]?._id || students[0]?.id || "",
      year: 1,
      semester: 1,
      academicYear: "2024-2025",
      status: "Current",
    });
    setIsEditing(false);
    setCurrentId(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setFormData({
      studentId: r.studentId?._id || r.studentId || "",
      year: r.year || 1,
      semester: r.semester || 1,
      academicYear: r.academicYear || "2024-2025",
      status: r.status || "Current",
    });
    setIsEditing(true);
    setCurrentId(r._id || r.id);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(emptyAcademicForm);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.studentId || !formData.academicYear.trim()) {
      setError("Please select student and specify academic year");
      return;
    }

    try {
      setSaving(true);
      if (isEditing && currentId) {
        const response = await updateAcademicRecord(currentId, {
          year: Number(formData.year),
          semester: Number(formData.semester),
          academicYear: formData.academicYear.trim(),
          status: formData.status,
        });

        if (response.success) {
          setSuccess("Academic record updated successfully");
          setShowModal(false);
          loadData();
        } else {
          setError(response.message || "Failed to update academic record");
        }
      } else {
        const response = await createAcademicRecord({
          studentId: formData.studentId,
          year: Number(formData.year),
          semester: Number(formData.semester),
          academicYear: formData.academicYear.trim(),
          status: formData.status,
        });

        if (response.success) {
          setSuccess("Academic record created successfully");
          setShowModal(false);
          loadData();
        } else {
          setError(response.message || "Failed to create academic record");
        }
      }
    } catch (err) {
      console.error("Save academic record error:", err);
      setError(err.message || "Failed to save academic record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, studentName, semester) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Semester ${semester} record for ${studentName}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteAcademicRecord(id);
      if (response.success) {
        setSuccess("Academic record deleted successfully");
        loadData();
      } else {
        setError(response.message || "Failed to delete academic record");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete academic record");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Completed") return "badge badge-studying";
    if (status === "Current") return "badge badge-graduated";
    return "badge badge-pending";
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Records</h1>
          <p className="page-description">
            Manage academic years, semesters, and semester progress
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary"
          disabled={students.length === 0}
        >
          ➕ Add Academic Record
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filter and Search Bar */}
      <div className="students-filter-bar">
        <div className="status-filter-buttons">
          <button
            type="button"
            className={`filter-btn ${semesterFilter === "All" ? "active" : ""}`}
            onClick={() => setSemesterFilter("All")}
          >
            All Semesters
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              type="button"
              className={`filter-btn ${
                semesterFilter === String(sem) ? "active" : ""
              }`}
              onClick={() => setSemesterFilter(String(sem))}
            >
              Sem {sem}
            </button>
          ))}
        </div>

        <div className="search-box-wrapper">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search student or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-box">Loading academic records...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Academic Year</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r._id || r.id}>
                    <td>
                      <span className="roll-badge">{r.studentCode}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-900)" }}>{r.fullName}</strong>
                    </td>
                    <td>
                      <span className="academic-year-pill">{r.academicYear}</span>
                    </td>
                    <td>Year {r.year}</td>
                    <td>
                      <span className="course-pill">Sem {r.semester}</span>
                    </td>
                    <td>
                      <span className={getStatusBadge(r.status)}>
                        {r.status || "Current"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-secondary action-btn"
                          onClick={() => handleOpenEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger action-btn"
                          onClick={() =>
                            handleDelete(
                              r._id || r.id,
                              r.fullName,
                              r.semester
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                    No academic records match the search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {isEditing
                  ? "Edit Academic Record"
                  : "Add New Academic Record"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-form-grid">
                {!isEditing && (
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label htmlFor="studentId">Select Student *</label>
                    <select
                      id="studentId"
                      name="studentId"
                      className="form-control"
                      value={formData.studentId}
                      onChange={handleFormChange}
                      required
                    >
                      {students.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.studentId} - {s.fullName} ({s.course})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="academicYear">Academic Year *</label>
                  <input
                    id="academicYear"
                    type="text"
                    name="academicYear"
                    className="form-control"
                    placeholder="e.g. 2024-2025"
                    value={formData.academicYear}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">Year of Study *</label>
                  <select
                    id="year"
                    name="year"
                    className="form-control"
                    value={formData.year}
                    onChange={handleFormChange}
                    required
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    name="semester"
                    className="form-control"
                    value={formData.semester}
                    onChange={handleFormChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Semester Status *</label>
                  <select
                    id="status"
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Current">Current</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Record"
                    : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academic;