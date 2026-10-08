import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getStudents,
  updateStudent,
  deleteStudent,
  getDepartments,
  getCourses,
} from "../../services/api";
import "./index.css";

const emptyStudentForm = {
  studentId: "",
  fullName: "",
  email: "",
  phone: "",
  gender: "Male",
  dateOfBirth: "",
  department: "Computer Science",
  course: "B.Tech",
  admissionYear: new Date().getFullYear(),
  status: "Studying",
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(emptyStudentForm);

  const fetchStudentList = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsRes, deptRes, coursesRes] = await Promise.all([
        getStudents(),
        getDepartments().catch(() => ({ departments: [] })),
        getCourses().catch(() => ({ courses: [] })),
      ]);

      if (studentsRes && studentsRes.success) {
        setStudents(studentsRes.students || []);
      } else {
        setError(studentsRes?.message || "Failed to load students");
      }

      if (deptRes && deptRes.departments) {
        setDepartments(deptRes.departments);
      }
      if (coursesRes && coursesRes.courses) {
        setCourses(coursesRes.courses);
      }
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "Current Student" || statusFilter === "Studying") {
        matchesStatus = student.status === "Studying" || student.status === "Current Student";
      } else if (statusFilter !== "All") {
        matchesStatus = String(student.status).toLowerCase() === statusFilter.toLowerCase();
      }

      // Department filter
      let matchesDept = true;
      if (departmentFilter !== "All") {
        matchesDept = student.department === departmentFilter;
      }

      // Search filter
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        (student.studentId && student.studentId.toLowerCase().includes(search)) ||
        (student.fullName && student.fullName.toLowerCase().includes(search)) ||
        (student.email && student.email.toLowerCase().includes(search));

      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [students, statusFilter, departmentFilter, searchTerm]);

  const handleOpenEdit = (student) => {
    setFormData({
      studentId: student.studentId || "",
      fullName: student.fullName || "",
      email: student.email || "",
      phone: student.phone || "",
      gender: student.gender || "Male",
      dateOfBirth: student.dateOfBirth || "",
      department: student.department || "Computer Science",
      course: student.course || "B.Tech",
      admissionYear: student.admissionYear || new Date().getFullYear(),
      status: student.status || "Studying",
    });
    setCurrentId(student._id || student.id);
    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setCurrentId(null);
    setFormData(emptyStudentForm);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.studentId.trim() ||
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setError("Roll Number, Full Name, Email, and Phone are required");
      return;
    }

    try {
      setSaving(true);
      const response = await updateStudent(currentId, formData);
      if (response && response.success) {
        setSuccess("Student details updated successfully.");
        setShowEditModal(false);
        fetchStudentList();
      } else {
        setError(response?.message || "Failed to update student");
      }
    } catch (err) {
      console.error("Update student error:", err);
      setError(err.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete student "${name}"?\n\nThis will also remove their associated marks, attendance and backlog records.`
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteStudent(id);
      if (response && response.success) {
        setSuccess("Student deleted successfully.");
        fetchStudentList();
      } else {
        setError(response?.message || "Failed to delete student");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete student");
    }
  };

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

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-description">View and manage students registered in the college.</p>
        </div>

        <Link to="/add-student" className="btn-primary">
          Add Student
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filter and Search Bar */}
      <div className="content-card" style={{ padding: "16px 20px" }}>
        <div className="students-filter-controls">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              className="form-control"
              placeholder="Search Roll No, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="deptFilter">Department</label>
            <select
              id="deptFilter"
              className="form-control"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.length > 0 ? (
                departments.map((d) => (
                  <option key={d.id || d._id} value={d.name}>
                    {d.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </>
              )}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="statusFilter">Enrollment Status</label>
            <select
              id="statusFilter"
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Students</option>
              <option value="Current Student">Current Student</option>
              <option value="Graduated">Graduated</option>
              <option value="Discontinued">Discontinued</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      {loading ? (
        <div className="loading-box">Loading students...</div>
      ) : filteredStudents.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Course</th>
                <th>Admission Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id || student.id}>
                  <td>
                    <span className="roll-badge">{student.studentId}</span>
                  </td>
                  <td>
                    <strong>{student.fullName}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {student.email}
                    </div>
                  </td>
                  <td>{student.department || "Computer Science"}</td>
                  <td>{student.course || "B.Tech"}</td>
                  <td>{student.admissionYear || "N/A"}</td>
                  <td>
                    <span className={getStatusBadge(student.status)}>
                      {formatStatus(student.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/students/${student._id || student.id}`}
                        className="btn-secondary btn-sm"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(student)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() =>
                          handleDelete(
                            student._id || student.id,
                            student.fullName
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Students Found</h3>
          <p>There are currently no students matching your search.</p>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Student</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseEdit}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit_studentId">
                    Roll Number / Student ID <span className="req">*</span>
                  </label>
                  <input
                    id="edit_studentId"
                    type="text"
                    name="studentId"
                    className="form-control"
                    value={formData.studentId}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_fullName">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="edit_fullName"
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_email">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="edit_email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_phone">
                    Contact Phone <span className="req">*</span>
                  </label>
                  <input
                    id="edit_phone"
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_department">Department</label>
                  <select
                    id="edit_department"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleFormChange}
                  >
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <option key={d.id || d._id} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit_course">Course / Degree</label>
                  <select
                    id="edit_course"
                    name="course"
                    className="form-control"
                    value={formData.course}
                    onChange={handleFormChange}
                  >
                    {courses.length > 0 ? (
                      courses.map((c) => (
                        <option key={c.id || c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="MBA">MBA</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit_gender">Gender</label>
                  <select
                    id="edit_gender"
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleFormChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit_dateOfBirth">Date of Birth</label>
                  <input
                    id="edit_dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_admissionYear">Admission Year</label>
                  <input
                    id="edit_admissionYear"
                    type="number"
                    name="admissionYear"
                    className="form-control"
                    value={formData.admissionYear}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_status">
                    Enrollment Status <span className="req">*</span>
                  </label>
                  <select
                    id="edit_status"
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Studying">Current Student</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Update Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;