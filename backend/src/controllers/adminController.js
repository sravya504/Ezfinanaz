const LoanApplication = require("../models/LoanApplication");



const getAllApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({})
      .populate(
        "user",
        "fullName name email phone emailVerified phoneVerified kyc createdAt"
      )
      .populate("adminReview.reviewedBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get all applications error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const getPendingApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({
      currentStage: "admin_review",
      "adminReview.decision": "pending",
    })
      .populate(
        "user",
        "fullName name email phone emailVerified phoneVerified kyc createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

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

    const application = await LoanApplication.findById(applicationId)
      .populate(
        "user",
        "fullName name email phone emailVerified phoneVerified kyc createdAt"
      )
      .populate("adminReview.reviewedBy", "fullName email")
      .lean();

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



const approveSelfie = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "admin_review") {
      return res.status(400).json({
        message: "Application is not waiting for admin review",
      });
    }

    if (!application.selfie || !application.selfie.imageUrl) {
      return res.status(400).json({
        message: "No selfie has been submitted",
      });
    }

    // Approve selfie only.
    // Final application decision remains pending.
    application.selfie.verified = true;
    application.selfie.verifiedAt = new Date();

    await application.save();

    res.status(200).json({
      message: "Photo approved successfully",
      application,
    });
  } catch (error) {
    console.error("Approve selfie error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const rejectSelfie = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const { rejectionReason } = req.body || {};

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Loan application not found",
      });
    }

    if (application.currentStage !== "admin_review") {
      return res.status(400).json({
        message: "Application is not waiting for admin review",
      });
    }

    if (!application.selfie || !application.selfie.imageUrl) {
      return res.status(400).json({
        message: "No selfie has been submitted",
      });
    }

    application.selfie.verified = false;
    application.selfie.verifiedAt = null;

    application.adminReview = {
      decision: "rejected",
      rejectionReason:
        rejectionReason?.trim() ||
        "Photo verification rejected.",
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    };

    application.status = "rejected";
    application.currentStage = "completed";

    await application.save();

    res.status(200).json({
      message: "Photo rejected successfully",
      application,
    });
  } catch (error) {
    console.error("Reject selfie error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);

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

    if (
      application.adminReview &&
      application.adminReview.decision !== "pending"
    ) {
      return res.status(400).json({
        message: "Application has already been reviewed",
      });
    }

    // Photo must be approved before final approval.
    if (!application.selfie || !application.selfie.verified) {
      return res.status(400).json({
        message:
          "Please approve the photo before approving the application.",
      });
    }

    application.adminReview = {
      decision: "approved",
      rejectionReason: null,
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    };

    application.status = "approved";

    // Move application to disbursement.
    application.currentStage = "disbursement";

    await application.save();

    res.status(200).json({
      message: "Application approved successfully",
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

    // Reason is REQUIRED.
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        message: "Please provide a rejection reason.",
      });
    }

    const application = await LoanApplication.findById(applicationId);

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

    if (
      application.adminReview &&
      application.adminReview.decision !== "pending"
    ) {
      return res.status(400).json({
        message: "Application has already been reviewed",
      });
    }

    application.adminReview = {
      decision: "rejected",
      rejectionReason: rejectionReason.trim(),
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    };

    application.status = "rejected";

    application.currentStage = "completed";

    await application.save();

    res.status(200).json({
      message: "Application rejected successfully",
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
  getAllApplications,
  getPendingApplications,
  getApplicationById,
  approveSelfie,
  rejectSelfie,
  approveApplication,
  rejectApplication,
};