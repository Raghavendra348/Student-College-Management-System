const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const User = require("../models/User");
const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Mark");
const Backlog = require("../models/Backlog");

const migrateFromSQLite = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("MongoDB already populated, skipping SQLite migration.");
      return;
    }

    const dbPath = path.join(__dirname, "college.db");
    const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.log("SQLite database not found or cannot be read, skipping migration.");
      }
    });

    const getRows = (query) => {
      return new Promise((resolve) => {
        sqliteDb.all(query, [], (err, rows) => {
          if (err) resolve([]);
          else resolve(rows || []);
        });
      });
    };

    console.log("Checking SQLite data for initial migration...");
    const sqliteUsers = await getRows("SELECT * FROM users");
    const sqliteStudents = await getRows("SELECT * FROM students");
    const sqliteAcademic = await getRows("SELECT * FROM academic_records");
    const sqliteAttendance = await getRows("SELECT * FROM attendance");
    const sqliteMarks = await getRows("SELECT * FROM marks");
    const sqliteBacklogs = await getRows("SELECT * FROM backlogs");

    if (sqliteUsers.length === 0) {
      console.log("No SQLite users to migrate.");
      sqliteDb.close();
      return;
    }

    const userIdMap = {}; // sqlite user id -> mongo user _id
    for (const u of sqliteUsers) {
      const newUser = await User.create({
        collegeName: u.collegeName || "College",
        email: u.email.toLowerCase().trim(),
        principalName: u.principalName || "",
        contactNumber: u.phone || u.contactNumber || "",
        password: u.password,
        role: u.role || "admin",
      });
      userIdMap[u.id] = newUser._id;
    }

    const defaultUserId = Object.values(userIdMap)[0];
    const studentIdMap = {}; // sqlite student id -> mongo student _id

    for (const s of sqliteStudents) {
      const newStudent = await Student.create({
        userId: defaultUserId,
        studentId: s.studentId || "STU001",
        fullName: s.fullName || "Student",
        email: (s.email || "student@example.com").toLowerCase().trim(),
        phone: s.phone || "0000000000",
        gender: s.gender || "Male",
        dateOfBirth: s.dateOfBirth || "",
        department: "Computer Science",
        course: "B.Tech",
        admissionYear: 2024,
        status: "Studying",
      });
      studentIdMap[s.id] = newStudent._id;
    }

    for (const a of sqliteAcademic) {
      const mappedStudentId = studentIdMap[a.studentId];
      if (mappedStudentId) {
        await AcademicRecord.create({
          userId: defaultUserId,
          studentId: mappedStudentId,
          year: a.year || 1,
          semester: a.semester || 1,
          academicYear: a.academicYear || "2024-2025",
          status: a.status || "Current",
        });
      }
    }

    for (const att of sqliteAttendance) {
      const mappedStudentId = studentIdMap[att.studentId];
      if (mappedStudentId) {
        await Attendance.create({
          userId: defaultUserId,
          studentId: mappedStudentId,
          semester: att.semester || 1,
          subject: att.subject,
          totalClasses: att.totalClasses || 0,
          attendedClasses: att.attendedClasses || 0,
          attendancePercentage: att.attendancePercentage || 0,
        });
      }
    }

    for (const m of sqliteMarks) {
      const mappedStudentId = studentIdMap[m.studentId];
      if (mappedStudentId) {
        await Mark.create({
          userId: defaultUserId,
          studentId: mappedStudentId,
          semester: m.semester || 1,
          subject: m.subject,
          internalMarks: m.internalMarks || 0,
          externalMarks: m.externalMarks || 0,
          totalMarks: m.totalMarks || 0,
          grade: m.grade || "F",
          status: m.status || (m.totalMarks >= 40 ? "Pass" : "Fail"),
        });
      }
    }

    for (const b of sqliteBacklogs) {
      const mappedStudentId = studentIdMap[b.studentId];
      if (mappedStudentId) {
        await Backlog.create({
          userId: defaultUserId,
          studentId: mappedStudentId,
          semester: b.semester || 1,
          subject: b.subject,
          status: b.status || "Pending",
        });
      }
    }

    console.log("Initial SQLite to MongoDB migration completed successfully.");
    sqliteDb.close();
  } catch (err) {
    console.error("Migration error:", err.message);
  }
};

module.exports = migrateFromSQLite;
