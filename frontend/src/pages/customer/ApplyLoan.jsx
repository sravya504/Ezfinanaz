import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../style/apply-loan.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function ApplyLoan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    requestedLoanAmount: "",
    incomeType: "monthly",
    income: "",
    creditScore: "",
    currentDebts: "",
    employerName: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/loans/`,
        {
          requestedLoanAmount: Number(formData.requestedLoanAmount),
          incomeType: formData.incomeType,
          income: Number(formData.income),
          creditScore: Number(formData.creditScore),
          currentDebts: Number(formData.currentDebts),
          employerName: formData.employerName,
          designation: formData.designation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Loan application submitted successfully.");

      console.log("Application:", response.data);

      setTimeout(() => {
        navigate("/customer/application");
      }, 1000);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to submit loan application."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-loan-page">

      <div className="apply-loan-card">

        <button
          className="back-button"
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="page-header">
          <h1>Apply for Loan</h1>

          <p>
            Enter your financial and employment details.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Requested Loan Amount</label>

            <input
              type="number"
              name="requestedLoanAmount"
              value={formData.requestedLoanAmount}
              onChange={handleChange}
              placeholder="Enter loan amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Income Type</label>

            <select
              name="incomeType"
              value={formData.incomeType}
              onChange={handleChange}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div className="form-group">
            <label>Income</label>

            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              placeholder="Enter your income"
              required
            />
          </div>

          <div className="form-group">
            <label>Credit Score</label>

            <input
              type="number"
              name="creditScore"
              value={formData.creditScore}
              onChange={handleChange}
              placeholder="Example: 780"
              required
            />
          </div>

          <div className="form-group">
            <label>Current Debts</label>

            <input
              type="number"
              name="currentDebts"
              value={formData.currentDebts}
              onChange={handleChange}
              placeholder="Enter current debts"
              required
            />
          </div>

          <div className="form-group">
            <label>Employer Name</label>

            <input
              type="text"
              name="employerName"
              value={formData.employerName}
              onChange={handleChange}
              placeholder="Example: ABC Technologies"
              required
            />
          </div>

          <div className="form-group">
            <label>Designation</label>

            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Example: Software Engineer"
              required
            />
          </div>

          {error && (
            <div className="form-message error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-message success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default ApplyLoan;