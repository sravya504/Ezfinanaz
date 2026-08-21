import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/verifyphone.scss";

const API_URL =
  "https://ezfinanaz-backend1.onrender.com";

function VerifyPhone() {
  const navigate = useNavigate();

  // ==========================================
  // GET USER
  // ==========================================

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const userId = user?.id;

  // ==========================================
  // STATE
  // ==========================================

  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [sendingOtp, setSendingOtp] =
    useState(false);

  // ==========================================
  // SEND OTP
  // ==========================================

  const sendOtp = async () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError(
        "User information not found. Please login again."
      );
      return;
    }

    if (!phone || phone.length < 10) {
      setError(
        "Please enter a valid phone number."
      );
      return;
    }

    setSendingOtp(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/send-phone-otp`,
        {
          userId,
          phone,
        }
      );

      console.log(
        "Phone OTP:",
        response.data.otp
      );

      // TEMPORARY TESTING
      setMessage(
        `OTP sent successfully`
      );

    } catch (error) {
      console.error(
        "Send OTP error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );

    } finally {
      setSendingOtp(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!userId) {
      setError(
        "User information not found. Please login again."
      );
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/verify-phone-otp`,
        {
          userId,
          otp,
        }
      );

      // ==========================================
      // UPDATE USER
      // ==========================================

      const updatedUser = {
        ...user,
        phone: phone,
        phoneVerified: true,
        kycCompleted:
          response.data.kycCompleted === true,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessage(
        "Phone verified successfully!"
      );

      // ==========================================
      // REDIRECT
      // ==========================================

      if (
        response.data.kycCompleted === true
      ) {
        navigate(
          "/customer/dashboard"
        );
      } else {
        navigate("/customer/kyc");
      }

    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NO USER
  // ==========================================

  if (!userId) {
    return (
      <div className="verify-phone-page">
        <div className="verify-phone-card">

          <h1>Verify Phone Number</h1>

          <p>
            User information was not found.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/")}
          >
            Go to Login
          </button>

        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="verify-phone-page">

      <div className="verify-phone-card">

        {/* HEADER */}

        <div className="verify-phone-header">

          <h1>
            Verify Phone Number
          </h1>

          <p>
            Enter your phone number to
            continue.
          </p>

        </div>

        {/* PHONE NUMBER */}

        <div className="form-group">

          <label htmlFor="phone">
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              const value =
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

              setPhone(value);
            }}
            placeholder="Enter 10-digit phone number"
            maxLength={10}
            autoComplete="tel"
          />

        </div>

        {/* SEND OTP */}

        <button
          type="button"
          className="primary-button"
          onClick={sendOtp}
          disabled={
            sendingOtp ||
            phone.length !== 10
          }
        >
          {sendingOtp
            ? "Sending OTP..."
            : "Send OTP"}
        </button>

        {/* MESSAGE */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* OTP FORM */}

        <form
          className="otp-form"
          onSubmit={verifyOtp}
        >

          <div className="form-group">

            <label htmlFor="otp">
              Enter OTP
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const value =
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);
              }}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              autoComplete="one-time-code"
            />

          </div>

          {/* VERIFY */}

          <button
            type="submit"
            className="primary-button"
            disabled={
              loading ||
              otp.length !== 6
            }
          >
            {loading
              ? "Verifying..."
              : "Verify Phone"}
          </button>

        </form>

        {/* RESEND */}

        <button
          type="button"
          className="resend-button"
          onClick={sendOtp}
          disabled={
            sendingOtp ||
            phone.length !== 10
          }
        >
          {sendingOtp
            ? "Sending..."
            : "Resend OTP"}
        </button>

      </div>

    </div>
  );
}

export default VerifyPhone;