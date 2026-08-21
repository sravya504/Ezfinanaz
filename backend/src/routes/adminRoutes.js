const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAllApplications,
  getPendingApplications,
  getApplicationById,
  approveSelfie,
  rejectSelfie,
  approveApplication,
  rejectApplication,
} = require("../controllers/adminController");

const router = express.Router();

// =====================================================
// ALL APPLICATIONS
// =====================================================

router.get(
  "/applications",
  protect,
  authorizeRoles("admin"),
  getAllApplications
);

// =====================================================
// PENDING APPLICATIONS
// =====================================================

router.get(
  "/applications/pending",
  protect,
  authorizeRoles("admin"),
  getPendingApplications
);

// =====================================================
// SINGLE APPLICATION
// =====================================================

router.get(
  "/applications/:applicationId",
  protect,
  authorizeRoles("admin"),
  getApplicationById
);

// =====================================================
// SELFIE APPROVAL
// =====================================================

router.patch(
  "/applications/:applicationId/selfie/approve",
  protect,
  authorizeRoles("admin"),
  approveSelfie
);

// =====================================================
// SELFIE REJECTION
// =====================================================

router.patch(
  "/applications/:applicationId/selfie/reject",
  protect,
  authorizeRoles("admin"),
  rejectSelfie
);

// =====================================================
// FINAL APPLICATION APPROVAL
// =====================================================

router.patch(
  "/applications/:applicationId/approve",
  protect,
  authorizeRoles("admin"),
  approveApplication
);

// =====================================================
// FINAL APPLICATION REJECTION
// =====================================================

router.patch(
  "/applications/:applicationId/reject",
  protect,
  authorizeRoles("admin"),
  rejectApplication
);

module.exports = router;