import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../style/my-application.scss";

const API_URL = "http://localhost:5000";

function MyApplication() {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/loans/my-application`,
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

    fetchApplication();
  }, [navigate]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="application-page">
        <div className="application-card loading-card">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="application-page">
        <div className="application-card">

          <button
            className="back-button"
            onClick={() =>
              navigate("/customer/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div className="error-section">
            <h2>Unable to Load Application</h2>

            <p className="error-message">
              {error}
            </p>

            <button
              className="secondary-button"
              onClick={() =>
                navigate("/customer/apply-loan")
              }
            >
              Apply for Loan
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // No application
  // --------------------------------------------------

  if (!application) {
    return (
      <div className="application-page">
        <div className="application-card">

          <button
            className="back-button"
            onClick={() =>
              navigate("/customer/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div className="empty-section">

            <h2>No Loan Application</h2>

            <p>
              You have not submitted a loan application yet.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/customer/apply-loan")
              }
            >
              Apply for Loan
            </button>

          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Helper functions
  // --------------------------------------------------

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

  const formatStage = (stage) => {
    const stages = {
      eligibility: "Eligibility",
      emi_selection: "EMI Selection",
      bank_account: "Bank Account",
      declaration: "Declaration",
      selfie: "Selfie Verification",
      admin_review: "Admin Review",
      disbursement: "Disbursement",
      completed: "Completed",
    };

    return stages[stage] || stage;
  };

  const formatStatus = (status) => {
    const statuses = {
      in_progress: "In Progress",
      submitted: "Submitted",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      disbursed: "Disbursed",
    };

    return statuses[status] || status;
  };

  // --------------------------------------------------
  // Current stage
  // --------------------------------------------------

  const currentStage = application.currentStage;

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="application-page">

      <div className="application-card">

        {/* Back Button */}

        <button
          className="back-button"
          onClick={() =>
            navigate("/customer/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        {/* Header */}

        <div className="page-header">

          <h1>My Loan Application</h1>

          <p>
            Track your loan application progress.
          </p>

        </div>

        {/* ------------------------------------------ */}
        {/* Application Status */}
        {/* ------------------------------------------ */}

        <div className="status-section">

          <div className="status-item">

            <span>Status</span>

            <strong
              className={`status-value ${application.status}`}
            >
              {formatStatus(application.status)}
            </strong>

          </div>

          <div className="status-item">

            <span>Current Stage</span>

            <strong>
              {formatStage(currentStage)}
            </strong>

          </div>

        </div>

        {/* ------------------------------------------ */}
        {/* Loan Details */}
        {/* ------------------------------------------ */}

        <div className="details-section">

          <h2>Loan Details</h2>

          <div className="detail-row">

            <span>Requested Loan Amount</span>

            <strong>
              {formatCurrency(
                application.loanDetails?.requestedLoanAmount
              )}
            </strong>

          </div>

          <div className="detail-row">

            <span>Income Type</span>

            <strong>
              {application.loanDetails?.incomeType
                ? application.loanDetails.incomeType
                    .charAt(0)
                    .toUpperCase() +
                  application.loanDetails.incomeType.slice(1)
                : "--"}
            </strong>

          </div>

          <div className="detail-row">

            <span>Income</span>

            <strong>
              {formatCurrency(
                application.loanDetails?.income
              )}
            </strong>

          </div>

          <div className="detail-row">

            <span>Credit Score</span>

            <strong>
              {application.loanDetails?.creditScore ?? "--"}
            </strong>

          </div>

          <div className="detail-row">

            <span>Current Debts</span>

            <strong>
              {formatCurrency(
                application.loanDetails?.currentDebts
              )}
            </strong>

          </div>

          <div className="detail-row">

            <span>Employer</span>

            <strong>
              {application.loanDetails?.employerName ||
                "--"}
            </strong>

          </div>

          <div className="detail-row">

            <span>Designation</span>

            <strong>
              {application.loanDetails?.designation ||
                "--"}
            </strong>

          </div>

        </div>

        {/* ------------------------------------------ */}
        {/* Eligibility Details */}
        {/* ------------------------------------------ */}

        {application.eligibility?.result && (
          <div className="details-section">

            <h2>Eligibility Details</h2>

            <div className="detail-row">

              <span>Credit Assessment</span>

              <strong>
                {application.eligibility
                  .creditScoreAssessment || "--"}
              </strong>

            </div>

            <div className="detail-row">

              <span>Debt-to-Income Ratio</span>

              <strong>
                {application.eligibility
                  .debtToIncomeRatio ?? "--"}
                %
              </strong>

            </div>

            <div className="detail-row">

              <span>Eligibility Result</span>

              <strong
                className={
                  application.eligibility.result ===
                  "not_eligible"
                    ? "rejected"
                    : "success"
                }
              >
                {application.eligibility.result ===
                "eligible"
                  ? "Eligible"
                  : application.eligibility.result ===
                    "partially_eligible"
                  ? "Partially Eligible"
                  : "Not Eligible"}
              </strong>

            </div>

            <div className="detail-row">

              <span>Eligible Loan Amount</span>

              <strong>
                {formatCurrency(
                  application.eligibility
                    .eligibleLoanAmount
                )}
              </strong>

            </div>

          </div>
        )}

        {/* ------------------------------------------ */}
        {/* EMI Details */}
        {/* ------------------------------------------ */}

        {application.emiTerms?.emi && (
          <div className="details-section">

            <h2>EMI Details</h2>

            <div className="detail-row">

              <span>Loan Amount</span>

              <strong>
                {formatCurrency(
                  application.emiTerms.loanAmount
                )}
              </strong>

            </div>

            <div className="detail-row">

              <span>Tenure</span>

              <strong>
                {application.emiTerms.tenure} months
              </strong>

            </div>

            <div className="detail-row">

              <span>Interest Rate</span>

              <strong>
                {application.emiTerms.interestRate}%
              </strong>

            </div>

            <div className="detail-row">

              <span>Monthly EMI</span>

              <strong>
                {formatCurrency(
                  application.emiTerms.emi
                )}
              </strong>

            </div>

            <div className="detail-row">

              <span>Total Interest</span>

              <strong>
                {formatCurrency(
                  application.emiTerms.totalInterest
                )}
              </strong>

            </div>

            <div className="detail-row">

              <span>Total Repayment</span>

              <strong>
                {formatCurrency(
                  application.emiTerms.totalRepayment
                )}
              </strong>

            </div>

          </div>
        )}

        {/* ------------------------------------------ */}
        {/* Next Step */}
        {/* ------------------------------------------ */}

        <div className="next-step">

          <h2>Next Step</h2>

          {/* -------------------------------------- */}
          {/* Eligibility */}
          {/* -------------------------------------- */}

          {currentStage === "eligibility" && (
            <>

              <p>
                Your application is ready for
                eligibility assessment.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    `/customer/eligibility/${application._id}`
                  )
                }
              >
                Check Eligibility
              </button>

            </>
          )}

          {/* -------------------------------------- */}
          {/* EMI */}
          {/* -------------------------------------- */}

          {currentStage === "emi_selection" && (
            <>

              <p>
                Your eligibility has been completed.
                Continue with EMI calculation.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    `/customer/emi/${application._id}`
                  )
                }
              >
                Continue to EMI
              </button>

            </>
          )}

          {/* -------------------------------------- */}
          {/* Bank Account */}
          {/* -------------------------------------- */}

          {currentStage === "bank_account" && (
            <>

              <p>
                Your EMI has been calculated.
                Add your bank account details.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    `/customer/bank-account/${application._id}`
                  )
                }
              >
                Add Bank Account
              </button>

            </>
          )}

          {/* -------------------------------------- */}
          {/* Declaration */}
          {/* -------------------------------------- */}

          {currentStage === "declaration" && (
            <>

              <p>
                Review and accept the loan declaration
                and required consents.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    `/customer/declaration/${application._id}`
                  )
                }
              >
                Continue Declaration
              </button>

            </>
          )}

          {/* -------------------------------------- */}
          {/* Selfie */}
          {/* -------------------------------------- */}

          {currentStage === "selfie" && (
  <>
    <p>
      Your declaration has been completed.
      Upload your selfie for identity verification.
    </p>

    <button
      className="primary-button"
      onClick={() =>
        navigate(
          `/customer/selfie/${application._id}`
        )
      }
    >
      Upload Selfie
    </button>
  </>
)}

          {/* -------------------------------------- */}
          {/* Admin Review */}
          {/* -------------------------------------- */}

          {currentStage === "admin_review" && (
            <div className="waiting-message">

              <h3>Waiting for Admin Review</h3>

              <p>
                Your loan application has completed
                the customer verification process.
              </p>

              <p>
                It is now waiting for admin approval.
              </p>

            </div>
          )}

          {/* -------------------------------------- */}
          {/* Disbursement */}
          {/* -------------------------------------- */}

          {currentStage === "disbursement" && (
            <div className="waiting-message">

              <h3>Loan Approved</h3>

              <p>
                Your loan has been approved and is
                ready for disbursement.
              </p>

            </div>
          )}

          {/* -------------------------------------- */}
          {/* Completed */}
          {/* -------------------------------------- */}

          {currentStage === "completed" && (
            <div className="success-message">

              <h3>Loan Process Completed</h3>

              <p>
                Your loan process has been completed
                successfully.
              </p>

            </div>
          )}

          {/* -------------------------------------- */}
          {/* Rejected */}
          {/* -------------------------------------- */}

          {application.status === "rejected" && (
            <div className="rejected-message">

              <h3>Application Rejected</h3>

              <p>
                Your loan application has been
                rejected.
              </p>

              {application.adminReview
                ?.rejectionReason && (
                <p>
                  <strong>Reason:</strong>{" "}
                  {
                    application.adminReview
                      .rejectionReason
                  }
                </p>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default MyApplication;