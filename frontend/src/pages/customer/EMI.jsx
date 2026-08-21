import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/emi.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function EMI() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);

  const [loanAmount, setLoanAmount] = useState("");
  const [tenure, setTenure] = useState("");

  const [emiTerms, setEmiTerms] = useState(null);

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH APPLICATION
  // ==========================================

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

        // ------------------------------------------
        // Existing EMI calculation
        // ------------------------------------------

        if (app.emiTerms?.emi) {
          setEmiTerms(app.emiTerms);
          setLoanAmount(app.emiTerms.loanAmount);
          setTenure(app.emiTerms.tenure);
        }

        // ------------------------------------------
        // Set default loan amount
        // ------------------------------------------

        if (
          !app.emiTerms?.loanAmount &&
          app.eligibility?.eligibleLoanAmount
        ) {
          setLoanAmount(
            app.eligibility.eligibleLoanAmount
          );
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

  // ==========================================
  // CALCULATE EMI
  // ==========================================

  const handleCalculateEMI = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      setCalculating(true);
      setError("");

      if (!loanAmount || Number(loanAmount) <= 0) {
        setError("Please enter a valid loan amount.");
        return;
      }

      if (!tenure) {
        setError("Please select a repayment tenure.");
        return;
      }

      const eligibleAmount =
        application?.eligibility?.eligibleLoanAmount || 0;

      if (Number(loanAmount) > Number(eligibleAmount)) {
        setError(
          `Loan amount cannot exceed ₹${Number(
            eligibleAmount
          ).toLocaleString("en-IN")}.`
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/loans/${applicationId}/emi`,
        {
          loanAmount: Number(loanAmount),
          tenure: Number(tenure),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("EMI response:", response.data);

      setEmiTerms(response.data.emiTerms);

      // Update local application stage
      setApplication((prev) => ({
        ...prev,
        emiTerms: response.data.emiTerms,
        currentStage: response.data.currentStage,
      }));

    } catch (err) {
      console.error("EMI calculation error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to calculate EMI."
      );
    } finally {
      setCalculating(false);
    }
  };

  // ==========================================
  // CONTINUE TO BANK ACCOUNT
  // ==========================================

  const handleContinue = () => {
    navigate(
      `/customer/bank-account/${applicationId}`
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="emi-page">
        <div className="emi-card">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR WITHOUT APPLICATION
  // ==========================================

  if (error && !application) {
    return (
      <div className="emi-page">
        <div className="emi-card">

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

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="emi-page">

      <div className="emi-card">

        {/* BACK */}

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

          <h1>Calculate EMI</h1>

          <p>
            Select your loan amount and repayment
            tenure to calculate your EMI.
          </p>

        </div>

        {/* APPLICATION SUMMARY */}

        {application && (
          <div className="loan-summary">

            <h2>Loan Eligibility</h2>

            <div className="detail-row">
              <span>Requested Amount</span>

              <strong>
                ₹
                {Number(
                  application.loanDetails
                    ?.requestedLoanAmount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="detail-row">
              <span>Eligible Loan Amount</span>

              <strong>
                ₹
                {Number(
                  application.eligibility
                    ?.eligibleLoanAmount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="detail-row">
              <span>Eligibility Result</span>

              <strong>
                {application.eligibility?.result
                  ?.replace("_", " ")
                  ?.toUpperCase()}
              </strong>
            </div>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* ==========================================
            EMI FORM
        ========================================== */}

        {!emiTerms && (
          <form
            className="emi-form"
            onSubmit={handleCalculateEMI}
          >

            <div className="form-group">

              <label>
                Loan Amount
              </label>

              <input
                type="number"
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(e.target.value)
                }
                placeholder="Enter loan amount"
                min="1"
                required
              />

              <small>
                Maximum eligible amount: ₹
                {Number(
                  application?.eligibility
                    ?.eligibleLoanAmount || 0
                ).toLocaleString("en-IN")}
              </small>

            </div>

            <div className="form-group">

              <label>
                Repayment Tenure
              </label>

              <select
                value={tenure}
                onChange={(e) =>
                  setTenure(e.target.value)
                }
                required
              >

                <option value="">
                  Select tenure
                </option>

                <option value="6">
                  6 Months
                </option>

                <option value="12">
                  12 Months
                </option>

                <option value="18">
                  18 Months
                </option>

                <option value="24">
                  24 Months
                </option>

                <option value="36">
                  36 Months
                </option>

              </select>

            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={calculating}
            >
              {calculating
                ? "Calculating EMI..."
                : "Calculate EMI"}
            </button>

          </form>
        )}

        {/* ==========================================
            EMI RESULT
        ========================================== */}

        {emiTerms && (
          <div className="emi-result">

            <h2>EMI Details</h2>

            <div className="emi-highlight">

              <span>
                Monthly EMI
              </span>

              <strong>
                ₹
                {Number(
                  emiTerms.emi || 0
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            <div className="result-details">

              <div className="result-item">
                <span>Loan Amount</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.loanAmount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Tenure</span>

                <strong>
                  {emiTerms.tenure} Months
                </strong>
              </div>

              <div className="result-item">
                <span>Interest Rate</span>

                <strong>
                  {emiTerms.interestRate}%
                </strong>
              </div>

              <div className="result-item">
                <span>Total Interest</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.totalInterest || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Processing Fee</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.processingFee || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>GST</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.gst || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Other Charges</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.otherCharges || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Total Charges</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.totalCharges || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Total Repayment</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.totalRepayment || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Net Disbursement</span>

                <strong>
                  ₹
                  {Number(
                    emiTerms.netDisbursementAmount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="result-item">
                <span>Annual IRR</span>

                <strong>
                  {emiTerms.irr}%
                </strong>
              </div>

            </div>

            {/* CONTINUE */}

            <button
              className="primary-button"
              onClick={handleContinue}
            >
              Continue to Bank Account
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default EMI;