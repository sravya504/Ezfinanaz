const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  disburseLoan,
} = require("../controllers/disbursementController");

const router = express.Router();

router.patch(
  "/applications/:applicationId/disburse",
  protect,
  authorizeRoles("admin"),
  disburseLoan
);

module.exports = router;