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
  unique: true,
  sparse: true,
  trim: true,
},

    password: {
      type: String,
      required: false,
    },

    googleId: {
      type: String,
      default: null,
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
    
    phoneOtp: {
  type: String,
  default: null,
},

phoneOtpExpires: {
  type: Date,
  default: null,
},

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