const express = require("express");

const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createSubject
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getSubjects
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getSubjectById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateSubject
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteSubject
);

module.exports = router;
