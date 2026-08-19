import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/admin-dashboard.scss";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "admin") {
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
    <div className="admin-dashboard">

      <header className="admin-header">

        <div>
          <h1>EZFINANZ</h1>
          <span>Admin Portal</span>
        </div>

        <div className="admin-user">

          <span>{user.fullName}</span>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </header>

      <main className="admin-main">

        <section className="admin-welcome">

          <h2>Admin Dashboard</h2>

          <p>
            Review and manage customer loan applications.
          </p>

        </section>

        <section className="admin-cards">

          <div className="admin-card">

            <div className="admin-card-icon">
              ⏳
            </div>

            <h3>Pending Applications</h3>

            <p>
              Review loan applications waiting for admin approval.
            </p>

            <button
              onClick={() =>
                navigate("/admin/applications")
              }
            >
              Review Applications
            </button>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              ✓
            </div>

            <h3>Approved Loans</h3>

            <p>
              View applications that have been approved.
            </p>

            <button>
              View Approved
            </button>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              ✕
            </div>

            <h3>Rejected Applications</h3>

            <p>
              View rejected loan applications.
            </p>

            <button>
              View Rejected
            </button>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              ◉
            </div>

            <h3>Customer Management</h3>

            <p>
              View and manage registered customers.
            </p>

            <button>
              Customers
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;