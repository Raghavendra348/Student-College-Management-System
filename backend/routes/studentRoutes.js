const express = require("express");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  createStudent
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getStudents
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getStudentById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  updateStudent
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteStudent
);

module.exports = router;