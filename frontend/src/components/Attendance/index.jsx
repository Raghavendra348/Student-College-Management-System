import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getAttendance,
  getStudents,
  getSubjects,
  createAttendance,
  deleteAttendance,
} from "../../services/api";
import { getBranchSemesterSubjects } from "../../services/curriculum";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);

  const [attendanceInputs, setAttendanceInputs] = useState({});
  const [customSubject, setCustomSubject] = useState("");
  const [customConducted, setCustomConducted] = useState("");
  const [customAttended, setCustomAttended] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsRes, attRes, subjectsRes] = await Promise.all([
        getStudents(),
        getAttendance(),
        getSubjects().catch(() => ({ subjects: [] })),
      ]);

      if (studentsRes && studentsRes.success) {
        setStudents(studentsRes.students || []);
        if (studentsRes.students && studentsRes.students.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentsRes.students[0]._id || studentsRes.students[0].id);
        }
      }

      if (attRes && attRes.success) {
        setAttendanceRecords(attRes.attendance || []);
      }

      if (subjectsRes && subjectsRes.subjects) {
        setAllSubjects(subjectsRes.subjects || []);
      }
    } catch (err) {
      console.error("Load attendance error:", err);
      setError(err.message || "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedStudent = useMemo(() => {
    return students.find(
      (s) => String(s._id || s.id) === String(selectedStudentId)
    );
  }, [students, selectedStudentId]);

  // Subjects specific to this student's branch/department and selected semester
  const availableConfiguredSubjects = useMemo(() => {
    if (!selectedStudent) return [];
    const fromApi = allSubjects.filter((sub) => {
      const matchDept =
        !sub.department ||
        sub.department === selectedStudent.department ||
        sub.department === "All";
      const matchCourse =
        !sub.course ||
        sub.course === selectedStudent.course ||
        sub.course === "All";
      const matchSem = Number(sub.semester) === Number(selectedSemester);
      return matchDept && matchCourse && matchSem;
    });

    if (fromApi.length > 0) return fromApi;

    // Use branch-specific curriculum
    return getBranchSemesterSubjects(selectedStudent.department, selectedSemester);
  }, [allSubjects, selectedStudent, selectedSemester]);

  // Attendance already recorded for this student in this semester
  const currentSemesterAttendance = useMemo(() => {
    if (!selectedStudentId) return [];
    return attendanceRecords.filter((a) => {
      const matchStudent =
        String(a.studentId?._id || a.studentId) === String(selectedStudentId) ||
        String(a.studentCode) === String(selectedStudent?.studentId);
      const matchSem = Number(a.semester) === Number(selectedSemester);
      return matchStudent && matchSem;
    });
  }, [attendanceRecords, selectedStudentId, selectedSemester, selectedStudent]);

  const handleInputChange = (subjectKey, field, value) => {
    setAttendanceInputs((prev) => ({
      ...prev,
      [subjectKey]: {
        ...(prev[subjectKey] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveConfiguredAttendance = async (subjectObj) => {
    setError("");
    setSuccess("");

    const inputData = attendanceInputs[subjectObj.subjectName] || {};
    const total = Number(inputData.totalClasses);
    const attended = Number(inputData.attendedClasses);

    if (Number.isNaN(total) || total <= 0) {
      setError(`Please enter valid total classes conducted for ${subjectObj.subjectName}`);
      return;
    }

    if (Number.isNaN(attended) || attended < 0) {
      setError(`Please enter valid classes attended for ${subjectObj.subjectName}`);
      return;
    }

    if (attended > total) {
      setError(`Classes attended cannot exceed total classes conducted for ${subjectObj.subjectName}`);
      return;
    }

    try {
      setSaving(true);
      const response = await createAttendance({
        studentId: selectedStudentId,
        semester: Number(selectedSemester),
        subject: subjectObj.subjectName,
        totalClasses: total,
        attendedClasses: attended,
      });

      if (response && response.success) {
        setSuccess(`Attendance saved successfully for ${subjectObj.subjectName}.`);
        loadData();
      } else {
        setError(response?.message || "Failed to save attendance");
      }
    } catch (err) {
      console.error("Save attendance error:", err);
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomAttendance = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!customSubject.trim()) {
      setError("Please enter subject name");
      return;
    }

    const total = Number(customConducted);
    const attended = Number(customAttended);

    if (Number.isNaN(total) || total <= 0) {
      setError("Total classes conducted must be greater than 0");
      return;
    }

    if (Number.isNaN(attended) || attended < 0) {
      setError("Classes attended cannot be negative");
      return;
    }

    if (attended > total) {
      setError("Classes attended cannot exceed total classes conducted");
      return;
    }

    try {
      setSaving(true);
      const response = await createAttendance({
        studentId: selectedStudentId,
        semester: Number(selectedSemester),
        subject: customSubject.trim(),
        totalClasses: total,
        attendedClasses: attended,
      });

      if (response && response.success) {
        setSuccess(`Attendance saved successfully for ${customSubject}.`);
        setCustomSubject("");
        setCustomConducted("");
        setCustomAttended("");
        loadData();
      } else {
        setError(response?.message || "Failed to save attendance");
      }
    } catch (err) {
      console.error("Save custom attendance error:", err);
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async (id, subject) => {
    const confirmDelete = window.confirm(`Delete attendance record for ${subject}?`);
    if (!confirmDelete) return;

    try {
      const response = await deleteAttendance(id);
      if (response && response.success) {
        setSuccess("Attendance record deleted successfully.");
        loadData();
      } else {
        setError(response?.message || "Failed to delete attendance");
      }
    } catch (err) {
      console.error("Delete attendance error:", err);
      setError(err.message || "Failed to delete attendance");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-description">
            Record student attendance semester by semester.
          </p>
        </div>

        <Link to="/subjects" className="btn-secondary">
          Configure Subjects &rarr;
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Select Student & Semester Card */}
      <div className="content-card">
        <h2 className="card-title">Select Student &amp; Semester</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="studentSelect">Select Student</label>
            <select
              id="studentSelect"
              className="form-control"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.studentId} - {s.fullName} ({s.course} - {s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semSelect">Select Semester</label>
            <select
              id="semSelect"
              className="form-control"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedStudent && (
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Student: <strong>{selectedStudent.fullName}</strong> &bull; Roll No:{" "}
            <span className="roll-badge">{selectedStudent.studentId}</span> &bull; Dept:{" "}
            <strong>{selectedStudent.department}</strong> &bull; Course:{" "}
            <strong>{selectedStudent.course}</strong>
          </div>
        )}
      </div>

      {/* Configured Subjects for this Semester */}
      <div className="content-card">
        <h2 className="card-title">
          Configured Subjects for Semester {selectedSemester} ({selectedStudent?.course} - {selectedStudent?.department})
        </h2>

        {availableConfiguredSubjects.length > 0 ? (
          <div className="table-container" style={{ marginBottom: "16px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Classes Conducted</th>
                  <th>Classes Attended</th>
                  <th>Calculated Percentage</th>
                  <th>Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {availableConfiguredSubjects.map((sub) => {
                  const existing = currentSemesterAttendance.find(
                    (a) => a.subject.toLowerCase() === sub.subjectName.toLowerCase()
                  );
                  const currentInput = attendanceInputs[sub.subjectName] || {};
                  const calcPct =
                    currentInput.totalClasses && currentInput.attendedClasses
                      ? (
                          (Number(currentInput.attendedClasses) /
                            Number(currentInput.totalClasses)) *
                          100
                        ).toFixed(1)
                      : null;

                  return (
                    <tr key={sub._id || sub.id}>
                      <td>
                        <span className="roll-badge">{sub.subjectCode}</span>
                      </td>
                      <td>
                        <strong>{sub.subjectName}</strong>
                      </td>
                      <td style={{ width: "150px" }}>
                        {existing ? (
                          <span>{existing.totalClasses}</span>
                        ) : (
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            placeholder="e.g. 45"
                            value={currentInput.totalClasses ?? ""}
                            onChange={(e) =>
                              handleInputChange(sub.subjectName, "totalClasses", e.target.value)
                            }
                          />
                        )}
                      </td>
                      <td style={{ width: "150px" }}>
                        {existing ? (
                          <span>{existing.attendedClasses}</span>
                        ) : (
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            placeholder="e.g. 38"
                            value={currentInput.attendedClasses ?? ""}
                            onChange={(e) =>
                              handleInputChange(sub.subjectName, "attendedClasses", e.target.value)
                            }
                          />
                        )}
                      </td>
                      <td>
                        {existing ? (
                          <strong>{existing.attendancePercentage}%</strong>
                        ) : calcPct !== null ? (
                          <span>{calcPct}%</span>
                        ) : (
                          <span style={{ color: "var(--text-light)" }}>-</span>
                        )}
                      </td>
                      <td>
                        {existing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="badge badge-pass">Recorded</span>
                            <button
                              type="button"
                              className="btn-danger btn-sm"
                              onClick={() => handleDeleteAttendance(existing._id || existing.id, existing.subject)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            disabled={saving}
                            onClick={() => handleSaveConfiguredAttendance(sub)}
                          >
                            Save Attendance
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ marginBottom: "16px" }}>
            <h3>No Pre-configured Subjects for this Semester</h3>
            <p>
              Configure subjects in{" "}
              <Link to="/subjects" style={{ fontWeight: 600 }}>
                Subject Management
              </Link>{" "}
              or record custom subject attendance below.
            </p>
          </div>
        )}

        {/* Enter Custom Subject Attendance */}
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginTop: "16px", marginBottom: "10px" }}>
          Record Custom Subject Attendance
        </h3>
        <form onSubmit={handleSaveCustomAttendance}>
          <div className="form-grid-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="customSubject">Subject Name <span className="req">*</span></label>
              <input
                id="customSubject"
                type="text"
                className="form-control"
                placeholder="e.g. Operating Systems"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="customConducted">Classes Conducted <span className="req">*</span></label>
              <input
                id="customConducted"
                type="number"
                className="form-control"
                min="1"
                placeholder="e.g. 50"
                value={customConducted}
                onChange={(e) => setCustomConducted(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="customAttended">Classes Attended <span className="req">*</span></label>
              <input
                id="customAttended"
                type="number"
                className="form-control"
                min="0"
                placeholder="e.g. 42"
                value={customAttended}
                onChange={(e) => setCustomAttended(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving Attendance..." : "Save Attendance"}
            </button>
            {customConducted > 0 && customAttended !== "" && (
              <span style={{ fontSize: "13px", color: "var(--text-body)" }}>
                Calculated Percentage:{" "}
                <strong>
                  {((Number(customAttended) / Number(customConducted)) * 100).toFixed(1)}%
                </strong>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Recorded Attendance for this Student in Selected Semester */}
      <div className="content-card">
        <h2 className="card-title">
          Recorded Attendance for {selectedStudent?.fullName} (Semester {selectedSemester})
        </h2>

        {currentSemesterAttendance.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Classes Conducted</th>
                  <th>Classes Attended</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSemesterAttendance.map((a) => {
                  const pct = Number(a.attendancePercentage || 0);
                  const isGood = pct >= 75;

                  return (
                    <tr key={a._id || a.id}>
                      <td><strong>{a.subject}</strong></td>
                      <td>{a.totalClasses}</td>
                      <td>{a.attendedClasses}</td>
                      <td><strong>{pct}%</strong></td>
                      <td>
                        <span
                          className={`badge ${
                            isGood ? "badge-studying" : "badge-pending"
                          }`}
                        >
                          {isGood ? "Satisfactory" : "Low Attendance"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => handleDeleteAttendance(a._id || a.id, a.subject)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Attendance Recorded Yet</h3>
            <p>No attendance has been recorded for Semester {selectedSemester}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;