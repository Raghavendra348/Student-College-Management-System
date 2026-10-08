const express = require("express");
const {
  getBacklogs,
  getBacklogsByStudent,
  createBacklog,
  updateBacklog,
  deleteBacklog,
  clearBacklog,
} = require("../controllers/backlogController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getBacklogs);
router.get("/student/:studentId", authenticateToken, getBacklogsByStudent);
router.post("/", authenticateToken, createBacklog);
router.put("/:id", authenticateToken, updateBacklog);
router.put("/:id/clear", authenticateToken, clearBacklog);
router.delete("/:id", authenticateToken, deleteBacklog);

module.exports = router;