import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import GoogleButton from "./GoogleButton";
import "../style/login.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com/";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SHOW / HIDE PASSWORD
  // ==========================================

  const [showPassword, setShowPassword] =
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
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        formData
      );

      const { token, user } = response.data;

      // Save authentication
      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ==========================================
      // ADMIN
      // ==========================================

      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      // ==========================================
      // CUSTOMER
      // ==========================================

      if (user.role === "customer") {

        // Phone verification
        if (!user.phoneVerified) {
          navigate("/customer/verify-phone");
          return;
        }

        // KYC
        if (!user.kycCompleted) {
          navigate("/customer/kyc");
          return;
        }

        // Dashboard
        navigate("/customer/dashboard");
        return;
      }

      // ==========================================
      // UNKNOWN ROLE
      // ==========================================

      setError("Invalid user role.");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="login-header">

          <h1>EZFINANZ</h1>

          <p className="login-subtitle">
            Login to your account
          </p>

        </div>

        {/* ======================================
            LOGIN FORM
        ====================================== */}

        <form onSubmit={handleSubmit}>

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

          {/* PASSWORD */}

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
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-eye-button"
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

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* ======================================
            GOOGLE LOGIN
        ====================================== */}

        <div className="or-divider">
          <span>OR</span>
        </div>

        <GoogleButton />

        {/* ======================================
            SIGNUP
        ====================================== */}

        <div className="register-link">

          <span>
            Don't have an account?
          </span>

          <Link to="/signup">
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;