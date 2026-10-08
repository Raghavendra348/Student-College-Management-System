const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const Mark = require("../models/Mark");
const Attendance = require("../models/Attendance");
const Backlog = require("../models/Backlog");

// ==========================================
// CREATE STUDENT
// ==========================================
const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      rollNumber,
      fullName,
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      department,
      course,
      admissionYear,
      status,
    } = req.body;

    const finalStudentId = (studentId || rollNumber || "").trim();
    const finalFullName = (fullName || name || "").trim();
    const finalEmail = (email || "").trim().toLowerCase();
    const finalPhone = (phone || "").trim();

    if (!finalStudentId || !finalFullName || !finalEmail || !finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Roll Number / Student ID, Name, Email, and Phone are required",
      });
    }

    const userId = req.user?.id || req.user?._id;

    // Check duplicate student within the college
    const query = {
      $or: [{ studentId: finalStudentId }, { email: finalEmail }],
    };
    if (userId) {
      query.userId = userId;
    }

    const existingStudent = await Student.findOne(query);
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "A student with this Roll Number or Email already exists",
      });
    }

    const student = await Student.create({
      userId: userId || null,
      studentId: finalStudentId,
      fullName: finalFullName,
      email: finalEmail,
      phone: finalPhone,
      gender: gender || "Male",
      dateOfBirth: dateOfBirth || "",
      department: department ? department.trim() : "Computer Science",
      course: course ? course.trim() : "B.Tech",
      admissionYear: admissionYear || new Date().getFullYear(),
      status: status || "Studying",
    });

    return res.status(201).json({
      success: true,
      message: "Student added successfully",
      student,
    });
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating student",
    });
  }
};

// ==========================================
// GET ALL STUDENTS
// ==========================================
const getStudents = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { status, search } = req.query;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { studentId: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { course: searchRegex },
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching students",
    });
  }
};

// ==========================================
// GET STUDENT BY ID
// ==========================================
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    let student = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Retrieve related academic records, marks, attendance, backlogs
    const [academicRecords, marks, attendance, backlogs] = await Promise.all([
      AcademicRecord.find({ studentId: student._id }).sort({ semester: 1 }),
      Mark.find({ studentId: student._id }).sort({ semester: 1 }),
      Attendance.find({ studentId: student._id }).sort({ semester: 1 }),
      Backlog.find({ studentId: student._id }).sort({ semester: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      student,
      academicRecords,
      marks,
      attendance,
      backlogs,
    });
  } catch (error) {
    console.error("Get student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching student details",
    });
  }
};

// ==========================================
// UPDATE STUDENT
// ==========================================
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId,
      rollNumber,
      fullName,
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      department,
      course,
      admissionYear,
      status,
    } = req.body;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (studentId || rollNumber) student.studentId = (studentId || rollNumber).trim();
    if (fullName || name) student.fullName = (fullName || name).trim();
    if (email) student.email = email.trim().toLowerCase();
    if (phone) student.phone = phone.trim();
    if (gender) student.gender = gender;
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (department !== undefined) student.department = department.trim();
    if (course !== undefined) student.course = course.trim();
    if (admissionYear !== undefined) student.admissionYear = Number(admissionYear);
    if (status) student.status = status;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating student",
    });
  }
};

// ==========================================
// DELETE STUDENT
// ==========================================
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Also remove associated records
    await Promise.all([
      AcademicRecord.deleteMany({ studentId: student._id }),
      Mark.deleteMany({ studentId: student._id }),
      Attendance.deleteMany({ studentId: student._id }),
      Backlog.deleteMany({ studentId: student._id }),
      Student.findByIdAndDelete(id),
    ]);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting student",
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};