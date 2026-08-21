const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // KYC DETAILS
    // ==========================================

    kyc: {
      fullName: {
        type: String,
        default: null,
        trim: true,
      },

      dateOfBirth: {
        type: Date,
        default: null,
      },

      gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: null,
      },

      currentAddress: {
        type: String,
        default: null,
        trim: true,
      },

      idType: {
        type: String,
        enum: ["PAN", "Aadhaar"],
        default: null,
      },

      idNumber: {
        type: String,
        default: null,
        trim: true,
      },

      completed: {
        type: Boolean,
        default: false,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);