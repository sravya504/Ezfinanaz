import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../../style/kyc.scss";

const API_URL = "http://localhost:5000";

function KYC() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    currentAddress: "",
    idType: "",
    idNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // CHECK EXISTING KYC
  // ==========================================

  useEffect(() => {
    const checkKYC = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/kyc`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const kyc =
          response.data.kyc;

        // ======================================
        // ALREADY COMPLETED
        // ======================================

        if (kyc?.completed === true) {
          navigate("/customer/dashboard");
          return;
        }

        // ======================================
        // LOAD EXISTING DATA IF ANY
        // ======================================

        if (kyc) {
          setFormData({
            fullName:
              kyc.fullName || "",

            dateOfBirth:
              kyc.dateOfBirth
                ? new Date(
                    kyc.dateOfBirth
                  )
                    .toISOString()
                    .substring(0, 10)
                : "",

            gender:
              kyc.gender || "",

            currentAddress:
              kyc.currentAddress || "",

            idType:
              kyc.idType || "",

            idNumber:
              kyc.idNumber || "",
          });
        }

      } catch (err) {
        console.error(
          "KYC fetch error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load KYC details."
        );

      } finally {
        setLoading(false);
      }
    };

    checkKYC();
  }, [navigate]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT KYC
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      setSubmitting(true);
      setError("");

      await axios.post(
        `${API_URL}/api/kyc`,
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      // ======================================
      // UPDATE LOCAL USER
      // ======================================

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const user =
          JSON.parse(storedUser);

        user.kycCompleted = true;

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      // ======================================
      // GO TO DASHBOARD
      // ======================================

      navigate("/customer/dashboard");

    } catch (err) {
      console.error(
        "KYC submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to submit KYC."
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
      <div className="kyc-page">
        <div className="kyc-card">
          <p>
            Loading KYC...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="kyc-page">

      <div className="kyc-card">

        <div className="kyc-header">

          <h1>
            KYC Verification
          </h1>

          <p>
            Please provide your identity
            and address details before
            continuing.
          </p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          {/* FULL NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={
                formData.fullName
              }
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

          </div>

          {/* DATE OF BIRTH */}

          <div className="form-group">

            <label>
              Date of Birth
            </label>

            <input
              type="date"
              name="dateOfBirth"
              value={
                formData.dateOfBirth
              }
              onChange={handleChange}
              required
            />

          </div>

          {/* GENDER */}

          <div className="form-group">

            <label>
              Gender
            </label>

            <select
              name="gender"
              value={
                formData.gender
              }
              onChange={handleChange}
              required
            >

              <option value="">
                Select Gender
              </option>

              <option value="male">
                Male
              </option>

              <option value="female">
                Female
              </option>

              <option value="other">
                Other
              </option>

            </select>

          </div>

          {/* ADDRESS */}

          <div className="form-group">

            <label>
              Current Address
            </label>

            <textarea
              name="currentAddress"
              value={
                formData.currentAddress
              }
              onChange={handleChange}
              placeholder="Enter your current address"
              rows="4"
              required
            />

          </div>

          {/* ID TYPE */}

          <div className="form-group">

            <label>
              ID Type
            </label>

            <select
              name="idType"
              value={
                formData.idType
              }
              onChange={handleChange}
              required
            >

              <option value="">
                Select ID Type
              </option>

              <option value="PAN">
                PAN
              </option>

              <option value="Aadhaar">
                Aadhaar
              </option>

            </select>

          </div>

          {/* ID NUMBER */}

          <div className="form-group">

            <label>
              ID Number
            </label>

            <input
              type="text"
              name="idNumber"
              value={
                formData.idNumber
              }
              onChange={handleChange}
              placeholder="Enter your ID number"
              required
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >

            {submitting
              ? "Submitting KYC..."
              : "Submit KYC"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default KYC;