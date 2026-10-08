const AcademicRecord = require("../models/AcademicRecord");
const Student = require("../models/Student");

// ===============================
// CREATE ACADEMIC RECORD
// ===============================

const createAcademicRecord = async (req, res) => {
  try {
    const {
      studentId,
      year,
      semester,
      academicYear,
    } = req.body;

    if (
      studentId === undefined ||
      year === undefined ||
      semester === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, year and semester are required",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const yearNumber = Number(year);
    const semesterNumber = Number(semester);

    if (
      !Number.isInteger(yearNumber) ||
      yearNumber < 1 ||
      yearNumber > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Year must be between 1 and 4",
      });
    }

    if (
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8",
      });
    }

    const existingRecords =
      await AcademicRecord.findByStudentId(studentId);

    const duplicate = existingRecords.find(
      (record) =>
        Number(record.semester) === semesterNumber
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This semester already exists for this student",
      });
    }

    // Mark previous current record as completed
    const currentRecord =
      await AcademicRecord.findCurrentByStudentId(
        studentId
      );

    if (currentRecord) {
      await AcademicRecord.updateStatus(
        currentRecord.id,
        "Completed"
      );
    }

    const record = await AcademicRecord.create({
      studentId,
      year: yearNumber,
      semester: semesterNumber,
      academicYear,
      status: "Current",
    });

    return res.status(201).json({
      success: true,
      message:
        "Academic record created successfully",
      record,
    });
  } catch (error) {
    console.error(
      "Create academic record error:",
      error
    );

    if (error.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({
        success: false,
        message:
          "Academic record already exists for this semester",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating academic record",
    });
  }
};

// ===============================
// GET ALL
// ===============================

const getAcademicRecords = async (req, res) => {
  try {
    const records =
      await AcademicRecord.findAll();

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error(
      "Get academic records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching academic records",
    });
  }
};

// ===============================
// GET BY STUDENT
// ===============================

const getAcademicRecordsByStudent = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const records =
      await AcademicRecord.findByStudentId(
        studentId
      );

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error(
      "Get student academic records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching student academic records",
    });
  }
};

// ===============================
// GET CURRENT
// ===============================

const getCurrentAcademicRecord = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const record =
      await AcademicRecord.findCurrentByStudentId(
        studentId
      );

    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          "Current academic record not found",
      });
    }

    return res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    console.error(
      "Get current academic record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching current academic record",
    });
  }
};

// ===============================
// UPDATE
// ===============================

const updateAcademicRecord = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      year,
      semester,
      academicYear,
      status,
    } = req.body;

    if (
      year === undefined ||
      semester === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Year and semester are required",
      });
    }

    const existing =
      await AcademicRecord.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message:
          "Academic record not found",
      });
    }

    const updated =
      await AcademicRecord.update(id, {
        year: Number(year),
        semester: Number(semester),
        academicYear,
        status,
      });

    return res.status(200).json({
      success: true,
      message:
        "Academic record updated successfully",
      record: updated,
    });
  } catch (error) {
    console.error(
      "Update academic record error:",
      error
    );

    if (error.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({
        success: false,
        message:
          "This semester already exists for this student",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating academic record",
    });
  }
};

// ===============================
// DELETE
// ===============================

const deleteAcademicRecord = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const existing =
      await AcademicRecord.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message:
          "Academic record not found",
      });
    }

    await AcademicRecord.remove(id);

    return res.status(200).json({
      success: true,
      message:
        "Academic record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete academic record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting academic record",
    });
  }
};

module.exports = {
  createAcademicRecord,
  getAcademicRecords,
  getAcademicRecordsByStudent,
  getCurrentAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
};