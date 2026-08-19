const LoanApplication = require("../models/LoanApplication");

const createApplication = async (req, res) => {
  try {
    const {
      requestedLoanAmount,
      incomeType,
      income,
      creditScore,
      currentDebts,
      employerName,
      designation,
    } = req.body;

    if (
      requestedLoanAmount === undefined ||
      !incomeType ||
      income === undefined ||
      creditScore === undefined ||
      currentDebts === undefined ||
      !employerName ||
      !designation
    ) {
      return res.status(400).json({
        message: "All loan eligibility details are required",
      });
    }

    const application = await LoanApplication.create({
      user: req.user.userId,

      loanDetails: {
        requestedLoanAmount,
        incomeType,
        income,
        creditScore,
        currentDebts,
        employerName,
        designation,
      },

      currentStage: "eligibility",
      status: "in_progress",
    });

    res.status(201).json({
      message: "Loan application created successfully",
      application,
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const checkEligibility = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findOne({
      _id: applicationId,
      user: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    const {
      requestedLoanAmount,
      incomeType,
      income,
      creditScore,
      currentDebts,
    } = application.loanDetails;

    // Convert annual income to monthly income
    const monthlyIncome =
      incomeType === "annual" ? income / 12 : income;

    // Debt-to-Income ratio
    const debtToIncomeRatio =
      monthlyIncome > 0
        ? (currentDebts / monthlyIncome) * 100
        : 100;

    // Credit score assessment
    let creditScoreAssessment;

    if (creditScore >= 750) {
      creditScoreAssessment = "Excellent";
    } else if (creditScore >= 650) {
      creditScoreAssessment = "Good";
    } else if (creditScore >= 550) {
      creditScoreAssessment = "Fair";
    } else {
      creditScoreAssessment = "Poor";
    }

    // Eligibility decision
    let result;

    if (
      creditScore >= 750 &&
      debtToIncomeRatio <= 40 &&
      requestedLoanAmount <= monthlyIncome * 20
    ) {
      result = "eligible";
    } else if (
      creditScore >= 650 &&
      debtToIncomeRatio <= 50 &&
      requestedLoanAmount <= monthlyIncome * 15
    ) {
      result = "partially_eligible";
    } else {
      result = "not_eligible";
    }

    application.eligibility = {
      creditScoreAssessment,
      debtToIncomeRatio: Number(
        debtToIncomeRatio.toFixed(2)
      ),
      result,
      eligibleLoanAmount:
        result === "eligible"
          ? requestedLoanAmount
          : result === "partially_eligible"
          ? monthlyIncome * 15
          : 0,
      checkedAt: new Date(),
    };

    if (result === "eligible" || result === "partially_eligible") {
      application.currentStage = "emi_selection";
    } else {
      application.currentStage = "eligibility";
    }

    await application.save();

    res.status(200).json({
      message: "Eligibility checked successfully",
      eligibility: application.eligibility,
      currentStage: application.currentStage,
    });
  } catch (error) {
    console.error("Eligibility check error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const calculateEMI = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { loanAmount, tenure } = req.body;

    const application = await LoanApplication.findOne({
      _id: applicationId,
      user: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    // EMI calculation is allowed only after eligibility
    if (
      !application.eligibility ||
      !["eligible", "partially_eligible"].includes(
        application.eligibility.result
      )
    ) {
      return res.status(400).json({
        message: "Loan is not eligible for EMI selection",
      });
    }

    // Allowed repayment tenures from the project specification
    const allowedTenures = [6, 12, 18, 24, 36];

    if (!allowedTenures.includes(Number(tenure))) {
      return res.status(400).json({
        message: "Invalid tenure. Choose 6, 12, 18, 24, or 36 months",
      });
    }

    const amount = Number(loanAmount);
    const months = Number(tenure);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid loan amount is required",
      });
    }

    // Customer cannot select more than the eligible amount
    if (amount > application.eligibility.eligibleLoanAmount) {
      return res.status(400).json({
        message: `Loan amount cannot exceed ₹${application.eligibility.eligibleLoanAmount}`,
      });
    }

    /*
      These are application assumptions because the document
      does not prescribe exact values.

      They can later be moved to a configuration file/database.
    */
    const annualInterestRate = 12;
    const processingFeeRate = 2;
    const gstRate = 18;
    const otherCharges = 500;

    // Monthly interest rate
    const monthlyRate = annualInterestRate / 12 / 100;

    // EMI formula:
    // EMI = P × r × (1+r)^n / ((1+r)^n - 1)
    const emi =
      amount === 0
        ? 0
        : (
            (amount *
              monthlyRate *
              Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)
          );

    const roundedEMI = Number(emi.toFixed(2));

    const totalRepayment = Number(
      (roundedEMI * months).toFixed(2)
    );

    const totalInterest = Number(
      (totalRepayment - amount).toFixed(2)
    );

    // Processing fee
    const processingFee = Number(
      ((amount * processingFeeRate) / 100).toFixed(2)
    );

    // GST on processing fee
    const gst = Number(
      ((processingFee * gstRate) / 100).toFixed(2)
    );

    const totalCharges = Number(
      (processingFee + gst + otherCharges).toFixed(2)
    );

    // Amount actually received by customer
    const netDisbursementAmount = Number(
      (amount - totalCharges).toFixed(2)
    );

    /*
      IRR calculation

      Initial cash flow:
      +net disbursement

      Future cash flows:
      -monthly EMI

      First calculate monthly IRR using Newton-Raphson,
      then convert it to annual effective IRR.
    */
    const calculateMonthlyIRR = (
      principal,
      payment,
      numberOfMonths
    ) => {
      let rate = 0.01;

      for (let i = 0; i < 100; i++) {
        let npv = principal;
        let derivative = 0;

        for (let month = 1; month <= numberOfMonths; month++) {
          const discountFactor = Math.pow(
            1 + rate,
            month
          );

          npv -= payment / discountFactor;

          derivative +=
            (month * payment) /
            Math.pow(1 + rate, month + 1);
        }

        const newRate = rate - npv / derivative;

        if (Math.abs(newRate - rate) < 0.0000001) {
          return newRate;
        }

        rate = newRate;
      }

      return rate;
    };

    const monthlyIRR = calculateMonthlyIRR(
      netDisbursementAmount,
      roundedEMI,
      months
    );

    const annualIRR =
      (Math.pow(1 + monthlyIRR, 12) - 1) * 100;

    const irr = Number(annualIRR.toFixed(2));

    application.emiTerms = {
      loanAmount: amount,
      tenure: months,
      interestRate: annualInterestRate,
      processingFee,
      gst,
      otherCharges,
      emi: roundedEMI,
      totalInterest,
      totalRepayment,
      totalCharges,
      netDisbursementAmount,
      irr,
    };

    application.currentStage = "bank_account";

    await application.save();

    res.status(200).json({
      message: "EMI calculated successfully",
      emiTerms: application.emiTerms,
      currentStage: application.currentStage,
    });
  } catch (error) {
    console.error("EMI calculation error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const addBankAccount = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    } = req.body || {};

    // Validate input
    if (
      !accountHolderName ||
      !accountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json({
        message: "All bank account details are required",
      });
    }

    // Find the user's application
    const application = await LoanApplication.findOne({
      _id: applicationId,
      user: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    // Bank account can be added only after EMI selection
    if (application.currentStage !== "bank_account") {
      return res.status(400).json({
        message: "Bank account details cannot be added at this stage",
      });
    }

    // Basic IFSC validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return res.status(400).json({
        message: "Invalid IFSC code",
      });
    }

    // Simulated bank verification
    const verified = true;

    application.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
      verified,
      verifiedAt: new Date(),
    };

    // Move to declaration stage after successful verification
    application.currentStage = "declaration";

    await application.save();

    res.status(200).json({
      message: "Bank account verified successfully",
      bankDetails: application.bankDetails,
      currentStage: application.currentStage,
    });
  } catch (error) {
    console.error("Bank account error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const submitDeclaration = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const {
      loanInformationConfirmed,
      termsAndChargesConfirmed,
      creditCheckConsent,
      digitalProcessingConsent,
    } = req.body || {};

    if (
      loanInformationConfirmed !== true ||
      termsAndChargesConfirmed !== true ||
      creditCheckConsent !== true ||
      digitalProcessingConsent !== true
    ) {
      return res.status(400).json({
        message:
          "All declaration confirmations and consents are required",
      });
    }

    const application = await LoanApplication.findOne({
      _id: applicationId,
      user: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "declaration") {
      return res.status(400).json({
        message: "Declaration cannot be submitted at this stage",
      });
    }

    application.declaration = {
      loanInformationConfirmed,
      termsAndChargesConfirmed,
      creditCheckConsent,
      digitalProcessingConsent,
      acceptedAt: new Date(),
    };

    application.currentStage = "selfie";

    await application.save();

    res.status(200).json({
      message: "Declaration submitted successfully",
      declaration: application.declaration,
      currentStage: application.currentStage,
    });
  } catch (error) {
    console.error("Declaration error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const uploadSelfie = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Selfie image is required",
      });
    }

    const application = await LoanApplication.findOne({
      _id: applicationId,
      user: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "selfie") {
      return res.status(400).json({
        message: "Selfie cannot be submitted at this stage",
      });
    }

    /*
      The project specification allows simulated
      face-match verification.
    */
    const verified = true;

    application.selfie = {
      imageUrl: req.file.path,
      verified,
      verifiedAt: new Date(),
    };

    application.currentStage = "admin_review";

    await application.save();

    res.status(200).json({
      message: "Selfie uploaded and verified successfully",
      selfie: application.selfie,
      currentStage: application.currentStage,
    });
  } catch (error) {
    console.error("Selfie upload error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyApplication = async (req, res) => {
  try {
    const application = await LoanApplication.findOne({
      user: req.user.userId,
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({
        message: "No loan application found",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error("Get my application error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createApplication,
  checkEligibility,
   calculateEMI,
   addBankAccount,
   submitDeclaration,
   uploadSelfie,
    getMyApplication,
};