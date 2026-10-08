import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudentById } from "../../services/api";
import { getBranchSemesterSubjects } from "../../services/curriculum";
import "./index.css";

const StudentDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSemesters, setExpandedSemesters] = useState({ 1: true });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudentById(id);
      if (response && response.success) {
        setData(response);
      } else {
        setError(response?.message || "Student details not found");
      }
    } catch (err) {
      console.error("Fetch student details error:", err);
      setError(err.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const student = data?.student;
  const marks = data?.marks || [];
  const attendance = data?.attendance || [];

  const toggleSemester = (sem) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [sem]: !prev[sem],
    }));
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

  // Group marks and attendance by semester
  const semesterData = useMemo(() => {
    const sems = [1, 2, 3, 4, 5, 6, 7, 8];
    const grouped = {};

    sems.forEach((sem) => {
      const semMarks = marks.filter((m) => Number(m.semester) === sem);
      const semAttendance = attendance.filter((a) => Number(a.semester) === sem);

      // Semester calculation
      let totalEarned = 0;
      let totalMax = semMarks.length * 100;
      let hasFail = false;

      semMarks.forEach((m) => {
        totalEarned += Number(m.totalMarks || 0);
        if (m.status === "Fail") hasFail = true;
      });

      let semesterResult = "IN PROGRESS";
      let cgpa = "-";

      if (semMarks.length > 0) {
        if (hasFail) {
          semesterResult = "NOT CLEARED";
        } else {
          semesterResult = "PASSED";
        }
        // Calculate CGPA out of 10
        const percentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
        cgpa = (percentage / 9.5).toFixed(2);
      }

      grouped[sem] = {
        marks: semMarks,
        attendance: semAttendance,
        semesterResult,
        cgpa,
      };
    });

    return grouped;
  }, [marks, attendance]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-box">Loading student details...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error || "Student not found"}</div>
        <Link to="/students" className="btn-secondary" style={{ width: "fit-content" }}>
          &larr; Back to Students List
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Details</h1>
          <p className="page-description">Complete academic journey for {student.fullName}</p>
        </div>

        <Link to="/students" className="btn-secondary">
          &larr; Back to Students
        </Link>
      </div>

      {/* Student Information Card */}
      <div className="content-card">
        <h2 className="card-title">Student Information</h2>
        <div className="student-info-grid">
          <div className="info-item">
            <span className="info-label">Full Name:</span>
            <span className="info-value">{student.fullName}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Roll Number / Student ID:</span>
            <span className="info-value">
              <span className="roll-badge">{student.studentId}</span>
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Email Address:</span>
            <span className="info-value">{student.email}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Contact Phone:</span>
            <span className="info-value">{student.phone}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Department:</span>
            <span className="info-value">{student.department || "Computer Science"}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Course / Degree:</span>
            <span className="info-value">{student.course || "B.Tech"}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Admission Year:</span>
            <span className="info-value">{student.admissionYear || "N/A"}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Gender:</span>
            <span className="info-value">{student.gender || "Male"}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Date of Birth:</span>
            <span className="info-value">{student.dateOfBirth || "N/A"}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Enrollment Status:</span>
            <span className="info-value">
              <span className={getStatusBadge(student.status)}>
                {formatStatus(student.status)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Semester Details (1 to 8 expandable/collapsible) */}
      <div className="content-card">
        <h2 className="card-title">Semester Details</h2>

        <div className="semesters-accordion">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const semInfo = semesterData[sem] || { marks: [], attendance: [], semesterResult: "IN PROGRESS", cgpa: "-" };
            const isExpanded = !!expandedSemesters[sem];

            return (
              <div key={sem} className="semester-accordion-item">
                <button
                  type="button"
                  className="semester-accordion-header"
                  onClick={() => toggleSemester(sem)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--primary-navy)" }}>
                      Semester {sem}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      ({semInfo.marks.length} Subjects)
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {semInfo.marks.length > 0 && (
                      <span
                        className={`badge ${
                          semInfo.semesterResult === "PASSED"
                            ? "badge-pass"
                            : semInfo.semesterResult === "NOT CLEARED"
                            ? "badge-fail"
                            : "badge-pending"
                        }`}
                      >
                        {semInfo.semesterResult}
                      </span>
                    )}
                    <span style={{ fontSize: "14px" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="semester-accordion-content">
                    {semInfo.marks.length > 0 ? (
                      <>
                        <div className="table-container" style={{ marginBottom: "14px" }}>
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
                              {semInfo.marks.map((m) => (
                                <tr key={m._id || m.id}>
                                  <td><strong>{m.subject}</strong></td>
                                  <td>{m.totalMarks} / 100</td>
                                  <td><strong>{m.grade}</strong></td>
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

                        {semInfo.attendance.length > 0 && (
                          <div style={{ marginBottom: "14px" }}>
                            <h4 style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "6px" }}>
                              Subject Attendance:
                            </h4>
                            <div className="table-container">
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>Subject</th>
                                    <th>Conducted</th>
                                    <th>Attended</th>
                                    <th>Percentage</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {semInfo.attendance.map((a) => (
                                    <tr key={a._id || a.id}>
                                      <td>{a.subject}</td>
                                      <td>{a.totalClasses}</td>
                                      <td>{a.attendedClasses}</td>
                                      <td><strong>{a.attendancePercentage}%</strong></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        <div className="semester-summary-bar">
                          <div>
                            Semester CGPA: <strong>{semInfo.cgpa}</strong>
                          </div>
                          <div>
                            Semester Result:{" "}
                            <strong
                              style={{
                                color:
                                  semInfo.semesterResult === "PASSED"
                                    ? "var(--success-color)"
                                    : semInfo.semesterResult === "NOT CLEARED"
                                    ? "var(--danger-color)"
                                    : "var(--warning-color)",
                              }}
                            >
                              {semInfo.semesterResult}
                            </strong>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: "14px" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "10px" }}>
                          No examination marks recorded yet for Semester {sem}.
                        </p>
                        <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          <strong style={{ fontSize: "12.5px", color: "#334155" }}>
                            {student.department || "Branch"} Semester {sem} Subjects:
                          </strong>
                          <ul style={{ margin: "6px 0 0 18px", fontSize: "13px", color: "#475569" }}>
                            {getBranchSemesterSubjects(student.department, sem).map((sub) => (
                              <li key={sub.subjectCode} style={{ marginBottom: "4px" }}>
                                <span className="roll-badge" style={{ marginRight: "6px" }}>{sub.subjectCode}</span>
                                {sub.subjectName} ({sub.credits} Credits)
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
