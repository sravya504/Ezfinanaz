const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Email or phone already registered",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,

      // KYC starts as incomplete
      kyc: {
        completed: false,
      },
    });

    res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kycCompleted:
          user.kyc?.completed || false,
      },
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        // =====================================
        // IMPORTANT
        // =====================================

        kycCompleted:
          user.kyc?.completed === true,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};



// ==========================================
// GOOGLE LOGIN / SIGNUP
// ==========================================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    // ==========================================
    // VERIFY GOOGLE ID TOKEN
    // ==========================================

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      email_verified,
    } = payload;

    // Google must confirm the email
    if (!email || !email_verified) {
      return res.status(400).json({
        message: "Google email is not verified",
      });
    }

    // ==========================================
    // FIND EXISTING USER
    // ==========================================

    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    // ==========================================
    // CREATE NEW GOOGLE USER
    // ==========================================

    if (!user) {
      user = await User.create({
        fullName: name || "Google User",

        email: email.toLowerCase(),

        googleId: googleId,

        // Google has verified the email
        emailVerified: true,

        // Phone still needs OTP verification
        phoneVerified: false,

        // Google users don't have a password
        password: undefined,

        // KYC starts incomplete
        kyc: {
          completed: false,
        },
      });
    }

    // ==========================================
    // EXISTING USER
    // ==========================================

    else {
      // Link Google account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      // Google verified this email
      user.emailVerified = true;

      await user.save();
    }

    // ==========================================
    // CREATE JWT
    // ==========================================

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message: "Google login successful",

      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        // Google email verification status
        emailVerified: true,

        // Phone requires separate OTP
        phoneVerified: user.phoneVerified,

        // KYC status
        kycCompleted:
          user.kyc?.completed === true,
      },
    });

  } catch (error) {
    console.error(
      "Google login error:",
      error
    );

    res.status(401).json({
      message: "Google authentication failed",
    });
  }
};


// ==========================================
// SEND PHONE OTP
// ==========================================

const sendPhoneOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    user.phoneOtp = otp;

    // OTP valid for 5 minutes
    user.phoneOtpExpires =
      new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    // TEMPORARY:
    // For testing, show OTP in backend console.
    console.log(
      `PHONE OTP for ${user.phone}: ${otp}`
    );

    res.status(200).json({
      message: "OTP sent successfully",

      // REMOVE THIS IN PRODUCTION
      otp,
    });

  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};


// ==========================================
// VERIFY PHONE OTP
// ==========================================

const verifyPhoneOtp = async (req, res) => {
  try {
    const {
      userId,
      otp,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        message: "Phone already verified",
      });
    }

    if (!user.phoneOtp ||
        !user.phoneOtpExpires) {
      return res.status(400).json({
        message: "Please request a new OTP",
      });
    }

    if (
      new Date() > user.phoneOtpExpires
    ) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (user.phoneOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // SUCCESS
    user.phoneVerified = true;
    user.phoneOtp = null;
    user.phoneOtpExpires = null;

    await user.save();

    res.status(200).json({
  message: "Phone verified successfully",
  phoneVerified: true,
  kycCompleted: user.kyc?.completed === true,
});

  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
};