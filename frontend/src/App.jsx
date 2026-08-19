import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />

        {/* <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;