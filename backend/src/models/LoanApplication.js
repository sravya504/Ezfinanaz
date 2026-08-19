const mongoose = require("mongoose");

const loanApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    
    loanDetails: {
      requestedLoanAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      incomeType: {
        type: String,
        enum: ["monthly", "annual"],
        required: true,
      },

      income: {
        type: Number,
        required: true,
        min: 0,
      },

      creditScore: {
        type: Number,
        required: true,
        min: 0,
        max: 900,
      },

      currentDebts: {
        type: Number,
        required: true,
        min: 0,
      },

      employerName: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        required: true,
        trim: true,
      },
    },

    
    eligibility: {
      creditScoreAssessment: {
        type: String,
        default: null,
      },

      debtToIncomeRatio: {
        type: Number,
        default: null,
      },

      result: {
        type: String,
        enum: [
          "eligible",
          "partially_eligible",
          "not_eligible",
        ],
        default: null,
      },

      eligibleLoanAmount: {
        type: Number,
        default: null,
      },

      checkedAt: {
        type: Date,
        default: null,
      },
    },

   
    emiTerms: {
      loanAmount: {
        type: Number,
        default: null,
      },

      tenure: {
        type: Number,
        default: null,
      },

      interestRate: {
        type: Number,
        default: null,
      },

      processingFee: {
        type: Number,
        default: null,
      },

      gst: {
        type: Number,
        default: null,
      },

      otherCharges: {
        type: Number,
        default: null,
      },

      emi: {
        type: Number,
        default: null,
      },

      totalInterest: {
        type: Number,
        default: null,
      },

      totalRepayment: {
        type: Number,
        default: null,
      },

      totalCharges: {
        type: Number,
        default: null,
      },

      netDisbursementAmount: {
        type: Number,
        default: null,
      },

      irr: {
        type: Number,
        default: null,
      },
    },


    bankDetails: {
  accountHolderName: {
    type: String,
    default: null,
    trim: true,
  },

  accountNumber: {
    type: String,
    default: null,
    trim: true,
  },

  ifscCode: {
    type: String,
    default: null,
    trim: true,
    uppercase: true,
  },

  bankName: {
    type: String,
    default: null,
    trim: true,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  verifiedAt: {
    type: Date,
    default: null,
  },
},



declaration: {
  loanInformationConfirmed: {
    type: Boolean,
    default: false,
  },

  termsAndChargesConfirmed: {
    type: Boolean,
    default: false,
  },

  creditCheckConsent: {
    type: Boolean,
    default: false,
  },

  digitalProcessingConsent: {
    type: Boolean,
    default: false,
  },

  acceptedAt: {
    type: Date,
    default: null,
  },
},




selfie: {
  imageUrl: {
    type: String,
    default: null,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  verifiedAt: {
    type: Date,
    default: null,
  },
},


adminReview: {
  decision: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  rejectionReason: {
    type: String,
    default: null,
    trim: true,
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  reviewedAt: {
    type: Date,
    default: null,
  },
},


disbursement: {
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },

  amount: {
    type: Number,
    default: 0,
  },

  transactionId: {
    type: String,
    default: null,
  },

  disbursedAt: {
    type: Date,
    default: null,
  },
},
   
    currentStage: {
  type: String,
  enum: [
    "eligibility",
    "emi_selection",
    "bank_account",
    "declaration",
    "selfie",
    "admin_review",
    "disbursement",
    "completed"
  ],
  default: "eligibility"
},

    status: {
      type: String,
      enum: [
        "in_progress",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "disbursed",
      ],
      default: "in_progress",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LoanApplication",
  loanApplicationSchema
);