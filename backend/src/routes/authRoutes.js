const express = require("express");

const {
  register,
  login,
  googleLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/send-phone-otp", sendPhoneOtp);

router.post("/verify-phone-otp", verifyPhoneOtp);

module.exports = router;