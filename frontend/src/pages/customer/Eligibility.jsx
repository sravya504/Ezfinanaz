import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/eligibility.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function Eligibility() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

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

        const app = response.data.application;

        if (!app) {
          setError("No loan application found.");
          return;
        }

        setApplication(app);

        // Existing eligibility result
        if (app.eligibility?.result) {
          setEligibility(app.eligibility);
        }
      } catch (err) {
        console.error("Fetch application error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load loan application."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [navigate]);



  const handleCheckEligibility = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      setChecking(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/loans/${applicationId}/eligibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Eligibility response:", response.data);

      // Update eligibility directly from backend
      setEligibility(response.data.eligibility);

      // Update current stage locally
      setApplication((prev) => ({
        ...prev,
        eligibility: response.data.eligibility,
        currentStage: response.data.currentStage,
      }));
    } catch (err) {
      console.error("Eligibility error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to check eligibility."
      );
    } finally {
      setChecking(false);
    }
  };

  
  const handleContinueToEMI = () => {
    navigate(`/customer/emi/${applicationId}`);
  };

  if (loading) {
    return (
      <div className="eligibility-page">
        <div className="eligibility-card">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  

  if (error && !application) {
    return (
      <div className="eligibility-page">
        <div className="eligibility-card">

          <button
            className="back-button"
            onClick={() =>
              navigate("/customer/application")
            }
          >
            ← Back to Application
          </button>

          <p className="error-message">
            {error}
          </p>

        </div>
      </div>
    );
  }

 
  return (
    <div className="eligibility-page">

      <div className="eligibility-card">

        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() =>
            navigate("/customer/application")
          }
        >
          ← Back to Application
        </button>

        {/* HEADER */}

        <div className="page-header">

          <h1>Loan Eligibility</h1>

          <p>
            Check your eligibility based on your
            financial information.
          </p>

        </div>

        {/* APPLICATION DETAILS */}

        {application && (
          <div className="loan-summary">

            <h2>Application Details</h2>

            <div className="detail-row">
              <span>Requested Loan Amount</span>

              <strong>
                ₹
                {application.loanDetails?.requestedLoanAmount?.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>Income Type</span>

              <strong>
                {application.loanDetails?.incomeType}
              </strong>
            </div>

            <div className="detail-row">
              <span>Income</span>

              <strong>
                ₹
                {application.loanDetails?.income?.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>Credit Score</span>

              <strong>
                {application.loanDetails?.creditScore}
              </strong>
            </div>

            <div className="detail-row">
              <span>Current Debts</span>

              <strong>
                
                {application.loanDetails?.currentDebts?.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>Current Stage</span>

              <strong>
                {application.currentStage}
              </strong>
            </div>

          </div>
        )}

        

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

       

        {!eligibility && (
          <div className="check-section">

            <h2>Check Eligibility</h2>

            <p>
              Click the button below to check whether
              you are eligible for the requested loan.
            </p>

            <button
              className="primary-button"
              onClick={handleCheckEligibility}
              disabled={checking}
            >
              {checking
                ? "Checking Eligibility..."
                : "Check Eligibility"}
            </button>

          </div>
        )}

        

        {eligibility && (
          <div className="result-section">

            <h2>Eligibility Result</h2>

            {/* RESULT STATUS */}

            <div
              className={`result-status ${
                eligibility.result === "eligible" ||
                eligibility.result === "partially_eligible"
                  ? "eligible"
                  : "not-eligible"
              }`}
            >
              {eligibility.result === "eligible"
                ? "Eligible"
                : eligibility.result === "partially_eligible"
                ? "Partially Eligible"
                : "Not Eligible"}
            </div>

            {/* RESULT DETAILS */}

            <div className="result-details">

              <div className="result-item">

                <span>
                  Credit Score Assessment
                </span>

                <strong>
                  {eligibility.creditScoreAssessment ||
                    "Not available"}
                </strong>

              </div>

              <div className="result-item">

                <span>
                  Debt-to-Income Ratio
                </span>

                <strong>
                  {eligibility.debtToIncomeRatio ?? "--"}%
                </strong>

              </div>

              <div className="result-item">

                <span>
                  Eligible Loan Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    eligibility.eligibleLoanAmount || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>

            </div>

            

            {(
              eligibility.result === "eligible" ||
              eligibility.result === "partially_eligible"
            ) && (
              <div className="continue-section">

                <p>
                  Your eligibility has been successfully
                  calculated.
                </p>

                <button
                  className="primary-button"
                  onClick={handleContinueToEMI}
                >
                  Continue to EMI Calculation
                </button>

              </div>
            )}

           

            {eligibility.result === "not_eligible" && (
              <div className="not-eligible-message">

                <p>
                  You are currently not eligible for
                  the requested loan amount.
                </p>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate("/customer/dashboard")
                  }
                >
                  Back to Dashboard
                </button>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Eligibility;