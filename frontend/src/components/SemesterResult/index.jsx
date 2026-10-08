import { useEffect, useState, useMemo } from "react";
import { getStudents, getMarks } from "../../services/api";
import "./index.css";

const SemesterResult = () => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsRes, marksRes] = await Promise.all([
        getStudents(),
        getMarks(),
      ]);

      if (studentsRes && studentsRes.success) {
        const studentList = studentsRes.students || [];
        setStudents(studentList);
        if (studentList.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentList[0]._id || studentList[0].id);
        }
      }
      if (marksRes && marksRes.success) {
        setMarks(marksRes.marks || []);
      }
    } catch (err) {
      console.error("Load semester result data error:", err);
      setError(err.message || "Failed to load results data");
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

  const semesterMarks = useMemo(() => {
    if (!selectedStudentId) return [];
    return marks.filter((m) => {
      const matchStudent =
        String(m.studentId?._id || m.studentId) === String(selectedStudentId) ||
        String(m.studentCode) === String(selectedStudent?.studentId);
      const matchSem = String(m.semester) === String(selectedSemester);
      return matchStudent && matchSem;
    });
  }, [marks, selectedStudentId, selectedSemester, selectedStudent]);

  const getGradeBadgeClass = (grade) => {
    const g = String(grade || "").toUpperCase();
    if (g === "O") return "badge-pass";
    if (g === "A+" || g === "A") return "badge-pass";
    if (g === "B+" || g === "B") return "badge-pass";
    if (g === "C") return "badge-warning";
    return "badge-fail";
  };

  // Grade point mapping
  const calculateGradePoint = (grade) => {
    const g = String(grade || "").toUpperCase();
    if (g === "O") return 10;
    if (g === "A+") return 9;
    if (g === "A") return 8;
    if (g === "B+") return 7;
    if (g === "B") return 6;
    if (g === "C") return 5;
    return 0;
  };

  // Calculate CGPA / SGPA
  const semesterCgpa = useMemo(() => {
    if (semesterMarks.length === 0) return 0;
    const totalPoints = semesterMarks.reduce((acc, curr) => {
      const point = curr.gradePoint !== undefined && curr.gradePoint !== null
        ? Number(curr.gradePoint)
        : calculateGradePoint(curr.grade);
      return acc + point;
    }, 0);
    return (totalPoints / semesterMarks.length).toFixed(2);
  }, [semesterMarks]);

  // Semester Result determination: PASSED, NOT CLEARED, IN PROGRESS
  const semesterResultStatus = useMemo(() => {
    if (semesterMarks.length === 0) return "IN PROGRESS";
    const hasFail = semesterMarks.some(
      (m) => m.status === "Fail" || String(m.grade).toUpperCase() === "F"
    );
    return hasFail ? "NOT CLEARED" : "PASSED";
  }, [semesterMarks]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Semester Results</h1>
          <p className="page-description">
            View the result of a student for a selected semester.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Selection Form */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="form-row-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="studentSelect">Select Student *</label>
            <select
              id="studentSelect"
              className="form-control"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.studentId} - {s.fullName} ({s.department || s.course})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="semSelect">Select Semester *</label>
            <select
              id="semSelect"
              className="form-control"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading semester result...
        </div>
      ) : !selectedStudent ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <h3 style={{ fontSize: "16px", color: "#334155", marginBottom: "6px" }}>No Result Found</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Select a student and semester to view the result.
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                {selectedStudent.fullName}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Roll Number: <strong>{selectedStudent.studentId}</strong> &nbsp;|&nbsp; 
                Department: <strong>{selectedStudent.department || "N/A"}</strong> &nbsp;|&nbsp; 
                Course: <strong>{selectedStudent.course || "B.Tech"}</strong>
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: "13px", padding: "6px 14px" }}>
              Semester {selectedSemester}
            </span>
          </div>

          {semesterMarks.length === 0 ? (
            <div style={{ padding: "36px", textAlign: "center" }}>
              <h3 style={{ fontSize: "16px", color: "#334155", marginBottom: "6px" }}>No Result Found</h3>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                No subject marks recorded for Semester {selectedSemester} yet.
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesterMarks.map((m) => (
                      <tr key={m._id || m.id}>
                        <td><strong>{m.subject}</strong></td>
                        <td>{m.totalMarks !== undefined ? `${m.totalMarks} / 100` : `${(m.internalMarks || 0) + (m.externalMarks || 0)} / 100`}</td>
                        <td>
                          <span className={`badge ${getGradeBadgeClass(m.grade)}`}>
                            {m.grade || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              m.status === "Pass" ? "badge-pass" : "badge-fail"
                            }`}
                          >
                            {m.status === "Pass" ? "PASS" : "BACKLOG"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Semester Summary */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px 20px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <span style={{ fontSize: "14px", color: "#475569" }}>Semester CGPA: </span>
                  <strong style={{ fontSize: "16px", color: "#0f172a" }}>{semesterCgpa}</strong>
                </div>

                <div>
                  <span style={{ fontSize: "14px", color: "#475569", marginRight: "8px" }}>Semester Result:</span>
                  <span
                    className={`badge ${
                      semesterResultStatus === "PASSED"
                        ? "badge-pass"
                        : semesterResultStatus === "NOT CLEARED"
                        ? "badge-fail"
                        : "badge-warning"
                    }`}
                    style={{ fontSize: "13px", padding: "6px 14px", fontWeight: "700" }}
                  >
                    {semesterResultStatus}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SemesterResult;