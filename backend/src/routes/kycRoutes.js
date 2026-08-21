const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  submitKYC,
  getKYC,
} = require("../controllers/kycController");

const router = express.Router();

router.get(
  "/",
  protect,
  getKYC
);

router.post(
  "/",
  protect,
  submitKYC
);

module.exports = router;