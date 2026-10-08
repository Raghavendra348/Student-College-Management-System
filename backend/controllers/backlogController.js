const Backlog = require("../models/Backlog");
const Student = require("../models/Student");
const Mark = require("../models/Mark");

// ==========================================
// GET ALL BACKLOGS
// ==========================================
const getBacklogs = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const filter = userId ? { userId } : {};

    const backlogs = await Backlog.find(filter)
      .populate("studentId", "studentId fullName email")
      .sort({ createdAt: -1 });

    const formatted = backlogs.map((b) => {
      const student = b.studentId || {};
      return {
        id: b._id,
        _id: b._id,
        studentId: student._id || b.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: b.semester,
        subject: b.subject,
        status: b.status,
        clearedMarks: b.clearedMarks,
        clearedSemester: b.clearedSemester,
        clearedAt: b.clearedAt,
        createdAt: b.createdAt,
      };
    });

    const total = formatted.length;
    const pending = formatted.filter(
      (item) => String(item.status).toLowerCase() === "pending"
    ).length;
    const cleared = formatted.filter(
      (item) => String(item.status).toLowerCase() === "cleared"
    ).length;

    return res.status(200).json({
      success: true,
      data: formatted,
      backlogs: formatted,
      stats: {
        total,
        pending,
        cleared,
      },
    });
  } catch (error) {
    console.error("Get backlogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching backlogs",
    });
  }
};

// ==========================================
// GET BACKLOGS BY STUDENT
// ==========================================
const getBacklogsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

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

    const backlogs = await Backlog.find({ studentId: targetStudentId })
      .populate("studentId", "studentId fullName")
      .sort({ semester: 1 });

    const formatted = backlogs.map((b) => {
      const student = b.studentId || {};
      return {
        id: b._id,
        _id: b._id,
        studentId: student._id || b.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: b.semester,
        subject: b.subject,
        status: b.status,
        clearedMarks: b.clearedMarks,
        clearedSemester: b.clearedSemester,
        clearedAt: b.clearedAt,
        createdAt: b.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
      backlogs: formatted,
    });
  } catch (error) {
    console.error("Get backlogs by student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching backlogs by student",
    });
  }
};

// ==========================================
// CREATE BACKLOG
// ==========================================
const createBacklog = async (req, res) => {
  try {
    const { studentId, semester, subject, status } = req.body;

    if (!studentId || !semester || !subject) {
      return res.status(400).json({
        success: false,
        message: "Student, Semester, and Subject are required",
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

    const userId = req.user?.id || req.user?._id;

    const backlog = await Backlog.create({
      userId: userId || null,
      studentId: student._id,
      semester: Number(semester),
      subject: subject.trim(),
      status: status || "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Backlog created successfully",
      backlog: {
        id: backlog._id,
        _id: backlog._id,
        studentId: student._id,
        studentCode: student.studentId,
        fullName: student.fullName,
        semester: backlog.semester,
        subject: backlog.subject,
        status: backlog.status,
      },
    });
  } catch (error) {
    console.error("Create backlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating backlog",
    });
  }
};

// ==========================================
// UPDATE BACKLOG
// ==========================================
const updateBacklog = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, subject, status, clearedMarks, clearedSemester } = req.body;

    const backlog = await Backlog.findById(id);

    if (!backlog) {
      return res.status(404).json({
        success: false,
        message: "Backlog not found",
      });
    }

    if (semester !== undefined) backlog.semester = Number(semester);
    if (subject) backlog.subject = subject.trim();
    if (status) backlog.status = status;
    if (clearedMarks !== undefined) backlog.clearedMarks = Number(clearedMarks);
    if (clearedSemester !== undefined) backlog.clearedSemester = Number(clearedSemester);

    if (status === "Cleared" && !backlog.clearedAt) {
      backlog.clearedAt = new Date();
    }

    await backlog.save();

    return res.status(200).json({
      success: true,
      message: "Backlog updated successfully",
      backlog,
    });
  } catch (error) {
    console.error("Update backlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating backlog",
    });
  }
};

// ==========================================
// CLEAR BACKLOG
// ==========================================
const clearBacklog = async (req, res) => {
  try {
    const { id } = req.params;
    const { cleared_marks, cleared_semester, clearedMarks, clearedSemester } = req.body;

    const marks = clearedMarks ?? cleared_marks;
    const sem = clearedSemester ?? cleared_semester;

    const backlog = await Backlog.findById(id);

    if (!backlog) {
      return res.status(404).json({
        success: false,
        message: "Backlog not found",
      });
    }

    backlog.status = "Cleared";
    backlog.clearedMarks = marks !== undefined && marks !== "" ? Number(marks) : null;
    backlog.clearedSemester = sem !== undefined && sem !== "" ? Number(sem) : backlog.semester;
    backlog.clearedAt = new Date();

    await backlog.save();

    // Update corresponding Mark record to Pass
    if (marks !== undefined && marks !== "" && Number(marks) >= 40) {
      const markRecord = await Mark.findOne({
        studentId: backlog.studentId,
        semester: backlog.semester,
        subject: backlog.subject,
      });
      if (markRecord) {
        const numMarks = Number(marks);
        markRecord.totalMarks = numMarks;
        markRecord.externalMarks = Math.max(0, numMarks - (markRecord.internalMarks || 0));
        markRecord.grade = Mark.calculateGrade(numMarks);
        markRecord.status = "Pass";
        await markRecord.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Backlog cleared successfully",
      backlog,
    });
  } catch (error) {
    console.error("Clear backlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while clearing backlog",
    });
  }
};

// ==========================================
// DELETE BACKLOG
// ==========================================
const deleteBacklog = async (req, res) => {
  try {
    const { id } = req.params;

    const backlog = await Backlog.findByIdAndDelete(id);

    if (!backlog) {
      return res.status(404).json({
        success: false,
        message: "Backlog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Backlog deleted successfully",
    });
  } catch (error) {
    console.error("Delete backlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting backlog",
    });
  }
};

module.exports = {
  getBacklogs,
  getBacklogsByStudent,
  createBacklog,
  updateBacklog,
  clearBacklog,
  deleteBacklog,
};