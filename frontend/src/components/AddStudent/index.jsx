import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createStudent, getStudents, getDepartments, getCourses } from "../../services/api";
import "./index.css";

const emptyStudent = {
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

const AddStudent = () => {
  const [formData, setFormData] = useState(emptyStudent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [createdStudent, setCreatedStudent] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const loadInitialData = async () => {
    try {
      const [studentsRes, deptRes, coursesRes] = await Promise.all([
        getStudents(),
        getDepartments().catch(() => ({ departments: [] })),
        getCourses().catch(() => ({ courses: [] })),
      ]);

      if (studentsRes && studentsRes.success) {
        setRecentStudents((studentsRes.students || []).slice(0, 5));
      }
      if (deptRes && deptRes.departments) {
        setDepartments(deptRes.departments);
      }
      if (coursesRes && coursesRes.courses) {
        setCourses(coursesRes.courses);
      }
    } catch (err) {
      console.error("Load add student initial data error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setCreatedStudent(null);

    if (
      !formData.studentId.trim() ||
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setError("Please fill in all required fields (Roll Number, Full Name, Email, Phone)");
      return;
    }

    try {
      setLoading(true);
      const response = await createStudent(formData);

      if (response && response.success) {
        setSuccessMsg("Student added successfully.");
        setCreatedStudent(response.student);
        setFormData(emptyStudent);
        loadInitialData();
      } else {
        setError(response?.message || "Failed to add student");
      }
    } catch (err) {
      console.error("Add student error:", err);
      setError(err.message || "Failed to add student. Please check input fields.");
    } finally {
      setLoading(false);
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
          <h1 className="page-title">Add Student</h1>
          <p className="page-description">Add a new student to the college.</p>
        </div>

        <Link to="/students" className="btn-secondary">
          &larr; Back to Students
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMsg && (
        <div className="alert alert-success" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
          <div>
            <strong>{successMsg}</strong>{" "}
            {createdStudent && (
              <span>
                (Name: <strong>{createdStudent.fullName}</strong>, Roll No: <strong>{createdStudent.studentId}</strong>)
              </span>
            )}
          </div>
          {createdStudent && (
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <Link to={`/students/${createdStudent._id || createdStudent.id}`} className="btn-primary btn-sm">
                View Student
              </Link>
              <Link to="/students" className="btn-secondary btn-sm">
                Back to Students
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Add Student Form */}
      <div className="content-card">
        <h2 className="card-title">Student Details</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="studentId">
                Roll Number / Student ID <span className="req">*</span>
              </label>
              <input
                id="studentId"
                type="text"
                name="studentId"
                className="form-control"
                placeholder="e.g. 24CS101"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                placeholder="e.g. rahul@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Contact Phone <span className="req">*</span>
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
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
              <label htmlFor="course">Course / Degree</label>
              <select
                id="course"
                name="course"
                className="form-control"
                value={formData.course}
                onChange={handleChange}
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
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                className="form-control"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="admissionYear">Admission Year</label>
              <input
                id="admissionYear"
                type="number"
                name="admissionYear"
                className="form-control"
                value={formData.admissionYear}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Enrollment Status <span className="req">*</span>
              </label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Studying">Current Student</option>
                <option value="Graduated">Graduated</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Adding Student..." : "Add Student"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFormData(emptyStudent)}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Recently Added Students */}
      <div className="content-card">
        <h2 className="card-title">Recently Added Students</h2>

        {recentStudents && recentStudents.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s._id || s.id}>
                    <td>
                      <span className="roll-badge">{s.studentId}</span>
                    </td>
                    <td>
                      <strong>{s.fullName}</strong>
                    </td>
                    <td>{s.department || "Computer Science"}</td>
                    <td>{s.course || "B.Tech"}</td>
                    <td>
                      <span className={getStatusBadge(s.status)}>
                        {formatStatus(s.status)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/students/${s._id || s.id}`} className="btn-secondary btn-sm">
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
            <p>Students added through this form will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;
