const Subject = require("../models/Subject");

// ==========================================
// CREATE SUBJECT
// ==========================================
const createSubject = async (req, res) => {
  try {
    const {
      subjectName,
      subjectCode,
      name,
      code,
      semester,
      course,
      department,
      maxMarks,
      credits,
    } = req.body;

    const finalName = (subjectName || name || "").trim();
    const finalCode = (subjectCode || code || "").trim();

    if (!finalName || !finalCode || !semester) {
      return res.status(400).json({
        success: false,
        message: "Subject Name, Subject Code, and Semester are required",
      });
    }

    const userId = req.user?.id || req.user?._id;

    const subject = await Subject.create({
      userId: userId || null,
      subjectName: finalName,
      subjectCode: finalCode,
      semester: Number(semester),
      course: course ? course.trim() : "B.Tech",
      department: department ? department.trim() : "Computer Science",
      maxMarks: maxMarks !== undefined ? Number(maxMarks) : 100,
      credits: credits !== undefined ? Number(credits) : 3,
    });

    return res.status(201).json({
      success: true,
      message: "Subject added successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding subject",
    });
  }
};

// ==========================================
// GET ALL SUBJECTS (with filters)
// ==========================================
const getSubjects = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { department, course, semester, search } = req.query;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    if (department && department !== "All") {
      filter.department = department;
    }

    if (course && course !== "All") {
      filter.course = course;
    }

    if (semester && semester !== "All") {
      filter.semester = Number(semester);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { subjectName: searchRegex },
        { subjectCode: searchRegex },
        { department: searchRegex },
        { course: searchRegex },
      ];
    }

    const subjects = await Subject.find(filter).sort({ semester: 1, subjectName: 1 });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error("Get subjects error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subjects",
    });
  }
};

// ==========================================
// GET SUBJECT BY ID
// ==========================================
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      subject,
    });
  } catch (error) {
    console.error("Get subject error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subject",
    });
  }
};

// ==========================================
// UPDATE SUBJECT
// ==========================================
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subjectName,
      subjectCode,
      name,
      code,
      semester,
      course,
      department,
      maxMarks,
      credits,
    } = req.body;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    if (subjectName || name) subject.subjectName = (subjectName || name).trim();
    if (subjectCode || code) subject.subjectCode = (subjectCode || code).trim();
    if (semester !== undefined) subject.semester = Number(semester);
    if (course !== undefined) subject.course = course.trim();
    if (department !== undefined) subject.department = department.trim();
    if (maxMarks !== undefined) subject.maxMarks = Number(maxMarks);
    if (credits !== undefined) subject.credits = Number(credits);

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating subject",
    });
  }
};

// ==========================================
// DELETE SUBJECT
// ==========================================
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting subject",
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
