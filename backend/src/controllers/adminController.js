const LoanApplication = require("../models/LoanApplication");

const getPendingApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({
      currentStage: "admin_review",
      "adminReview.decision": "pending",

    
    })
    
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
     
    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get pending applications error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(
      applicationId
    ).populate("user", "name email phone");

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(
      applicationId
    );

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "admin_review") {
      return res.status(400).json({
        message: "Application is not ready for admin review",
      });
    }

    if (application.adminReview.decision !== "pending") {
      return res.status(400).json({
        message: "Application has already been reviewed",
      });
    }

    application.adminReview = {
      decision: "approved",
      rejectionReason: null,
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    };

    application.status = "approved";

    application.currentStage = "disbursement";

    await application.save();

    res.status(200).json({
      message: "Loan application approved successfully",
      application,
    });
  } catch (error) {
    console.error("Approve application error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const { rejectionReason } = req.body || {};

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const application = await LoanApplication.findById(
      applicationId
    );

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "admin_review") {
      return res.status(400).json({
        message: "Application is not ready for admin review",
      });
    }

    if (application.adminReview.decision !== "pending") {
      return res.status(400).json({
        message: "Application has already been reviewed",
      });
    }

    application.adminReview = {
      decision: "rejected",
      rejectionReason,
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    };

    application.status = "rejected";

    application.currentStage = "completed";

    await application.save();

    res.status(200).json({
      message: "Loan application rejected",
      application,
    });
  } catch (error) {
    console.error("Reject application error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getPendingApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
};