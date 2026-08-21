// 


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/admin-dashboard.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data.applications || []);
    } catch (err) {
      console.error("Fetch applications error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // =====================================================
  // FORMAT STAGE
  // =====================================================

  const formatStage = (stage) => {
    const stages = {
      eligibility: "Eligibility",
      emi_selection: "EMI Selection",
      bank_account: "Bank Account",
      declaration: "Declaration",
      selfie: "Selfie Pending",
      admin_review: "Admin Review",
      disbursement: "Disbursement",
      completed: "Completed",
    };

    return stages[stage] || stage || "--";
  };

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

  const formatDate = (date) => {
    if (!date) {
      return "--";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =====================================================
  // GET APPLICANT NAME
  // =====================================================

  const getApplicantName = (application) => {
    return (
      application.user?.fullName ||
      application.kyc?.fullName ||
      "--"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-card">
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-dashboard-page">

      <div className="admin-dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="admin-header">

          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Review and manage customer loan
              applications.
            </p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="summary-card">

          <div>
            <span>Total Applications</span>

            <strong>
              {applications.length}
            </strong>
          </div>

          <div>
            <span>Pending Review</span>

            <strong>
              {
                applications.filter(
                  (application) =>
                    application.currentStage ===
                    "admin_review"
                ).length
              }
            </strong>
          </div>

        </div>

        {/* =================================================
            APPLICATIONS
        ================================================= */}

        <div className="applications-card">

          <div className="section-header">

            <h2>Loan Applications</h2>

            <button
              className="refresh-button"
              onClick={fetchApplications}
            >
              Refresh
            </button>

          </div>

          {/* =================================================
              NO APPLICATIONS
          ================================================= */}

          {applications.length === 0 ? (

            <div className="empty-state">

              <h3>No Applications</h3>

              <p>
                No loan applications have been
                submitted yet.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Applicant</th>
                    <th>Loan Amount</th>
                    <th>Tenure</th>
                    <th>Current Stage</th>
                    <th>Submission Date</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {applications.map(
                    (application) => (

                      <tr
                        key={application._id}
                      >

                        {/* APPLICANT */}

                        <td>

                          <strong>
                            {getApplicantName(
                              application
                            )}
                          </strong>

                          <small>
                            {application.user?.email ||
                              "--"}
                          </small>

                        </td>

                        {/* LOAN AMOUNT */}

                        <td>
                          {formatCurrency(
                            application
                              .loanDetails
                              ?.requestedLoanAmount
                          )}
                        </td>

                        {/* TENURE */}

                        <td>

                          {application.emiTerms
                            ?.tenure
                            ? `${application.emiTerms.tenure} months`
                            : "--"}

                        </td>

                        {/* CURRENT STAGE */}

                        <td>

                          <span
                            className={`stage-badge ${
                              application.currentStage ||
                              ""
                            }`}
                          >
                            {formatStage(
                              application.currentStage
                            )}
                          </span>

                        </td>

                        {/* SUBMISSION DATE */}

                        <td>
                          {formatDate(
                            application.createdAt
                          )}
                        </td>

                        {/* VIEW */}

                        <td>

                          <button
                            className="view-button"
                            onClick={() =>
                              navigate(
                                `/admin/applications/${application._id}`
                              )
                            }
                          >
                            View Application
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
