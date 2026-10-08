const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Mark");
const Backlog = require("../models/Backlog");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const filter = userId ? { userId } : {};

    const [
      totalStudents,
      currentlyStudying,
      graduated,
      discontinued,
      totalAcademicRecords,
      totalAttendanceRecords,
      totalMarksRecords,
      totalBacklogs,
      pendingBacklogs,
      clearedBacklogs,
      recentStudents,
    ] = await Promise.all([
      Student.countDocuments(filter),
      Student.countDocuments({ ...filter, status: "Studying" }),
      Student.countDocuments({ ...filter, status: "Graduated" }),
      Student.countDocuments({ ...filter, status: "Discontinued" }),
      AcademicRecord.countDocuments(filter),
      Attendance.countDocuments(filter),
      Mark.countDocuments(filter),
      Backlog.countDocuments(filter),
      Backlog.countDocuments({ ...filter, status: "Pending" }),
      Backlog.countDocuments({ ...filter, status: "Cleared" }),
      Student.find(filter).sort({ createdAt: -1 }).limit(5),
    ]);

    const stats = {
      totalStudents,
      currentlyStudying,
      studyingStudents: currentlyStudying,
      graduated,
      graduatedStudents: graduated,
      discontinued,
      totalAcademicRecords,
      totalAttendanceRecords,
      totalMarksRecords,
      totalBacklogs,
      pendingBacklogs,
      clearedBacklogs,
    };

    return res.status(200).json({
      success: true,
      stats,
      recentStudents,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};