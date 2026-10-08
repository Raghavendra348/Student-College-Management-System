const Mark = require("../models/Mark");
const Backlog = require("../models/Backlog");
const Student = require("../models/Student");

// ==========================================
// CREATE MARK
// ==========================================
const createMark = async (req, res) => {
  try {
    const { studentId, semester, subject, internalMarks, externalMarks } = req.body;

    if (
      studentId === undefined ||
      studentId === null ||
      !semester ||
      !subject ||
      internalMarks === undefined ||
      externalMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Student, Semester, Subject, Internal Marks, and External Marks are required",
      });
    }

    const internal = Number(internalMarks);
    const external = Number(externalMarks);

    if (Number.isNaN(internal) || Number.isNaN(external)) {
      return res.status(400).json({
        success: false,
        message: "Marks must be valid numbers",
      });
    }

    if (internal < 0 || internal > 40 || external < 0 || external > 60) {
      return res.status(400).json({
        success: false,
        message: "Internal marks must be 0-40 and External marks must be 0-60",
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

    const totalMarks = internal + external;
    const grade = Mark.calculateGrade(totalMarks);
    const status = totalMarks >= 40 ? "Pass" : "Fail";
    const userId = req.user?.id || req.user?._id;

    // Check duplicate mark record for the same subject & semester
    const existingMark = await Mark.findOne({
      studentId: student._id,
      semester: Number(semester),
      subject: subject.trim(),
    });

    if (existingMark) {
      return res.status(409).json({
        success: false,
        message: `Marks for ${subject} in Semester ${semester} already exist for this student`,
      });
    }

    const mark = await Mark.create({
      userId: userId || null,
      studentId: student._id,
      semester: Number(semester),
      subject: subject.trim(),
      internalMarks: internal,
      externalMarks: external,
      totalMarks,
      grade,
      status,
    });

    // If student failed, automatically record pending backlog
    if (status === "Fail") {
      const existingBacklog = await Backlog.findOne({
        studentId: student._id,
        semester: Number(semester),
        subject: subject.trim(),
        status: "Pending",
      });

      if (!existingBacklog) {
        await Backlog.create({
          userId: userId || null,
          studentId: student._id,
          semester: Number(semester),
          subject: subject.trim(),
          status: "Pending",
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Marks added successfully",
      mark: {
        id: mark._id,
        _id: mark._id,
        studentId: student._id,
        studentCode: student.studentId,
        fullName: student.fullName,
        semester: mark.semester,
        subject: mark.subject,
        internalMarks: mark.internalMarks,
        externalMarks: mark.externalMarks,
        totalMarks: mark.totalMarks,
        grade: mark.grade,
        status: mark.status,
      },
    });
  } catch (error) {
    console.error("Create mark error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating marks",
    });
  }
};

// ==========================================
// GET ALL MARKS
// ==========================================
const getMarks = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const filter = userId ? { userId } : {};

    const marks = await Mark.find(filter)
      .populate("studentId", "studentId fullName email")
      .sort({ createdAt: -1 });

    const formattedMarks = marks.map((mark) => {
      const student = mark.studentId || {};
      return {
        id: mark._id,
        _id: mark._id,
        studentId: student._id || mark.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: mark.semester,
        subject: mark.subject,
        internalMarks: mark.internalMarks,
        externalMarks: mark.externalMarks,
        totalMarks: mark.totalMarks,
        grade: mark.grade,
        status: mark.status,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMarks.length,
      marks: formattedMarks,
    });
  } catch (error) {
    console.error("Get marks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching marks",
    });
  }
};

// ==========================================
// GET MARK BY ID
// ==========================================
const getMarkById = async (req, res) => {
  try {
    const { id } = req.params;

    const mark = await Mark.findById(id).populate(
      "studentId",
      "studentId fullName email"
    );

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Mark record not found",
      });
    }

    const student = mark.studentId || {};

    return res.status(200).json({
      success: true,
      mark: {
        id: mark._id,
        _id: mark._id,
        studentId: student._id || mark.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: mark.semester,
        subject: mark.subject,
        internalMarks: mark.internalMarks,
        externalMarks: mark.externalMarks,
        totalMarks: mark.totalMarks,
        grade: mark.grade,
        status: mark.status,
      },
    });
  } catch (error) {
    console.error("Get mark error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching mark record",
    });
  }
};

// ==========================================
// GET STUDENT MARKS BY SEMESTER
// ==========================================
const getStudentMarks = async (req, res) => {
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

    const marks = await Mark.find({
      studentId: targetStudentId,
      semester: Number(semester),
    }).populate("studentId", "studentId fullName");

    const formattedMarks = marks.map((mark) => {
      const student = mark.studentId || {};
      return {
        id: mark._id,
        _id: mark._id,
        studentId: student._id || mark.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        semester: mark.semester,
        subject: mark.subject,
        internalMarks: mark.internalMarks,
        externalMarks: mark.externalMarks,
        totalMarks: mark.totalMarks,
        grade: mark.grade,
        status: mark.status,
      };
    });

    return res.status(200).json({
      success: true,
      marks: formattedMarks,
    });
  } catch (error) {
    console.error("Get student marks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching student marks",
    });
  }
};

// ==========================================
// UPDATE MARK
// ==========================================
const updateMark = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, subject, internalMarks, externalMarks } = req.body;

    const mark = await Mark.findById(id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Mark record not found",
      });
    }

    if (semester !== undefined) mark.semester = Number(semester);
    if (subject) mark.subject = subject.trim();
    if (internalMarks !== undefined) mark.internalMarks = Number(internalMarks);
    if (externalMarks !== undefined) mark.externalMarks = Number(externalMarks);

    if (
      mark.internalMarks < 0 ||
      mark.internalMarks > 40 ||
      mark.externalMarks < 0 ||
      mark.externalMarks > 60
    ) {
      return res.status(400).json({
        success: false,
        message: "Internal marks must be 0-40 and External marks must be 0-60",
      });
    }

    mark.totalMarks = mark.internalMarks + mark.externalMarks;
    mark.grade = Mark.calculateGrade(mark.totalMarks);
    mark.status = mark.totalMarks >= 40 ? "Pass" : "Fail";

    await mark.save();

    // If updated to Pass, clear any pending backlog for this subject
    if (mark.status === "Pass") {
      await Backlog.findOneAndUpdate(
        {
          studentId: mark.studentId,
          semester: mark.semester,
          subject: mark.subject,
          status: "Pending",
        },
        {
          status: "Cleared",
          clearedMarks: mark.totalMarks,
          clearedSemester: mark.semester,
          clearedAt: new Date(),
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Marks updated successfully",
      mark,
    });
  } catch (error) {
    console.error("Update mark error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating marks",
    });
  }
};

// ==========================================
// DELETE MARK
// ==========================================
const deleteMark = async (req, res) => {
  try {
    const { id } = req.params;

    const mark = await Mark.findByIdAndDelete(id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Mark record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marks deleted successfully",
    });
  } catch (error) {
    console.error("Delete mark error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting marks",
    });
  }
};

module.exports = {
  createMark,
  getMarks,
  getMarkById,
  getStudentMarks,
  updateMark,
  deleteMark,
};