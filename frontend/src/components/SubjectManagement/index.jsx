import { useEffect, useState, useMemo } from "react";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getDepartments,
  getCourses,
} from "../../services/api";
import "./index.css";

const emptySubjectForm = {
  department: "Computer Science",
  course: "B.Tech",
  semester: 1,
  subjectCode: "",
  subjectName: "",
  credits: 3,
  maxMarks: 100,
};

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedSem, setSelectedSem] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(emptySubjectForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [subjectsRes, deptRes, coursesRes] = await Promise.all([
        getSubjects(),
        getDepartments().catch(() => ({ departments: [] })),
        getCourses().catch(() => ({ courses: [] })),
      ]);

      if (subjectsRes && subjectsRes.success) {
        setSubjects(subjectsRes.subjects || []);
      }
      if (deptRes && deptRes.departments) {
        setDepartments(deptRes.departments);
      }
      if (coursesRes && coursesRes.courses) {
        setCourses(coursesRes.courses);
      }
    } catch (err) {
      console.error("Load subjects error:", err);
      setError(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchDept = selectedDept === "All" || s.department === selectedDept;
      const matchCourse = selectedCourse === "All" || s.course === selectedCourse;
      const matchSem = selectedSem === "All" || String(s.semester) === String(selectedSem);
      return matchDept && matchCourse && matchSem;
    });
  }, [subjects, selectedDept, selectedCourse, selectedSem]);

  const handleOpenAdd = () => {
    setFormData({
      department: selectedDept !== "All" ? selectedDept : (departments[0]?.name || "Computer Science"),
      course: selectedCourse !== "All" ? selectedCourse : (courses[0]?.name || "B.Tech"),
      semester: selectedSem !== "All" ? Number(selectedSem) : 1,
      subjectCode: "",
      subjectName: "",
      credits: 3,
      maxMarks: 100,
    });
    setIsEditing(false);
    setCurrentId(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleOpenEdit = (subject) => {
    setFormData({
      department: subject.department || "Computer Science",
      course: subject.course || "B.Tech",
      semester: subject.semester || 1,
      subjectCode: subject.subjectCode || "",
      subjectName: subject.subjectName || "",
      credits: subject.credits || 3,
      maxMarks: subject.maxMarks || 100,
    });
    setIsEditing(true);
    setCurrentId(subject._id || subject.id);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData(emptySubjectForm);
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

    if (!formData.subjectCode.trim() || !formData.subjectName.trim()) {
      setError("Subject Code and Subject Name are required");
      return;
    }

    try {
      setSaving(true);
      if (isEditing && currentId) {
        const response = await updateSubject(currentId, formData);
        if (response && response.success) {
          setSuccess("Subject updated successfully.");
          setShowModal(false);
          loadData();
        } else {
          setError(response?.message || "Failed to update subject");
        }
      } else {
        const response = await createSubject(formData);
        if (response && response.success) {
          setSuccess("Subject added successfully.");
          setShowModal(false);
          loadData();
        } else {
          setError(response?.message || "Failed to add subject");
        }
      }
    } catch (err) {
      console.error("Save subject error:", err);
      setError(err.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name, code) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete subject "${name} (${code})"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteSubject(id);
      if (response && response.success) {
        setSuccess("Subject deleted successfully.");
        loadData();
      } else {
        setError(response?.message || "Failed to delete subject");
      }
    } catch (err) {
      console.error("Delete subject error:", err);
      setError(err.message || "Failed to delete subject");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Management</h1>
          <p className="page-description">
            Manage subjects for each department, course and semester.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary"
        >
          Add Subject
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Organization Filters */}
      <div className="content-card" style={{ padding: "16px 20px" }}>
        <div className="form-grid-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filterDept">Department</label>
            <select
              id="filterDept"
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
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

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filterCourse">Course</label>
            <select
              id="filterCourse"
              className="form-control"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="All">All Courses</option>
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

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filterSem">Semester</label>
            <select
              id="filterSem"
              className="form-control"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      {loading ? (
        <div className="loading-box">Loading subjects...</div>
      ) : filteredSubjects.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Maximum Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((s) => (
                <tr key={s._id || s.id}>
                  <td>
                    <span className="roll-badge">{s.subjectCode}</span>
                  </td>
                  <td>
                    <strong>{s.subjectName}</strong>
                  </td>
                  <td>{s.department || "Computer Science"}</td>
                  <td>{s.course || "B.Tech"}</td>
                  <td>Semester {s.semester}</td>
                  <td>{s.credits || 3}</td>
                  <td>{s.maxMarks || 100}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(s)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() =>
                          handleDelete(
                            s._id || s.id,
                            s.subjectName,
                            s.subjectCode
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
          <h3>No Subjects Added</h3>
          <p>No subjects have been configured for this semester.</p>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? "Edit Subject" : "Add Subject"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
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
                  <label htmlFor="course">Course</label>
                  <select
                    id="course"
                    name="course"
                    className="form-control"
                    value={formData.course}
                    onChange={handleFormChange}
                    required
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
                  <label htmlFor="semester">Semester</label>
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
                  <label htmlFor="subjectCode">
                    Subject Code <span className="req">*</span>
                  </label>
                  <input
                    id="subjectCode"
                    type="text"
                    name="subjectCode"
                    className="form-control"
                    placeholder="e.g. CS401, DBMS101"
                    value={formData.subjectCode}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label htmlFor="subjectName">
                    Subject Name <span className="req">*</span>
                  </label>
                  <input
                    id="subjectName"
                    type="text"
                    name="subjectName"
                    className="form-control"
                    placeholder="e.g. Database Management Systems"
                    value={formData.subjectName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="credits">Credits</label>
                  <input
                    id="credits"
                    type="number"
                    name="credits"
                    className="form-control"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxMarks">Maximum Marks</label>
                  <input
                    id="maxMarks"
                    type="number"
                    name="maxMarks"
                    className="form-control"
                    min="1"
                    value={formData.maxMarks}
                    onChange={handleFormChange}
                    required
                  />
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
                    ? "Update Subject"
                    : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
