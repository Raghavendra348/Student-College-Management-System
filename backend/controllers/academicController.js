const AcademicRecord = require("../models/AcademicRecord");
const Student = require("../models/Student");

// ==========================================
// CREATE ACADEMIC RECORD
// ==========================================
const createAcademicRecord = async (req, res) => {
  try {
    const { studentId, year, semester, academicYear, status } = req.body;

    if (!studentId || !year || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Student, Year, Semester, and Academic Year are required",
      });
    }

    const userId = req.user?.id || req.user?._id;

    // Verify student exists
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

    // Check duplicate semester record for this student
    const existingRecord = await AcademicRecord.findOne({
      studentId: student._id,
      semester: Number(semester),
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: `Academic record for semester ${semester} already exists for this student`,
      });
    }

    const newRecord = await AcademicRecord.create({
      userId: userId || null,
      studentId: student._id,
      year: Number(year),
      semester: Number(semester),
      academicYear: academicYear.trim(),
      status: status || "Current",
    });

    return res.status(201).json({
      success: true,
      message: "Academic record created successfully",
      record: {
        id: newRecord._id,
        _id: newRecord._id,
        studentId: student._id,
        studentCode: student.studentId,
        fullName: student.fullName,
        year: newRecord.year,
        semester: newRecord.semester,
        academicYear: newRecord.academicYear,
        status: newRecord.status,
      },
    });
  } catch (error) {
    console.error("Create academic record error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating academic record",
    });
  }
};

// ==========================================
// GET ALL ACADEMIC RECORDS
// ==========================================
const getAcademicRecords = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const filter = userId ? { userId } : {};

    const records = await AcademicRecord.find(filter)
      .populate("studentId", "studentId fullName email")
      .sort({ createdAt: -1 });

    const formattedRecords = records.map((record) => {
      const student = record.studentId || {};
      return {
        id: record._id,
        _id: record._id,
        studentId: student._id || record.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        year: record.year,
        semester: record.semester,
        academicYear: record.academicYear,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords,
    });
  } catch (error) {
    console.error("Get academic records error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching academic records",
    });
  }
};

// ==========================================
// GET ACADEMIC RECORD BY ID
// ==========================================
const getAcademicRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await AcademicRecord.findById(id).populate(
      "studentId",
      "studentId fullName email"
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    const student = record.studentId || {};

    return res.status(200).json({
      success: true,
      record: {
        id: record._id,
        _id: record._id,
        studentId: student._id || record.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        year: record.year,
        semester: record.semester,
        academicYear: record.academicYear,
        status: record.status,
      },
    });
  } catch (error) {
    console.error("Get academic record error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching academic record",
    });
  }
};

// ==========================================
// GET ACADEMIC RECORDS BY STUDENT ID
// ==========================================
const getStudentAcademicRecords = async (req, res) => {
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

    const records = await AcademicRecord.find({ studentId: targetStudentId })
      .populate("studentId", "studentId fullName")
      .sort({ semester: 1 });

    const formattedRecords = records.map((record) => {
      const student = record.studentId || {};
      return {
        id: record._id,
        _id: record._id,
        studentId: student._id || record.studentId,
        studentCode: student.studentId || "N/A",
        fullName: student.fullName || "N/A",
        year: record.year,
        semester: record.semester,
        academicYear: record.academicYear,
        status: record.status,
      };
    });

    return res.status(200).json({
      success: true,
      records: formattedRecords,
    });
  } catch (error) {
    console.error("Get student academic records error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching student academic records",
    });
  }
};

// ==========================================
// UPDATE ACADEMIC RECORD
// ==========================================
const updateAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, semester, academicYear, status } = req.body;

    const record = await AcademicRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    if (year !== undefined) record.year = Number(year);
    if (semester !== undefined) record.semester = Number(semester);
    if (academicYear) record.academicYear = academicYear.trim();
    if (status) record.status = status;

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Academic record updated successfully",
      record,
    });
  } catch (error) {
    console.error("Update academic record error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating academic record",
    });
  }
};

// ==========================================
// DELETE ACADEMIC RECORD
// ==========================================
const deleteAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await AcademicRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Academic record deleted successfully",
    });
  } catch (error) {
    console.error("Delete academic record error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting academic record",
    });
  }
};

module.exports = {
  createAcademicRecord,
  getAcademicRecords,
  getAcademicRecordById,
  getStudentAcademicRecords,
  updateAcademicRecord,
  deleteAcademicRecord,
};