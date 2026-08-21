import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/declaration.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function Declaration() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);

  const [loanInformationConfirmed, setLoanInformationConfirmed] =
    useState(false);

  const [termsAndChargesConfirmed, setTermsAndChargesConfirmed] =
    useState(false);

  const [creditCheckConsent, setCreditCheckConsent] =
    useState(false);

  const [digitalProcessingConsent, setDigitalProcessingConsent] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // FETCH APPLICATION
  // --------------------------------------------------

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

        // Make sure this is the requested application
        if (String(app._id) !== String(applicationId)) {
          setError("Application not found.");
          return;
        }

        setApplication(app);

        // If declaration was already submitted,
        // restore the checked values.
        if (app.declaration) {
          setLoanInformationConfirmed(
            app.declaration.loanInformationConfirmed || false
          );

          setTermsAndChargesConfirmed(
            app.declaration.termsAndChargesConfirmed || false
          );

          setCreditCheckConsent(
            app.declaration.creditCheckConsent || false
          );

          setDigitalProcessingConsent(
            app.declaration.digitalProcessingConsent || false
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load application."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [navigate, applicationId]);

  // --------------------------------------------------
  // SUBMIT DECLARATION
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (
      !loanInformationConfirmed ||
      !termsAndChargesConfirmed ||
      !creditCheckConsent ||
      !digitalProcessingConsent
    ) {
      setError(
        "You must accept all declarations and consents before continuing."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/loans/${applicationId}/declaration`,
        {
          loanInformationConfirmed,
          termsAndChargesConfirmed,
          creditCheckConsent,
          digitalProcessingConsent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Declaration response:", response.data);

      setSuccess(
        "Declaration submitted successfully."
      );

      // Backend moves the application to selfie stage.
      setTimeout(() => {
        navigate(
          `/customer/selfie/${applicationId}`
        );
      }, 1000);
    } catch (err) {
      console.error("Declaration error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to submit declaration."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="declaration-page">
        <div className="declaration-card">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR WITHOUT APPLICATION
  // --------------------------------------------------

  if (error && !application) {
    return (
      <div className="declaration-page">
        <div className="declaration-card">

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

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="declaration-page">

      <div className="declaration-card">

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

          <h1>Loan Declaration</h1>

          <p>
            Review the information below and provide
            the required confirmations before proceeding.
          </p>

        </div>

        {/* LOAN SUMMARY */}

        {application && (
          <div className="loan-summary">

            <h2>Loan Summary</h2>

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
              <span>Selected Loan Amount</span>

              <strong>
                ₹
                {application.emiTerms?.loanAmount?.toLocaleString(
                  "en-IN"
                ) || "--"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Tenure</span>

              <strong>
                {application.emiTerms?.tenure
                  ? `${application.emiTerms.tenure} months`
                  : "--"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Interest Rate</span>

              <strong>
                {application.emiTerms?.interestRate
                  ? `${application.emiTerms.interestRate}%`
                  : "--"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Monthly EMI</span>

              <strong>
                ₹
                {application.emiTerms?.emi?.toLocaleString(
                  "en-IN"
                ) || "--"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Total Repayment</span>

              <strong>
                ₹
                {application.emiTerms?.totalRepayment?.toLocaleString(
                  "en-IN"
                ) || "--"}
              </strong>
            </div>

          </div>
        )}

        {/* DECLARATIONS */}

        <form
          className="declaration-form"
          onSubmit={handleSubmit}
        >

          <div className="declaration-section">

            <h2>Confirmations & Consents</h2>

            {/* 1 */}

            <label className="checkbox-row">

              <input
                type="checkbox"
                checked={loanInformationConfirmed}
                onChange={(e) =>
                  setLoanInformationConfirmed(
                    e.target.checked
                  )
                }
              />

              <span>
                I confirm that the loan information and
                financial details provided by me are
                accurate and complete.
              </span>

            </label>

            {/* 2 */}

            <label className="checkbox-row">

              <input
                type="checkbox"
                checked={termsAndChargesConfirmed}
                onChange={(e) =>
                  setTermsAndChargesConfirmed(
                    e.target.checked
                  )
                }
              />

              <span>
                I have reviewed and agree to the loan
                terms, interest rate, processing fee,
                GST and other applicable charges.
              </span>

            </label>

            {/* 3 */}

            <label className="checkbox-row">

              <input
                type="checkbox"
                checked={creditCheckConsent}
                onChange={(e) =>
                  setCreditCheckConsent(
                    e.target.checked
                  )
                }
              />

              <span>
                I authorize EZFINANZ to perform the
                necessary credit checks and verification
                required for processing my loan application.
              </span>

            </label>

            {/* 4 */}

            <label className="checkbox-row">

              <input
                type="checkbox"
                checked={digitalProcessingConsent}
                onChange={(e) =>
                  setDigitalProcessingConsent(
                    e.target.checked
                  )
                }
              />

              <span>
                I consent to the digital processing and
                verification of my loan application and
                supporting information.
              </span>

            </label>

          </div>

          {/* ERROR */}

          {error && (
            <div className="form-message error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="form-message success">
              {success}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >
            {submitting
              ? "Submitting Declaration..."
              : "Accept & Continue"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Declaration;