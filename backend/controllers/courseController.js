const Course = require("../models/Course");

const createCourse = async (req, res) => {
  try {
    const { name, code, departmentId, duration, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Course name and course code are required",
      });
    }

    const userId = req.user?.id || req.user?._id;

    const course = await Course.create({
      userId: userId || null,
      name: name.trim(),
      code: code.trim(),
      departmentId: departmentId || null,
      duration: duration || "4 Years",
      description: description ? description.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating course",
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const filter = userId ? { userId } : {};

    const courses = await Course.find(filter)
      .populate("departmentId", "name")
      .sort({ name: 1 });

    const formatted = courses.map((c) => ({
      id: c._id,
      _id: c._id,
      name: c.name,
      code: c.code,
      departmentId: c.departmentId?._id || c.departmentId,
      departmentName: c.departmentId?.name || "N/A",
      duration: c.duration,
      description: c.description,
      createdAt: c.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      courses: formatted,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate("departmentId", "name");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course: {
        id: course._id,
        _id: course._id,
        name: course.name,
        code: course.code,
        departmentId: course.departmentId?._id || course.departmentId,
        departmentName: course.departmentId?.name || "N/A",
        duration: course.duration,
        description: course.description,
        createdAt: course.createdAt,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching course",
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, departmentId, duration, description } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (name) course.name = name.trim();
    if (code) course.code = code.trim();
    if (departmentId !== undefined) course.departmentId = departmentId || null;
    if (duration !== undefined) course.duration = duration;
    if (description !== undefined) course.description = description.trim();

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating course",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting course",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};