import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/Signup";

import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplicationDetails from "./pages/AdminApplicationDetails";

import ApplyLoan from "./pages/customer/ApplyLoan";
import MyApplication from "./pages/customer/MyApplication";
import Eligibility from "./pages/customer/Eligibility";
import EMI from "./pages/customer/EMI";
import BankAccount from "./pages/customer/BankAccount";
import Declaration from "./pages/customer/Declaration";
import Selfie from "./pages/customer/Selfie";
import KYC from "./pages/customer/KYC";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            AUTH
        ================================= */}

        <Route path="/" element={<Login />} />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* ================================
            CUSTOMER
        ================================= */}

        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customer/apply-loan"
          element={<ApplyLoan />}
        />

        <Route
          path="/customer/application"
          element={<MyApplication />}
        />

        <Route
          path="/customer/eligibility/:applicationId"
          element={<Eligibility />}
        />

        <Route
          path="/customer/emi/:applicationId"
          element={<EMI />}
        />

        <Route
          path="/customer/bank-account/:applicationId"
          element={<BankAccount />}
        />

        <Route
          path="/customer/declaration/:applicationId"
          element={<Declaration />}
        />

        <Route
          path="/customer/selfie/:applicationId"
          element={<Selfie />}
        />

        <Route
          path="/customer/kyc"
          element={<KYC />}
        />


        {/* ================================
            ADMIN
        ================================= */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* THIS WAS MISSING */}
        <Route
          path="/admin/applications/:applicationId"
          element={<AdminApplicationDetails />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;