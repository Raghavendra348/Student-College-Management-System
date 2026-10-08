const express = require("express");
const {
  createMark,
  getMarks,
  getMarkById,
  getStudentMarks,
  updateMark,
  deleteMark,
} = require("../controllers/marksController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createMark);
router.get("/", authenticateToken, getMarks);
router.get(
  "/student/:studentId/semester/:semester",
  authenticateToken,
  getStudentMarks
);
router.get("/:id", authenticateToken, getMarkById);
router.put("/:id", authenticateToken, updateMark);
router.delete("/:id", authenticateToken, deleteMark);

module.exports = router;