const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createCourse
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getCourses
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getCourseById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateCourse
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteCourse
);

module.exports = router;