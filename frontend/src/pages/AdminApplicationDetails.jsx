import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "../style/admin-application-details.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function AdminApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [photoRejectReason, setPhotoRejectReason] = useState("");
  const [showPhotoRejectBox, setShowPhotoRejectBox] =
    useState(false);

  const [applicationRejectReason, setApplicationRejectReason] =
    useState("");

  const [showApplicationRejectBox, setShowApplicationRejectBox] =
    useState(false);

  // =====================================================
  // FETCH APPLICATION
  // =====================================================

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplication(response.data.application);
    } catch (err) {
      console.error("Fetch application error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load application."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    return new Date(value).toLocaleString("en-IN");
  };

  // =====================================================
  // APPROVE PHOTO
  // =====================================================

  const handleApprovePhoto = async () => {
    try {
      setActionLoading(true);
      setSuccessMessage("");
      setActionError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/admin/applications/${applicationId}/selfie/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Photo approved successfully."
      );

      await fetchApplication();
    } catch (err) {
      console.error("Approve photo error:", err);

      setActionError(
        err.response?.data?.message ||
          "Failed to approve photo."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // REJECT PHOTO
  // =====================================================

  const handleRejectPhoto = async () => {
    try {
      setActionLoading(true);
      setSuccessMessage("");
      setActionError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/admin/applications/${applicationId}/selfie/reject`,
        {
          rejectionReason:
            photoRejectReason.trim() ||
            "Photo verification rejected.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Photo rejected successfully."
      );

      setPhotoRejectReason("");
      setShowPhotoRejectBox(false);

      await fetchApplication();
    } catch (err) {
      console.error("Reject photo error:", err);

      setActionError(
        err.response?.data?.message ||
          "Failed to reject photo."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // APPROVE ENTIRE APPLICATION
  // =====================================================

  const handleApproveApplication = async () => {
    try {
      setActionLoading(true);
      setSuccessMessage("");
      setActionError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/admin/applications/${applicationId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Application approved successfully."
      );

      // Hide reject form if it was open.
      setShowApplicationRejectBox(false);
      setApplicationRejectReason("");

      await fetchApplication();
    } catch (err) {
      console.error("Approve application error:", err);

      setActionError(
        err.response?.data?.message ||
          "Failed to approve application."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // REJECT ENTIRE APPLICATION
  // =====================================================

  const handleRejectApplication = async () => {
    const reason = applicationRejectReason.trim();

    if (!reason) {
      setActionError(
        "Please enter a reason before rejecting the application."
      );
      return;
    }

    try {
      setActionLoading(true);
      setSuccessMessage("");
      setActionError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/admin/applications/${applicationId}/reject`,
        {
          rejectionReason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Application rejected successfully."
      );

      setApplicationRejectReason("");
      setShowApplicationRejectBox(false);

      await fetchApplication();
    } catch (err) {
      console.error("Reject application error:", err);

      setActionError(
        err.response?.data?.message ||
          "Failed to reject application."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-application-details">
        <div className="application-loading">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="admin-application-details">
        <div className="application-error">
          <h2>Unable to load application</h2>

          <p>{error}</p>

          <button
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="admin-application-details">
        <div className="application-error">
          <h2>Application not found</h2>

          <button
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const user = application.user;
  const kyc = user?.kyc;

  const loan = application.loanDetails;
  const eligibility = application.eligibility;
  const emi = application.emiTerms;
  const bank = application.bankDetails;
  const declaration = application.declaration;
  const selfie = application.selfie;
  const adminReview = application.adminReview;

  const applicationStatus =
    application.status || "in_progress";

  // IMPORTANT:
  // Photo status comes ONLY from selfie.verified.
  // Do not use adminReview.decision here because
  // adminReview.decision is the FINAL APPLICATION decision.
  const photoApproved = selfie?.verified === true;

  const photoRejected =
    applicationStatus === "rejected" &&
    !photoApproved &&
    adminReview?.rejectionReason;

  // Admin Review should only be visible while pending.
  const showAdminReview =
    applicationStatus !== "approved" &&
    applicationStatus !== "rejected";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-application-details">
      <div className="admin-application-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="details-header">
          <button
            className="back-button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1>Application Details</h1>

            <p>
              Complete customer application journey
            </p>
          </div>
        </div>

        {/* =================================================
            SUCCESS / ERROR MESSAGE
        ================================================= */}

        {successMessage && (
          <div className="action-success-message">
            <span>✓</span>
            {successMessage}
          </div>
        )}

        {actionError && (
          <div className="action-error-message">
            {actionError}
          </div>
        )}

        {/* =================================================
            APPLICATION STATUS
        ================================================= */}

        <section className="details-section">
          <h2>Application Status</h2>

          <div className="details-grid">
            <div>
              <strong>Application ID</strong>
              <span>{application._id}</span>
            </div>

            <div>
              <strong>Current Stage</strong>
              <span>
                {application.currentStage || "--"}
              </span>
            </div>

            <div>
              <strong>Status</strong>

              <span
                className={`status-value status-${applicationStatus}`}
              >
                {applicationStatus}
              </span>
            </div>

            <div>
              <strong>Submitted</strong>

              <span>
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            1. LOGIN / VERIFICATION
        ================================================= */}

        <section className="details-section">
          <h2>1. Login / Verification Status</h2>

          <div className="details-grid">
            <div>
              <strong>Full Name</strong>
              <span>{user?.fullName || "--"}</span>
            </div>

            <div>
              <strong>Email</strong>
              <span>{user?.email || "--"}</span>
            </div>

            <div>
              <strong>Phone</strong>
              <span>{user?.phone || "--"}</span>
            </div>

            <div>
              <strong>Email Verified</strong>
              <span>
                {user?.emailVerified ? "Yes" : "No"}
              </span>
            </div>

            <div>
              <strong>Phone Verified</strong>
              <span>
                {user?.phoneVerified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            2. KYC
        ================================================= */}

        <section className="details-section">
          <h2>2. KYC Details</h2>

          <div className="details-grid">
            <div>
              <strong>Full Name</strong>
              <span>{kyc?.fullName || "--"}</span>
            </div>

            <div>
              <strong>Date of Birth</strong>
              <span>
                {kyc?.dateOfBirth
                  ? new Date(
                      kyc.dateOfBirth
                    ).toLocaleDateString("en-IN")
                  : "--"}
              </span>
            </div>

            <div>
              <strong>Age</strong>
              <span>{kyc?.age || "--"}</span>
            </div>

            <div>
              <strong>Gender</strong>
              <span>{kyc?.gender || "--"}</span>
            </div>

            <div className="full-width">
              <strong>Current Address</strong>
              <span>
                {kyc?.currentAddress || "--"}
              </span>
            </div>

            <div>
              <strong>ID Type</strong>
              <span>{kyc?.idType || "--"}</span>
            </div>

            <div>
              <strong>ID Number</strong>
              <span>{kyc?.idNumber || "--"}</span>
            </div>

            <div>
              <strong>KYC Completed</strong>
              <span>
                {kyc?.completed ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            3. LOAN
        ================================================= */}

        <section className="details-section">
          <h2>3. Loan Details</h2>

          <div className="details-grid">
            <div>
              <strong>Requested Loan Amount</strong>
              <span>
                {formatCurrency(
                  loan?.requestedLoanAmount
                )}
              </span>
            </div>

            <div>
              <strong>Income Type</strong>
              <span>
                {loan?.incomeType || "--"}
              </span>
            </div>

            <div>
              <strong>Income</strong>
              <span>
                {formatCurrency(loan?.income)}
              </span>
            </div>

            <div>
              <strong>Credit Score</strong>
              <span>
                {loan?.creditScore ?? "--"}
              </span>
            </div>

            <div>
              <strong>Current Debts</strong>
              <span>
                {formatCurrency(
                  loan?.currentDebts
                )}
              </span>
            </div>

            <div>
              <strong>Employer</strong>
              <span>
                {loan?.employerName || "--"}
              </span>
            </div>

            <div>
              <strong>Designation</strong>
              <span>
                {loan?.designation || "--"}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            4. ELIGIBILITY
        ================================================= */}

        <section className="details-section">
          <h2>
            4. Eligibility Result and Scores
          </h2>

          <div className="details-grid">
            <div>
              <strong>Result</strong>
              <span>
                {eligibility?.result || "--"}
              </span>
            </div>

            <div>
              <strong>
                Credit Score Assessment
              </strong>
              <span>
                {eligibility?.creditScoreAssessment ||
                  "--"}
              </span>
            </div>

            <div>
              <strong>
                Debt-to-Income Ratio
              </strong>
              <span>
                {eligibility?.debtToIncomeRatio ??
                  "--"}
              </span>
            </div>

            <div>
              <strong>
                Eligible Loan Amount
              </strong>
              <span>
                {formatCurrency(
                  eligibility?.eligibleLoanAmount
                )}
              </span>
            </div>

            <div>
              <strong>Checked At</strong>
              <span>
                {formatDate(
                  eligibility?.checkedAt
                )}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            5. EMI
        ================================================= */}

        <section className="details-section">
          <h2>5. Selected EMI / Tenure</h2>

          <div className="details-grid">
            <div>
              <strong>Loan Amount</strong>
              <span>
                {formatCurrency(emi?.loanAmount)}
              </span>
            </div>

            <div>
              <strong>Selected Tenure</strong>
              <span>
                {emi?.tenure
                  ? `${emi.tenure} months`
                  : "--"}
              </span>
            </div>

            <div>
              <strong>Interest Rate</strong>
              <span>
                {emi?.interestRate ?? "--"}%
              </span>
            </div>

            <div>
              <strong>Monthly EMI</strong>
              <span>
                {formatCurrency(emi?.emi)}
              </span>
            </div>

            <div>
              <strong>Total Interest</strong>
              <span>
                {formatCurrency(
                  emi?.totalInterest
                )}
              </span>
            </div>

            <div>
              <strong>Total Repayment</strong>
              <span>
                {formatCurrency(
                  emi?.totalRepayment
                )}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            6. BANK
        ================================================= */}

        <section className="details-section">
          <h2>6. Bank Account Details</h2>

          <div className="details-grid">
            <div>
              <strong>Account Holder</strong>
              <span>
                {bank?.accountHolderName || "--"}
              </span>
            </div>

            <div>
              <strong>Account Number</strong>
              <span>
                {bank?.accountNumber || "--"}
              </span>
            </div>

            <div>
              <strong>IFSC Code</strong>
              <span>
                {bank?.ifscCode || "--"}
              </span>
            </div>

            <div>
              <strong>Bank Name</strong>
              <span>
                {bank?.bankName || "--"}
              </span>
            </div>

            <div>
              <strong>Bank Verified</strong>
              <span>
                {bank?.verified ? "Yes" : "No"}
              </span>
            </div>

            <div>
              <strong>Verified At</strong>
              <span>
                {formatDate(bank?.verifiedAt)}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            7. DECLARATION
        ================================================= */}

        <section className="details-section">
          <h2>7. Declaration Confirmation</h2>

          <div className="details-grid">
            <div>
              <strong>Loan Information</strong>
              <span>
                {declaration?.loanInformationConfirmed
                  ? "Confirmed"
                  : "Not Confirmed"}
              </span>
            </div>

            <div>
              <strong>Terms & Charges</strong>
              <span>
                {declaration?.termsAndChargesConfirmed
                  ? "Confirmed"
                  : "Not Confirmed"}
              </span>
            </div>

            <div>
              <strong>Credit Check Consent</strong>
              <span>
                {declaration?.creditCheckConsent
                  ? "Confirmed"
                  : "Not Confirmed"}
              </span>
            </div>

            <div>
              <strong>
                Digital Processing Consent
              </strong>
              <span>
                {declaration?.digitalProcessingConsent
                  ? "Confirmed"
                  : "Not Confirmed"}
              </span>
            </div>

            <div>
              <strong>Accepted At</strong>
              <span>
                {formatDate(
                  declaration?.acceptedAt
                )}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            8. SELFIE / PHOTO REVIEW
        ================================================= */}

        <section className="details-section selfie-section">
          <h2>
            8. Live Selfie / Photo Verification
          </h2>

          <div className="selfie-review">

            {/* PHOTO */}

            <div className="selfie-image-container">
              {selfie?.imageUrl ? (
                <img
                  src={selfie.imageUrl}
                  alt="Customer selfie"
                  className="customer-selfie"
                />
              ) : (
                <div className="no-selfie">
                  No selfie submitted.
                </div>
              )}
            </div>

            {/* INFORMATION */}

            <div className="selfie-information">

              <div className="photo-status-row">
                <strong>
                  Photo Verification
                </strong>

                <span
                  className={`photo-status ${
                    photoApproved
                      ? "approved"
                      : photoRejected
                      ? "rejected"
                      : "pending"
                  }`}
                >
                  {photoApproved
                    ? "Approved"
                    : photoRejected
                    ? "Rejected"
                    : "Pending"}
                </span>
              </div>

              <div className="photo-detail-row">
                <strong>Selfie Verified</strong>

                <span>
                  {selfie?.verified
                    ? "Yes"
                    : "No"}
                </span>
              </div>

              {/* PHOTO ACTIONS */}

              {!photoApproved &&
                !photoRejected &&
                applicationStatus !== "rejected" &&
                applicationStatus !== "approved" && (
                  <div className="photo-actions">

                    <button
                      type="button"
                      className="approve-photo-button"
                      onClick={handleApprovePhoto}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? "Processing..."
                        : "✓ Approve Photo"}
                    </button>

                    <button
                      type="button"
                      className="reject-photo-button"
                      onClick={() =>
                        setShowPhotoRejectBox(
                          !showPhotoRejectBox
                        )
                      }
                      disabled={actionLoading}
                    >
                      ✕ Reject Photo
                    </button>

                  </div>
                )}

              {/* PHOTO REJECTION FORM */}

              {showPhotoRejectBox &&
                !photoRejected && (
                  <div className="photo-reject-box">

                    <label>
                      Rejection Reason
                    </label>

                    <textarea
                      value={photoRejectReason}
                      onChange={(e) =>
                        setPhotoRejectReason(
                          e.target.value
                        )
                      }
                      placeholder="Enter reason for rejecting the photo..."
                      rows={4}
                    />

                    <div className="reject-confirm-actions">

                      <button
                        type="button"
                        className="cancel-reject-button"
                        onClick={() => {
                          setShowPhotoRejectBox(
                            false
                          );
                          setPhotoRejectReason("");
                        }}
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="confirm-reject-photo-button"
                        onClick={handleRejectPhoto}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? "Rejecting..."
                          : "Confirm Reject Photo"}
                      </button>

                    </div>
                  </div>
                )}

              {/* PHOTO APPROVED */}

              {photoApproved && (
                <div className="photo-approved-box">
                  ✓ Photo approved successfully.
                </div>
              )}

              {/* PHOTO REJECTED */}

              {photoRejected && (
                <div className="photo-rejected-box">
                  <strong>Photo rejected.</strong>

                  {adminReview?.rejectionReason && (
                    <p>
                      {adminReview.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            9. ADMIN REVIEW
            ONLY SHOW WHILE FINAL DECISION IS PENDING
        ================================================= */}

        {showAdminReview && (
          <section className="details-section admin-review-section">
            <h2>9. Admin Review</h2>

            <div className="details-grid">

              <div>
                <strong>Decision</strong>

                <span>
                  {adminReview?.decision ||
                    "pending"}
                </span>
              </div>

              <div>
                <strong>Rejection Reason</strong>

                <span>
                  {adminReview?.rejectionReason ||
                    "--"}
                </span>
              </div>

              <div>
                <strong>Reviewed At</strong>

                <span>
                  {formatDate(
                    adminReview?.reviewedAt
                  )}
                </span>
              </div>

            </div>
          </section>
        )}

        {/* =================================================
            10. APPLICATION DECISION
        ================================================= */}

        <section className="details-section application-decision-section">

          <h2>Application Decision</h2>

          {/* =================================================
              ALREADY APPROVED
          ================================================= */}

          {applicationStatus === "approved" && (
            <div className="final-approved-box">
              <div className="final-status-icon">
                ✓
              </div>

              <div>
                <strong>
                  Application Approved
                </strong>

                <p>
                  This application has been
                  successfully approved.
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              ALREADY REJECTED
          ================================================= */}

          {applicationStatus === "rejected" && (
            <div className="final-rejected-box">
              <div className="final-status-icon">
                ✕
              </div>

              <div>
                <strong>
                  Application Rejected
                </strong>

                <p>
                  {adminReview?.rejectionReason ||
                    "This application has been rejected."}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              PENDING FINAL DECISION
          ================================================= */}

          {applicationStatus !== "approved" &&
            applicationStatus !== "rejected" && (
              <>
                <p className="decision-description">
                  Review the complete application
                  before making the final decision.
                </p>

                {/* FINAL BUTTONS */}

                {!showApplicationRejectBox && (
                  <div className="application-decision-actions">

                    <button
                      type="button"
                      className="accept-application-button"
                      onClick={
                        handleApproveApplication
                      }
                      disabled={
                        actionLoading ||
                        !photoApproved
                      }
                    >
                      {actionLoading
                        ? "Processing..."
                        : "✓ Accept Application"}
                    </button>

                    <button
                      type="button"
                      className="reject-application-button"
                      onClick={() =>
                        setShowApplicationRejectBox(
                          true
                        )
                      }
                      disabled={actionLoading}
                    >
                      ✕ Reject Application
                    </button>

                  </div>
                )}

                {/* ACCEPT DISABLED MESSAGE */}

                {!photoApproved &&
                  !showApplicationRejectBox && (
                    <p className="decision-info">
                      Approve the customer's photo
                      before accepting the application.
                    </p>
                  )}

                {/* REJECTION FORM */}

                {showApplicationRejectBox && (
                  <div className="application-reject-box">

                    <label>
                      Application Rejection Reason
                      <span className="required">
                        Required
                      </span>
                    </label>

                    <textarea
                      value={applicationRejectReason}
                      onChange={(e) =>
                        setApplicationRejectReason(
                          e.target.value
                        )
                      }
                      placeholder="Enter the reason for rejecting this application..."
                      rows={5}
                    />

                    <div className="application-reject-actions">

                      <button
                        type="button"
                        className="cancel-reject-button"
                        onClick={() => {
                          setShowApplicationRejectBox(
                            false
                          );
                          setApplicationRejectReason(
                            ""
                          );
                          setActionError("");
                        }}
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="confirm-reject-application-button"
                        onClick={
                          handleRejectApplication
                        }
                        disabled={
                          actionLoading ||
                          !applicationRejectReason.trim()
                        }
                      >
                        {actionLoading
                          ? "Rejecting..."
                          : "Confirm Reject Application"}
                      </button>

                    </div>
                  </div>
                )}
              </>
            )}

        </section>

      </div>
    </div>
  );
}

export default AdminApplicationDetails;
