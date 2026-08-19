const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createApplication,
  checkEligibility,
  calculateEMI,
   addBankAccount,
   submitDeclaration,
   uploadSelfie,
    getMyApplication,
} = require("../controllers/loanController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createApplication
);

router.post(
  "/:applicationId/eligibility",
  protect,
  authorizeRoles("customer"),
  checkEligibility
);


router.post(
  "/:applicationId/emi",
  protect,
  authorizeRoles("customer"),
  calculateEMI
);


router.post(
  "/:applicationId/bank-account",
  protect,
  authorizeRoles("customer"),
  addBankAccount
);


router.post(
  "/:applicationId/declaration",
  protect,
  authorizeRoles("customer"),
  submitDeclaration
);


router.post(
  "/:applicationId/selfie",
  protect,
  authorizeRoles("customer"),
  upload.single("selfie"),
  uploadSelfie
);

router.get(
  "/my-application",
  protect,
  getMyApplication
);

module.exports = router;