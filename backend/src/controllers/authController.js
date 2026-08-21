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
// CHECK TWILIO ENVIRONMENT VARIABLES
// ==========================================

console.log("========== TWILIO ENV CHECK ==========");

console.log(
  "AccountSID exists:",
  !!process.env.AccountSID
);

console.log(
  "AuthToken exists:",
  !!process.env.AuthToken
);

console.log(
  "TWILIO_PHONE_NUMBER exists:",
  !!process.env.TWILIO_PHONE_NUMBER
);

console.log(
  "TWILIO_PHONE_NUMBER:",
  process.env.TWILIO_PHONE_NUMBER
);

console.log("=======================================");



// ==========================================
// TWILIO
// ==========================================

const twilioClient = twilio(
  process.env.AccountSID,
  process.env.AuthToken
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

// ==========================================
// SEND PHONE OTP
// ==========================================

const sendPhoneOtp = async (req, res) => {
  console.log("\n");
  console.log("==========================================");
  console.log("       SEND PHONE OTP REQUEST");
  console.log("==========================================");

  try {
    // ==========================================
    // 1. CHECK REQUEST BODY
    // ==========================================

    console.log("STEP 1: Request received");

    console.log("Request body:", {
      userId: req.body?.userId,
      phone: req.body?.phone,
    });

    const {
      userId,
      phone,
    } = req.body;

    if (!userId || !phone) {
      console.error(
        "ERROR: userId or phone is missing"
      );

      return res.status(400).json({
        message:
          "User ID and phone number are required",
      });
    }

    // ==========================================
    // 2. VALIDATE PHONE
    // ==========================================

    console.log(
      "STEP 2: Validating phone number"
    );

    console.log(
      "Phone received:",
      phone
    );

    if (!/^\d{10}$/.test(phone)) {
      console.error(
        "ERROR: Invalid phone format"
      );

      return res.status(400).json({
        message:
          "Enter a valid 10-digit phone number",
      });
    }

    console.log(
      "Phone validation successful"
    );

    // ==========================================
    // 3. CHECK TWILIO VARIABLES
    // ==========================================

    console.log(
      "STEP 3: Checking Twilio configuration"
    );

    console.log(
      "AccountSID exists:",
      !!process.env.AccountSID
    );

    console.log(
      "AuthToken exists:",
      !!process.env.AuthToken
    );

    console.log(
      "Twilio phone exists:",
      !!process.env.TWILIO_PHONE_NUMBER
    );

    console.log(
      "Twilio phone:",
      process.env.TWILIO_PHONE_NUMBER
    );

    if (!process.env.AccountSID) {
      console.error(
        "ERROR: AccountSID is missing"
      );

      return res.status(500).json({
        message:
          "Twilio AccountSID is not configured",
      });
    }

    if (!process.env.AuthToken) {
      console.error(
        "ERROR: AuthToken is missing"
      );

      return res.status(500).json({
        message:
          "Twilio AuthToken is not configured",
      });
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error(
        "ERROR: TWILIO_PHONE_NUMBER is missing"
      );

      return res.status(500).json({
        message:
          "Twilio phone number is not configured",
      });
    }

    console.log(
      "Twilio configuration exists"
    );

    // ==========================================
    // 4. FIND USER
    // ==========================================

    console.log(
      "STEP 4: Finding user in MongoDB"
    );

    console.log(
      "User ID:",
      userId
    );

    const user =
      await User.findById(userId);

    if (!user) {
      console.error(
        "ERROR: User not found"
      );

      return res.status(404).json({
        message:
          "User not found",
      });
    }

    console.log(
      "User found:",
      user._id.toString()
    );

    // ==========================================
    // 5. GENERATE OTP
    // ==========================================

    console.log(
      "STEP 5: Generating OTP"
    );

    const otp = crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();

    console.log(
      "OTP generated:",
      otp
    );

    // ==========================================
    // 6. SAVE PHONE + OTP
    // ==========================================

    console.log(
      "STEP 6: Saving OTP to MongoDB"
    );

    user.phone = phone;

    user.phoneOtp = otp;

    user.phoneOtpExpires =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    await user.save();

    console.log(
      "OTP successfully saved to MongoDB"
    );

    // ==========================================
    // 7. FORMAT PHONE NUMBER
    // ==========================================

    console.log(
      "STEP 7: Formatting phone number"
    );

    const formattedPhone =
      `+91${phone}`;

    console.log(
      "Phone sent to Twilio:",
      formattedPhone
    );

    console.log(
      "Twilio FROM number:",
      process.env.TWILIO_PHONE_NUMBER
    );

    // ==========================================
    // 8. CHECK TWILIO CLIENT
    // ==========================================

    console.log(
      "STEP 8: Checking Twilio client"
    );

    console.log(
      "Twilio client exists:",
      !!twilioClient
    );

    if (!twilioClient) {
      console.error(
        "ERROR: Twilio client was not initialized"
      );

      return res.status(500).json({
        message:
          "Twilio client initialization failed",
      });
    }

    console.log(
      "Twilio client initialized"
    );

    // ==========================================
    // 9. SEND SMS
    // ==========================================

    console.log(
      "STEP 9: Sending SMS through Twilio..."
    );

    console.log(
      "FROM:",
      process.env.TWILIO_PHONE_NUMBER
    );

    console.log(
      "TO:",
      formattedPhone
    );

    const twilioMessage =
      await twilioClient.messages.create({
        body:
          `Your EZFINANZ verification OTP is ${otp}. It is valid for 5 minutes.`,

        from:
          process.env.TWILIO_PHONE_NUMBER,

        to:
          formattedPhone,
      });

    // ==========================================
    // 10. TWILIO SUCCESS
    // ==========================================

    console.log(
      "=========================================="
    );

    console.log(
      "        TWILIO SMS SUCCESS"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "Message SID:",
      twilioMessage.sid
    );

    console.log(
      "Message status:",
      twilioMessage.status
    );

    console.log(
      "Message direction:",
      twilioMessage.direction
    );

    console.log(
      "Message price:",
      twilioMessage.price
    );

    console.log(
      "Message error code:",
      twilioMessage.errorCode
    );

    console.log(
      "Message error message:",
      twilioMessage.errorMessage
    );

    console.log(
      "=========================================="
    );

    // ==========================================
    // 11. SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      message:
        "OTP sent successfully",

      // Do NOT return OTP here.
      // OTP must remain server-side.

      messageSid:
        twilioMessage.sid,

      status:
        twilioMessage.status,
    });

  } catch (error) {

    // ==========================================
    // COMPLETE ERROR INFORMATION
    // ==========================================

    console.error("\n");
    console.error(
      "=========================================="
    );

    console.error(
      "          SEND OTP FAILED"
    );

    console.error(
      "=========================================="
    );

    console.error(
      "Error name:",
      error.name
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      "Error code:",
      error.code
    );

    console.error(
      "Error status:",
      error.status
    );

    console.error(
      "Error moreInfo:",
      error.moreInfo
    );

    console.error(
      "Error details:",
      error.details
    );

    console.error(
      "Error stack:",
      error.stack
    );

    console.error(
      "=========================================="
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to send OTP",

      // Temporary debugging information.
      // Remove this after fixing the problem.
      code:
        error.code || null,

      status:
        error.status || null,
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