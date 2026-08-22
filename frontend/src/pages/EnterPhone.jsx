import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/enterphone.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function EnterPhone() {
  const navigate = useNavigate();


  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const userId = user?.id;

  
  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  
  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setPhone(value);
    setError("");
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    

    if (!userId) {
      setError(
        "User information not found. Please login again."
      );
      return;
    }

    

    if (phone.length !== 10) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    setLoading(true);

    try {
      

      const response = await axios.post(
        `${API_URL}/api/auth/add-phone`,
        {
          userId,
          phone,
        }
      );

     

      const updatedUser = {
        ...user,
        phone: response.data.phone || phone,
        phoneVerified: false,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      
      

      navigate("/verify-phone");

    } catch (error) {
      console.error(
        "Add phone error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save phone number. Please try again."
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
      <div className="enter-phone-page">

        <div className="enter-phone-card">

          <h1>Enter Phone Number</h1>

          <p>
            User information was not found.
          </p>

          <button
            type="button"
            className="primary-button"
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
    <div className="enter-phone-page">

      <div className="enter-phone-card">

        {/* HEADER */}

        <div className="enter-phone-header">

          <h1>
            Enter Phone Number
          </h1>

          <p>
            Enter your phone number to continue.
            We will send you an OTP for verification.
          </p>

        </div>

        {/* USER EMAIL */}

        <div className="email-display">

          <span>
            Google Account
          </span>

          <strong>
            {user.email}
          </strong>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="phone">
              Phone Number
            </label>

            <div className="phone-input-wrapper">

              <span className="country-code">
                +91
              </span>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                maxLength={10}
                autoComplete="tel"
                required
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
            disabled={
              loading ||
              phone.length !== 10
            }
          >
            {loading
              ? "Saving..."
              : "Continue"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default EnterPhone;