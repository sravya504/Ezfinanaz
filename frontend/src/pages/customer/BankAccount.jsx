import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/bank-account.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function BankAccount() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);

  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

        // If bank details already exist
        if (app.bankDetails) {
          setFormData({
            accountHolderName:
              app.bankDetails.accountHolderName || "",
            accountNumber:
              app.bankDetails.accountNumber || "",
            ifscCode:
              app.bankDetails.ifscCode || "",
            bankName:
              app.bankDetails.bankName || "",
          });
        }

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

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "ifscCode"
          ? value.toUpperCase()
          : value,
    }));
  };

  // ==========================================
  // SUBMIT BANK ACCOUNT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API_URL}/api/loans/${applicationId}/bank-account`,
        {
          accountHolderName:
            formData.accountHolderName.trim(),

          accountNumber:
            formData.accountNumber.trim(),

          ifscCode:
            formData.ifscCode.trim().toUpperCase(),

          bankName:
            formData.bankName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Bank account response:",
        response.data
      );

      setMessage(
        "Bank account verified successfully."
      );

      // Update local application stage
      setApplication((prev) => ({
        ...prev,
        bankDetails: response.data.bankDetails,
        currentStage: response.data.currentStage,
      }));

      // Move to declaration
      setTimeout(() => {
        navigate(
          `/customer/declaration/${applicationId}`
        );
      }, 1000);

    } catch (err) {
      console.error(
        "Bank account error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to verify bank account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="bank-page">
        <div className="bank-card">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !application) {
    return (
      <div className="bank-page">
        <div className="bank-card">

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
  // MAIN UI
  // ==========================================

  return (
    <div className="bank-page">

      <div className="bank-card">

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

          <h1>Bank Account Details</h1>

          <p>
            Enter the bank account details where
            your approved loan will be disbursed.
          </p>

        </div>

        {/* EMI SUMMARY */}

        {application?.emiTerms && (
          <div className="loan-summary">

            <h2>Loan Summary</h2>

            <div className="detail-row">

              <span>
                Loan Amount
              </span>

              <strong>
                ₹
                {Number(
                  application.emiTerms.loanAmount || 0
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            <div className="detail-row">

              <span>
                Monthly EMI
              </span>

              <strong>
                ₹
                {Number(
                  application.emiTerms.emi || 0
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            <div className="detail-row">

              <span>
                Tenure
              </span>

              <strong>
                {application.emiTerms.tenure} Months
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

        {/* SUCCESS */}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {/* FORM */}

        <form
          className="bank-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Account Holder Name
            </label>

            <input
              type="text"
              name="accountHolderName"
              value={
                formData.accountHolderName
              }
              onChange={handleChange}
              placeholder="Enter account holder name"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Account Number
            </label>

            <input
              type="text"
              name="accountNumber"
              value={
                formData.accountNumber
              }
              onChange={handleChange}
              placeholder="Enter account number"
              required
            />

          </div>

          <div className="form-group">

            <label>
              IFSC Code
            </label>

            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="Example: SBIN0001234"
              maxLength="11"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Bank Name
            </label>

            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter bank name"
              required
            />

          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >
            {submitting
              ? "Verifying Account..."
              : "Verify Bank Account"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default BankAccount;