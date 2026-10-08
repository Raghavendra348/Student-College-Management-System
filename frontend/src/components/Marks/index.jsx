import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getMarks,
  getStudents,
  getSubjects,
  createMarks,
  updateMarks,
  deleteMarks,
} from "../../services/api";
import "./index.css";

import { getBranchSemesterSubjects } from "../../services/curriculum";

const Marks = () => {
  const [students, setStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [recordedMarks, setRecordedMarks] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);

  const [marksInputs, setMarksInputs] = useState({});
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [customInternal, setCustomInternal] = useState("");
  const [customExternal, setCustomExternal] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsRes, marksRes, subjectsRes] = await Promise.all([
        getStudents(),
        getMarks(),
        getSubjects().catch(() => ({ subjects: [] })),
      ]);

      if (studentsRes && studentsRes.success) {
        setStudents(studentsRes.students || []);
        if (studentsRes.students && studentsRes.students.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentsRes.students[0]._id || studentsRes.students[0].id);
        }
      }

      if (marksRes && marksRes.success) {
        setRecordedMarks(marksRes.marks || []);
      }

      if (subjectsRes && subjectsRes.subjects) {
        setAllSubjects(subjectsRes.subjects || []);
      }
    } catch (err) {
      console.error("Load marks error:", err);
      setError(err.message || "Failed to load marks and student data");
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
    
    // Check if custom subjects exist in API for this department & semester
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

  // Marks already recorded for this student in this semester
  const currentSemesterRecordedMarks = useMemo(() => {
    if (!selectedStudentId) return [];
    return recordedMarks.filter((m) => {
      const matchStudent =
        String(m.studentId?._id || m.studentId) === String(selectedStudentId) ||
        String(m.studentCode) === String(selectedStudent?.studentId);
      const matchSem = Number(m.semester) === Number(selectedSemester);
      return matchStudent && matchSem;
    });
  }, [recordedMarks, selectedStudentId, selectedSemester, selectedStudent]);

  const handleInputChange = (subjectKey, field, value) => {
    setMarksInputs((prev) => ({
      ...prev,
      [subjectKey]: {
        ...(prev[subjectKey] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveConfiguredSubjectMarks = async (subjectObj) => {
    setError("");
    setSuccess("");

    const inputData = marksInputs[subjectObj.subjectName] || {};
    const internal = Number(inputData.internalMarks ?? 30);
    const external = Number(inputData.externalMarks ?? 50);

    if (Number.isNaN(internal) || internal < 0 || internal > 40) {
      setError(`Internal marks for ${subjectObj.subjectName} must be between 0 and 40`);
      return;
    }

    if (Number.isNaN(external) || external < 0 || external > 60) {
      setError(`External marks for ${subjectObj.subjectName} must be between 0 and 60`);
      return;
    }

    try {
      setSaving(true);
      const response = await createMarks({
        studentId: selectedStudentId,
        semester: Number(selectedSemester),
        subject: subjectObj.subjectName,
        internalMarks: internal,
        externalMarks: external,
      });

      if (response && response.success) {
        setSuccess(`Marks saved successfully for ${subjectObj.subjectName}.`);
        loadData();
      } else {
        setError(response?.message || "Failed to save marks");
      }
    } catch (err) {
      console.error("Save marks error:", err);
      setError(err.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomSubjectMarks = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!customSubjectName.trim()) {
      setError("Please enter subject name");
      return;
    }

    const internal = Number(customInternal);
    const external = Number(customExternal);

    if (Number.isNaN(internal) || internal < 0 || internal > 40) {
      setError("Internal marks must be between 0 and 40");
      return;
    }

    if (Number.isNaN(external) || external < 0 || external > 60) {
      setError("External marks must be between 0 and 60");
      return;
    }

    try {
      setSaving(true);
      const response = await createMarks({
        studentId: selectedStudentId,
        semester: Number(selectedSemester),
        subject: customSubjectName.trim(),
        internalMarks: internal,
        externalMarks: external,
      });

      if (response && response.success) {
        setSuccess(`Marks saved successfully for ${customSubjectName}.`);
        setCustomSubjectName("");
        setCustomInternal("");
        setCustomExternal("");
        loadData();
      } else {
        setError(response?.message || "Failed to save marks");
      }
    } catch (err) {
      console.error("Save custom marks error:", err);
      setError(err.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMark = async (id, subject) => {
    const confirmDelete = window.confirm(`Delete recorded marks for ${subject}?`);
    if (!confirmDelete) return;

    try {
      const response = await deleteMarks(id);
      if (response && response.success) {
        setSuccess("Marks record deleted successfully.");
        loadData();
      } else {
        setError(response?.message || "Failed to delete marks");
      }
    } catch (err) {
      console.error("Delete mark error:", err);
      setError(err.message || "Failed to delete marks");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Marks</h1>
          <p className="page-description">
            Enter and update student marks semester by semester.
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
                  <th>Max Internal</th>
                  <th>Internal Marks</th>
                  <th>Max External</th>
                  <th>External Marks</th>
                  <th>Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {availableConfiguredSubjects.map((sub) => {
                  const existing = currentSemesterRecordedMarks.find(
                    (m) => m.subject.toLowerCase() === sub.subjectName.toLowerCase()
                  );
                  const currentInput = marksInputs[sub.subjectName] || {};

                  return (
                    <tr key={sub._id || sub.id}>
                      <td>
                        <span className="roll-badge">{sub.subjectCode}</span>
                      </td>
                      <td>
                        <strong>{sub.subjectName}</strong>
                      </td>
                      <td>40</td>
                      <td style={{ width: "130px" }}>
                        {existing ? (
                          <span>{existing.internalMarks}</span>
                        ) : (
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max="40"
                            placeholder="0-40"
                            value={currentInput.internalMarks ?? ""}
                            onChange={(e) =>
                              handleInputChange(sub.subjectName, "internalMarks", e.target.value)
                            }
                          />
                        )}
                      </td>
                      <td>60</td>
                      <td style={{ width: "130px" }}>
                        {existing ? (
                          <span>{existing.externalMarks}</span>
                        ) : (
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max="60"
                            placeholder="0-60"
                            value={currentInput.externalMarks ?? ""}
                            onChange={(e) =>
                              handleInputChange(sub.subjectName, "externalMarks", e.target.value)
                            }
                          />
                        )}
                      </td>
                      <td>
                        {existing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="badge badge-pass">
                              Recorded ({existing.totalMarks}/100 - {existing.grade})
                            </span>
                            <button
                              type="button"
                              className="btn-danger btn-sm"
                              onClick={() => handleDeleteMark(existing._id || existing.id, existing.subject)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            disabled={saving}
                            onClick={() => handleSaveConfiguredSubjectMarks(sub)}
                          >
                            Save Marks
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
              You can configure subjects in{" "}
              <Link to="/subjects" style={{ fontWeight: 600 }}>
                Subject Management
              </Link>{" "}
              or enter custom subject marks below.
            </p>
          </div>
        )}

        {/* Enter Custom Subject Marks */}
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginTop: "16px", marginBottom: "10px" }}>
          Enter Custom Subject Marks
        </h3>
        <form onSubmit={handleSaveCustomSubjectMarks}>
          <div className="form-grid-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="customSubject">Subject Name <span className="req">*</span></label>
              <input
                id="customSubject"
                type="text"
                className="form-control"
                placeholder="e.g. Data Structures"
                value={customSubjectName}
                onChange={(e) => setCustomSubjectName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="customInternal">Internal Marks (Max 40) <span className="req">*</span></label>
              <input
                id="customInternal"
                type="number"
                className="form-control"
                min="0"
                max="40"
                placeholder="0 - 40"
                value={customInternal}
                onChange={(e) => setCustomInternal(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="customExternal">External Marks (Max 60) <span className="req">*</span></label>
              <input
                id="customExternal"
                type="number"
                className="form-control"
                min="0"
                max="60"
                placeholder="0 - 60"
                value={customExternal}
                onChange={(e) => setCustomExternal(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving Marks..." : "Save Marks"}
            </button>
          </div>
        </form>
      </div>

      {/* Recorded Marks for this Student in Selected Semester */}
      <div className="content-card">
        <h2 className="card-title">
          Recorded Marks for {selectedStudent?.fullName} (Semester {selectedSemester})
        </h2>

        {currentSemesterRecordedMarks.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Internal (40)</th>
                  <th>External (60)</th>
                  <th>Total (100)</th>
                  <th>Grade</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSemesterRecordedMarks.map((m) => (
                  <tr key={m._id || m.id}>
                    <td><strong>{m.subject}</strong></td>
                    <td>{m.internalMarks}</td>
                    <td>{m.externalMarks}</td>
                    <td><strong>{m.totalMarks}</strong></td>
                    <td><strong>{m.grade}</strong></td>
                    <td>
                      <span
                        className={`badge ${
                          m.status === "Pass" ? "badge-pass" : "badge-fail"
                        }`}
                      >
                        {m.status === "Pass" ? "PASS" : "FAIL (Backlog)"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteMark(m._id || m.id, m.subject)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Marks Recorded Yet</h3>
            <p>No marks have been recorded for Semester {selectedSemester}. Enter marks using the tables above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marks;