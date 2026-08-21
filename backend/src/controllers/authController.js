const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
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

    // Verify Google ID token
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

    if (!email || !email_verified) {
      return res.status(400).json({
        message: "Google email is not verified",
      });
    }

    // Find existing user
    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    // ==========================================
    // CREATE NEW USER
    // ==========================================

    if (!user) {
      user = await User.create({
        fullName: name || "Google User",

        email: email.toLowerCase(),

        googleId,

        // Google has already verified the email
        emailVerified: true,

        // Phone must be verified separately
        phoneVerified: false,

        // No password for Google account
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
      // Link Google account if necessary
      if (!user.googleId) {
        user.googleId = googleId;
      }

      user.emailVerified = true;

      await user.save();
    }

    // ==========================================
    // CREATE YOUR JWT
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

        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,

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

module.exports = {
  register,
  login,
  googleLogin,
};