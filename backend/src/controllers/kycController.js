const User = require("../models/User");

// ==========================================
// SUBMIT KYC
// ==========================================

const submitKYC = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      currentAddress,
      idType,
      idNumber,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !currentAddress ||
      !idType ||
      !idNumber
    ) {
      return res.status(400).json({
        message:
          "All KYC details are required",
      });
    }

    // ==========================================
    // FIND LOGGED-IN USER
    // ==========================================

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // SAVE KYC
    // ==========================================

    user.kyc = {
      fullName,
      dateOfBirth,
      gender,
      currentAddress,
      idType,
      idNumber,

      completed: true,
      completedAt: new Date(),
    };

    await user.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "KYC submitted successfully",

      kyc: user.kyc,

      kycCompleted: true,
    });

  } catch (error) {
    console.error(
      "KYC submission error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET KYC
// ==========================================

const getKYC = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("kyc");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      kyc: user.kyc || {
        completed: false,
      },
    });

  } catch (error) {
    console.error(
      "Get KYC error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  submitKYC,
  getKYC,
};