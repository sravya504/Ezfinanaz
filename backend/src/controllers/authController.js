// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { OAuth2Client } = require("google-auth-library");
// const crypto = require("crypto");
// const twilio = require("twilio");

// const googleClient = new OAuth2Client(
//   process.env.GOOGLE_CLIENT_ID
// );



// const twilioClient = twilio(
//   process.env.AccountSID,
//   process.env.AuthToken
// );


// const register = async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       phone,
//       password,
//     } = req.body;

//     if (
//       !fullName ||
//       !email ||
//       !phone ||
//       !password
//     ) {
//       return res.status(400).json({
//         message: "All fields are required",
//       });
//     }

//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         message:
//           "Email or phone already registered",
//       });
//     }

//     const hashedPassword =
//       await bcrypt.hash(password, 12);

//     const user = await User.create({
//       fullName,
//       email,
//       phone,
//       password: hashedPassword,

//       kyc: {
//         completed: false,
//       },
//     });

//     res.status(201).json({
//       message: "Registration successful",

//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,

//         kycCompleted:
//           user.kyc?.completed || false,
//       },
//     });

//   } catch (error) {
//     console.error(
//       "Registration error:",
//       error
//     );

//     res.status(500).json({
//       message: "Server error",
//     });
//   }
// };



// const login = async (req, res) => {
//   try {
//     const {
//       email,
//       password,
//     } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message:
//           "Email and password are required",
//       });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase(),
//     });

//     if (!user) {
//       return res.status(401).json({
//         message:
//           "Invalid email or password",
//       });
//     }

//     const passwordMatch =
//       await bcrypt.compare(
//         password,
//         user.password
//       );

//     if (!passwordMatch) {
//       return res.status(401).json({
//         message:
//           "Invalid email or password",
//       });
//     }

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     res.status(200).json({
//       message: "Login successful",

//       token,

//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,

//         phoneVerified:
//           user.phoneVerified === true,

//         kycCompleted:
//           user.kyc?.completed === true,
//       },
//     });

//   } catch (error) {
//     console.error(
//       "Login error:",
//       error
//     );

//     res.status(500).json({
//       message: "Server error",
//     });
//   }
// };



// const googleLogin = async (req, res) => {
//   try {
//     const { credential } = req.body;

//     if (!credential) {
//       return res.status(400).json({
//         message:
//           "Google credential is required",
//       });
//     }

    

//     const ticket =
//       await googleClient.verifyIdToken({
//         idToken: credential,
//         audience:
//           process.env.GOOGLE_CLIENT_ID,
//       });

//     const payload =
//       ticket.getPayload();

//     const {
//       sub: googleId,
//       email,
//       name,
//       email_verified,
//     } = payload;

//     if (!email || !email_verified) {
//       return res.status(400).json({
//         message:
//           "Google email is not verified",
//       });
//     }

 
//     let user = await User.findOne({
//       email: email.toLowerCase(),
//     });

    

//     if (!user) {
//       user = await User.create({
//         fullName:
//           name || "Google User",

//         email:
//           email.toLowerCase(),

//         googleId,

//         emailVerified: true,

//         phoneVerified: false,

//         password: undefined,

//         kyc: {
//           completed: false,
//         },
//       });
//     }

  

//     else {
//       if (!user.googleId) {
//         user.googleId = googleId;
//       }

//       user.emailVerified = true;

//       await user.save();
//     }

    

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

    

//     res.status(200).json({
//       message:
//         "Google login successful",

//       token,

//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,

//         emailVerified: true,

//         phoneVerified:
//           user.phoneVerified === true,

//         kycCompleted:
//           user.kyc?.completed === true,
//       },
//     });

//   } catch (error) {
//     console.error(
//       "Google login error:",
//       error
//     );

//     res.status(401).json({
//       message:
//         "Google authentication failed",
//     });
//   }
// };






// // const sendPhoneOtp = async (req, res) => {
// //   try {
// //     const {
// //       userId,
// //       phone,
// //     } = req.body;

    

// //     if (!userId || !phone) {
// //       return res.status(400).json({
// //         message:
// //           "User ID and phone number are required",
// //       });
// //     }

// //     if (!/^\d{10}$/.test(phone)) {
// //       return res.status(400).json({
// //         message:
// //           "Enter a valid 10-digit phone number",
// //       });
// //     }

    

// //     const user =
// //       await User.findById(userId);

// //     if (!user) {
// //       return res.status(404).json({
// //         message: "User not found",
// //       });
// //     }

    

// //     user.phone = phone;

    

// //     const otp = crypto
// //       .randomInt(100000, 1000000)
// //       .toString();

// //     user.phoneOtp = otp;

// //     user.phoneOtpExpires =
// //       new Date(
// //         Date.now() +
// //         5 * 60 * 1000
// //       );

   

    
// //     const formattedPhone =
// //       `+91${phone}`;

    

// //     const twilioMessage =
// //       await twilioClient.messages.create({
// //         body:
// //           `Your EZFINANZ verification OTP is ${otp}. It is valid for 5 minutes.`,

// //         from:
// //           process.env.TWILIO_PHONE_NUMBER,

// //         to:
// //           formattedPhone,
// //       });

// //        await user.save();

// //     console.log(
// //       "OTP SMS sent successfully:",
// //       twilioMessage.sid
// //     );

    

// //     return res.status(200).json({
// //       message:
// //         "OTP sent successfully",
// //     });

// //   } catch (error) {
// //     console.error(
// //       "Send OTP error:",
// //       error
// //     );

// //     return res.status(500).json({
// //       message:
// //         error.message ||
// //         "Failed to send OTP",
// //     });
// //   }
// // };



// const sendPhoneOtp = async (req, res) => {
//   try {
//     const { userId, phone } = req.body;

//     console.log("========== SEND PHONE OTP ==========");
//     console.log("User ID:", userId);
//     console.log("Phone received:", phone);


//     if (!userId || !phone) {
//       console.log("ERROR: Missing userId or phone");
      
//       return res.status(400).json({
//         message: "User ID and phone number are required",
//       });
//     }

//     // Accept only 10-digit Indian number
//     if (!/^\d{10}$/.test(phone)) {
//       console.log("ERROR: Invalid phone number");

//       return res.status(400).json({
//         message: "Enter a valid 10-digit phone number",
//       });
//     }

   

//     const user = await User.findById(userId);

//     if (!user) {
//       console.log("ERROR: User not found");

//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

  

//     user.phone = phone;

    

//     const otp = crypto
//       .randomInt(100000, 1000000)
//       .toString();



//     user.phoneOtp = otp;

//     // OTP valid for 5 minutes
//     user.phoneOtpExpires = new Date(
//       Date.now() + 5 * 60 * 1000
//     );

//     await user.save();



   
//     console.log("PHONE OTP GENERATED SUCCESSFULLY");
//     console.log("Phone:", phone);
//     console.log("OTP:", otp);
//     console.log("Expires:", user.phoneOtpExpires);
   
    
   

    
//     return res.status(200).json({
//       message: "OTP generated successfully",
//     });

//   } catch (error) {

//   console.error("Message:", error.message);
//     console.error("Code:", error.code);
//     console.error("Stack:", error.stack);

    

//     return res.status(500).json({
//       message: "Failed to generate OTP",
//     });
//   }
// };






// if (user.phoneOtp !== otp) {
//   return res.status(400).json({
//     message: "Invalid OTP",
//   });
// }

// user.phoneVerified = true;
// user.phoneOtp = null;
// user.phoneOtpExpires = null;

// await user.save();

// return res.status(200).json({
//   message: "Phone verified successfully",
//   phoneVerified: true,
//   kycCompleted: user.kyc?.completed === true,
// });


// module.exports = {
//   register,
//   login,
//   googleLogin,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// };





const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const twilio = require("twilio");


// ===============================
// GOOGLE CLIENT
// ===============================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);


// ===============================
// TWILIO CLIENT
// ===============================

const twilioClient = twilio(
  process.env.AccountSID,
  process.env.AuthToken
);


// ===============================
// REGISTER
// ===============================

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: phone.trim() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or phone already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,

      phoneVerified: false,
      emailVerified: false,

      kyc: {
        completed: false,
      },
    });

    return res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        phoneVerified:
          user.phoneVerified === true,

        emailVerified:
          user.emailVerified === true,

        kycCompleted:
          user.kyc?.completed === true,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {
  try {
    console.log("========== LOGIN REQUEST ==========");
    console.log("Request body:", req.body);

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      console.log(
        "Login failed: user not found"
      );

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Google-created users may not have a password
    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google login. Please continue with Google.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      console.log(
        "Login failed: incorrect password"
      );

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from .env"
      );

      return res.status(500).json({
        message:
          "JWT configuration is missing",
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

    console.log(
      "Login successful:",
      user.email
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        emailVerified:
          user.emailVerified === true,

        phoneVerified:
          user.phoneVerified === true,

        kycCompleted:
          user.kyc?.completed === true,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ===============================
// GOOGLE LOGIN
// ===============================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message:
          "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message:
          "Google Client ID is not configured",
      });
    }

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

    const normalizedEmail =
      email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      user = await User.create({
        fullName:
          name || "Google User",

        email:
          normalizedEmail,

        googleId,

        emailVerified: true,

        phoneVerified: false,

        kyc: {
          completed: false,
        },
      });

    } else {

      if (!user.googleId) {
        user.googleId = googleId;
      }

      user.emailVerified = true;

      await user.save();
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

    return res.status(200).json({
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

    return res.status(401).json({
      message:
        "Google authentication failed",
    });
  }
};


// ===============================
// SEND PHONE OTP
// ===============================

const sendPhoneOtp = async (req, res) => {
  try {
    const {
      userId,
      phone,
    } = req.body;

    

    console.log("User ID:", userId);
    console.log("Phone:", phone);

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

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();

    user.phone = phone;

    user.phoneOtp = otp;

    user.phoneOtpExpires =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    await user.save();

    console.log(
      "OTP generated:",
      otp
    );

    
    if (
      process.env.TWILIO_PHONE_NUMBER &&
      process.env.AccountSID &&
      process.env.AuthToken
    ) {

      const formattedPhone =
        `+91${phone}`;

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
        "OTP SMS sent:",
        twilioMessage.sid
      );

    } else {

      // Development mode
      console.log(
        "Twilio credentials missing."
      );

      console.log(
        "Development OTP:",
        otp
      );
    }

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
        "Failed to send OTP",
    });
  }
};


// ===============================
// VERIFY PHONE OTP
// ===============================

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

    if (!user.phoneOtp) {
      return res.status(400).json({
        message:
          "No OTP has been generated",
      });
    }

    if (
      !user.phoneOtpExpires ||
      user.phoneOtpExpires < new Date()
    ) {

      user.phoneOtp = null;
      user.phoneOtpExpires = null;

      await user.save();

      return res.status(400).json({
        message:
          "OTP has expired",
      });
    }

    if (
      user.phoneOtp.toString() !==
      otp.toString()
    ) {

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

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
        "Failed to verify OTP",
    });
  }
};


// ===============================
// EXPORT
// ===============================

module.exports = {
  register,
  login,
  googleLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
};