const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createDepartment
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getDepartments
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  getDepartmentById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateDepartment
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteDepartment
);

module.exports = router;