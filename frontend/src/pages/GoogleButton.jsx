import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function GoogleButton() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google credential received");

      const response = await axios.post(
        `${API_URL}/api/auth/google`,
        {
          credential: credentialResponse.credential,
        }
      );

      const { token, user } = response.data;

      // Save authentication
      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      

      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      

      if (user.role === "customer") {

        
        

        
        if (!user.kycCompleted) {
          navigate("/customer/kyc");
          return;
        }

        // Everything completed.
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

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div className="google-button">

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="350"
      />

    </div>
  );
}

export default GoogleButton;