const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// ==========================================
// CREATE ATTENDANCE
// ==========================================
const createAttendance = async (req, res) => {
  try {
    const { studentId, semester, subject, totalClasses, attendedClasses } = req.body;

    if (
      studentId === undefined ||
      studentId === null ||
      !semester ||
      !subject ||
      totalClasses === undefined ||
      attendedClasses === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All attendance fields are required",
      });
    }

    const total = Number(totalClasses);
    const attended = Number(attendedClasses);

    if (Number.isNaN(total) || Number.isNaN(attended) || total <= 0 || attended < 0 || attended > total) {
      return res.status(400).json({
        success: false,
        message: "Total classes must be > 0 and attended classes must be between 0 and total classes",
      });
    }

    let student = null;
    if (String(studentId).match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ studentId });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const percentage = Number(((attended / total) * 100).toFixed(2));
    const userId = req.user?.id || req.user?._id;

    const attendance = await Attendance.create({
      userId: userId || null,
      studentId: student._id,
      semester: Number(semester),
      subject: subject.trim(),
      totalClasses: total,
      attendedClasses: attended,
      attendancePercentage: percentage,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      attendance: {
        id: attendance._id,
        _id: attendance._id,
        studentId: student._id,
        studentCode: student.studentId,
        fullName: student.fullName,
        semester: attendance.semester,
        subject: attendance.subject,
        totalClasses: attendance.totalClasses,
        attendedClasses: attendance.attendedClasses,
        attendancePercentage: attendance.attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Create attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while recording attendance",
    });
  }
};

// ==========================================
// GET ALL ATTENDANCE
// ==========================================
const getAttendance = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const filter = userId ? { userId } : {};

    const records = await Attendance.find(filter)
      .populate("studentId", "studentId fullName email")
      .sort({ createdAt: -1 });

    const formatted = records.map((record) => {
      const student = record.studentId || {};
      return {
        id: record._id,
        _id: record._id,
        studentId: student._id || record.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: record.semester,
        subject: record.subject,
        totalClasses: record.totalClasses,
        attendedClasses: record.attendedClasses,
        attendancePercentage: record.attendancePercentage,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      attendance: formatted,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance records",
    });
  }
};

// ==========================================
// GET ATTENDANCE BY ID
// ==========================================
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Attendance.findById(id).populate(
      "studentId",
      "studentId fullName email"
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    const student = record.studentId || {};

    return res.status(200).json({
      success: true,
      attendance: {
        id: record._id,
        _id: record._id,
        studentId: student._id || record.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: record.semester,
        subject: record.subject,
        totalClasses: record.totalClasses,
        attendedClasses: record.attendedClasses,
        attendancePercentage: record.attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance record",
    });
  }
};

// ==========================================
// GET STUDENT ATTENDANCE BY SEMESTER
// ==========================================
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId, semester } = req.params;

    let targetStudentId = studentId;
    if (!String(studentId).match(/^[0-9a-fA-F]{24}$/)) {
      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }
      targetStudentId = student._id;
    }

    const records = await Attendance.find({
      studentId: targetStudentId,
      semester: Number(semester),
    }).populate("studentId", "studentId fullName");

    const formatted = records.map((record) => {
      const student = record.studentId || {};
      return {
        id: record._id,
        _id: record._id,
        studentId: student._id || record.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: record.semester,
        subject: record.subject,
        totalClasses: record.totalClasses,
        attendedClasses: record.attendedClasses,
        attendancePercentage: record.attendancePercentage,
      };
    });

    return res.status(200).json({
      success: true,
      attendance: formatted,
    });
  } catch (error) {
    console.error("Get student attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching student attendance",
    });
  }
};

// ==========================================
// UPDATE ATTENDANCE
// ==========================================
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, subject, totalClasses, attendedClasses } = req.body;

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (semester !== undefined) record.semester = Number(semester);
    if (subject) record.subject = subject.trim();
    if (totalClasses !== undefined) record.totalClasses = Number(totalClasses);
    if (attendedClasses !== undefined) record.attendedClasses = Number(attendedClasses);

    if (
      record.totalClasses <= 0 ||
      record.attendedClasses < 0 ||
      record.attendedClasses > record.totalClasses
    ) {
      return res.status(400).json({
        success: false,
        message: "Total classes must be > 0 and attended classes must be between 0 and total classes",
      });
    }

    record.attendancePercentage = Number(
      ((record.attendedClasses / record.totalClasses) * 100).toFixed(2)
    );

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance: record,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating attendance",
    });
  }
};

// ==========================================
// DELETE ATTENDANCE
// ==========================================
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Attendance.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting attendance",
    });
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  getAttendanceById,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
};