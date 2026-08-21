const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const twilio = require("twilio");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// TWILIO
// ==========================================

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
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

        phoneVerified:
          user.phoneVerified === true,

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
        message:
          "Google credential is required",
      });
    }

    // ==========================================
    // VERIFY GOOGLE ID TOKEN
    // ==========================================

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(400).json({
        message:
          "Google email is not verified",
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
        fullName:
          name || "Google User",

        email:
          email.toLowerCase(),

        googleId,

        emailVerified: true,

        phoneVerified: false,

        password: undefined,

        kyc: {
          completed: false,
        },
      });
    }

    // ==========================================
    // EXISTING USER
    // ==========================================

    else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

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
      message:
        "Google login successful",

      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        emailVerified: true,

        phoneVerified:
          user.phoneVerified === true,

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
      message:
        "Google authentication failed",
    });
  }
};

// ==========================================
// SEND PHONE OTP
// ==========================================

const sendPhoneOtp = async (req, res) => {
  try {
    const {
      userId,
      phone,
    } = req.body;

    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    if (!userId || !phone) {
      return res.status(400).json({
        message:
          "User ID and phone number are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message:
          "Enter a valid 10-digit phone number",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // SAVE PHONE NUMBER
    // ==========================================

    user.phone = phone;

    // ==========================================
    // GENERATE OTP
    // ==========================================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    user.phoneOtp = otp;

    user.phoneOtpExpires =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    await user.save();

    // ==========================================
    // FORMAT INDIAN PHONE NUMBER
    // ==========================================

    const formattedPhone =
      `+91${phone}`;

    // ==========================================
    // SEND SMS THROUGH TWILIO
    // ==========================================

    const twilioMessage =
      await twilioClient.messages.create({
        body:
          `Your EZFINANZ verification OTP is ${otp}. It is valid for 5 minutes.`,

        from:
          process.env.TWILIO_PHONE_NUMBER,

        to:
          formattedPhone,
      });

    console.log(
      "OTP SMS sent successfully:",
      twilioMessage.sid
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      message:
        "OTP sent successfully",
    });

  } catch (error) {
    console.error(
      "Send OTP error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to send OTP",
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

    if (!userId || !otp) {
      return res.status(400).json({
        message:
          "User ID and OTP are required",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        message:
          "Phone already verified",
      });
    }

    if (
      !user.phoneOtp ||
      !user.phoneOtpExpires
    ) {
      return res.status(400).json({
        message:
          "Please request a new OTP",
      });
    }

    if (
      new Date() >
      user.phoneOtpExpires
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

    // ==========================================
    // SUCCESS
    // ==========================================

    user.phoneVerified = true;
    user.phoneOtp = null;
    user.phoneOtpExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Phone verified successfully",

      phoneVerified: true,

      kycCompleted:
        user.kyc?.completed === true,
    });

  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      message:
        "OTP verification failed",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  register,
  login,
  googleLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
};