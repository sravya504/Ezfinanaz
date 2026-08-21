import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import "../style/signup.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com/";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // PASSWORD VISIBILITY
  // ==========================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // SIGNUP
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }
      );

      setSuccess(
        "Registration successful. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="signup-page">

      <div className="signup-card">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="signup-header">

          <h1>EZFINANZ</h1>

          <p>
            Create your account
          </p>

        </div>

        {/* ==========================================
            SIGNUP FORM
        ========================================== */}

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}

          <div className="form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>

          {/* PHONE */}

          <div className="form-group">

            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              required
            />

          </div>

          {/* ==========================================
              PASSWORD
          ========================================== */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                👁
              </button>

            </div>

          </div>

          {/* ==========================================
              CONFIRM PASSWORD
          ========================================== */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                👁
              </button>

            </div>

          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <p className="signup-message error">
              {error}
            </p>
          )}

          {/* ==========================================
              SUCCESS
          ========================================== */}

          {success && (
            <p className="signup-message success">
              {success}
            </p>
          )}

          {/* ==========================================
              CREATE ACCOUNT
          ========================================== */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* ==========================================
            LOGIN LINK
        ========================================== */}

        <div className="login-link">

          <span>
            Already have an account?
          </span>

          <Link to="/">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Signup;