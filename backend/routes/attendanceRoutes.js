const express = require("express");
const {
  createAttendance,
  getAttendance,
  getAttendanceById,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createAttendance);
router.get("/", authenticateToken, getAttendance);
router.get(
  "/student/:studentId/semester/:semester",
  authenticateToken,
  getStudentAttendance
);
router.get("/:id", authenticateToken, getAttendanceById);
router.put("/:id", authenticateToken, updateAttendance);
router.delete("/:id", authenticateToken, deleteAttendance);

module.exports = router;