import { useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function GoogleButton() {
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleGoogleResponse = async (response) => {
    try {
      const result = await axios.post(
        `${API_URL}/api/auth/google`,
        {
          credential: response.credential,
        }
      );

      const { token, user } = result.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ADMIN
      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      // CUSTOMER
      if (user.role === "customer") {

        if (!user.phoneVerified) {
          navigate("/customer/verify-phone");
          return;
        }

        if (!user.kycCompleted) {
          navigate("/customer/kyc");
          return;
        }

        navigate("/customer/dashboard");
      }

    } catch (error) {
      console.error(
        "Google authentication error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Google login failed."
      );
    }
  };

  useEffect(() => {

    const initializeGoogle = () => {

      if (
        !window.google ||
        !googleButtonRef.current
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id:
          import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 350,
          text: "continue_with",
        }
      );
    };

    if (window.google) {

      initializeGoogle();

    } else {

      const interval = setInterval(() => {

        if (window.google) {

          clearInterval(interval);
          initializeGoogle();

        }

      }, 100);

      return () => clearInterval(interval);
    }

  }, []);

  return (
    <div
      ref={googleButtonRef}
      className="google-button"
    />
  );
}

export default GoogleButton;