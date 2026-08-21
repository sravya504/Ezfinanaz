import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/customer-dashboard.scss";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "customer") {
      navigate("/");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="customer-dashboard">

      <header className="customer-header">
        <div>
          <h1>EZFINANZ</h1>
        </div>

        <div className="customer-user">
          <span>{user.fullName}</span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="customer-main">

        <section className="welcome-section">
          <h2>Welcome, {user.fullName}</h2>

          <p>
            Manage your loan application and account from here.
          </p>
        </section>

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">₹</div>

            <div>
              <h3>Apply for Loan</h3>

              <p>
                Start a new loan application.
              </p>

              <button
                onClick={() => navigate("/customer/apply-loan")}
              >
                Apply Now
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">▣</div>

            <div>
              <h3>My Application</h3>

              <p>
                Track your current loan application.
              </p>

              <button
                onClick={() =>
                  navigate("/customer/application")
                }
              >
                View Application
              </button>
            </div>
          </div>

         

          
        </section>

      </main>
    </div>
  );
}

export default CustomerDashboard;