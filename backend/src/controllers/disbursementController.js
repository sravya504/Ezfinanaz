const LoanApplication = require("../models/LoanApplication");

const disburseLoan = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "disbursement") {
      return res.status(400).json({
        message: "Application is not ready for disbursement",
      });
    }

    if (application.status !== "approved") {
      return res.status(400).json({
        message: "Loan application is not approved",
      });
    }

    const amount = application.emiTerms.netDisbursementAmount;

    const transactionId =
      "TXN" + Date.now();

    application.disbursement = {
      status: "completed",
      amount,
      transactionId,
      disbursedAt: new Date(),
    };

    application.status = "disbursed";
    application.currentStage = "completed";

    await application.save();

    res.status(200).json({
      message: "Loan disbursed successfully",
      disbursement: application.disbursement,
      currentStage: application.currentStage,
      status: application.status,
    });
  } catch (error) {
    console.error("Disbursement error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  disburseLoan,
};