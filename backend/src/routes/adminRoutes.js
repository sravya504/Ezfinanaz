const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getPendingApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/applications",
  protect,
  authorizeRoles("admin"),
  getPendingApplications
);

router.get(
  "/applications/:applicationId",
  protect,
  authorizeRoles("admin"),
  getApplicationById
);

router.patch(
  "/applications/:applicationId/approve",
  protect,
  authorizeRoles("admin"),
  approveApplication
);

router.patch(
  "/applications/:applicationId/reject",
  protect,
  authorizeRoles("admin"),
  rejectApplication
);

module.exports = router;