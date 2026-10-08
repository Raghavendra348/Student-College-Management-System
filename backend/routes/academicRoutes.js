const express = require("express");
const {
  createAcademicRecord,
  getAcademicRecords,
  getAcademicRecordById,
  getStudentAcademicRecords,
  updateAcademicRecord,
  deleteAcademicRecord,
} = require("../controllers/academicController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createAcademicRecord);
router.get("/", authenticateToken, getAcademicRecords);
router.get("/student/:studentId", authenticateToken, getStudentAcademicRecords);
router.get("/:id", authenticateToken, getAcademicRecordById);
router.put("/:id", authenticateToken, updateAcademicRecord);
router.delete("/:id", authenticateToken, deleteAcademicRecord);

module.exports = router;