import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddDonation from "./pages/Donations/AddDonation";
import Analytics from "./pages/Analytics";
import AddDonor from "./pages/Donar/AddDonor";
import DonorList from "./pages/Donar/DonorList";
import DonationList from "./pages/Donations/DonationList";
import AppLayout from "./components/Layout";
import PendingReceipts from "./pages/PendingReceipts";
import pendingAck from "./pages/PendingAcknowledgements";
import DisputedTransaction from "./pages/DisputedTransaction";
import AddStaff from "./pages/AddStaff";
import ActiveDonors from "./pages/Donar/ActiveDonors";
import Pending80GPage from "./pages/Pending80GPage";
import Reconcile from "./pages/Reconcile";
import DonationCategories from "./components/DonationCategories";
import PendingAcknowledgements from "./pages/PendingAcknowledgements";
import { useEffect } from "react";
import MyClaims from "./pages/Reconcile/MyClaims";
import Reconciliation from "./pages/Reconcile";
import AdminReconciliation from "./pages/Reconcile/AdminReconciliation";
import StaffActions from "./pages/actions/StaffActions";
import AdminActionMonitoring from "./pages/actions/AdminActionMonitoring";
import DonationReportSnapshot from "./pages/DonationReportSnapshot";

function App() {

  const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      "https://auth-central-production.up.railway.app/authcentral/validate-token",
      {
        method: "GET",
        credentials: "include",
      }
    );

    return response.ok;
  } catch {
    return false;
  }
};

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const code = params.get("code");

  //   if (code) {
  //     exchangeCode(code);
  //   } else {
  //     checkAuth().then((isAuthenticated) => {
  //       if (!isAuthenticated) {
  //         window.location.href = "https://keycloak-production-5919.up.railway.app/realms/testthree/protocol/openid-connect/auth?client_id=tesf-client&response_type=code";
  //       }
  //     });
  //   }
  // }, []);

  const exchangeCode = async (code) => {
    try {
      const response = await fetch(
        "https://auth-central-production.up.railway.app/authcentral/token",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            tenantName: "testthree",
            authCode: code }),
        }
      );
      const data = await response.json();
      console.log("Tokens received:", data);
      // OPTIONAL: remove code from URL
      window.history.replaceState({}, document.title, "/");

    } catch (error) {
      console.error("Error exchanging code:", error);
    }
  };
  
  const role = localStorage.getItem("role") || "STAFF";

  return (
    <BrowserRouter>
    <div style={{ padding: 10 }}>
        <button
          onClick={() => {
            localStorage.setItem("role", "ADMIN");
            window.location.reload();
          }}
        >
          Switch to Admin
        </button>

        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            localStorage.setItem("role", "STAFF");
            window.location.reload();
          }}
        >
          Switch to Staff
        </button>
      </div>

      <Routes>
        {/* Layout wrapper */}
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Donors */}
          <Route path="/donors" element={<DonorList />} />
          <Route path="/donors/new" element={<AddDonor />} />

          {/* Donations */}
          <Route path="/donations" element={<DonationList />} />
          <Route path="/donations/new" element={<AddDonation />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

        <Route path="/pending-receipts" element={<PendingReceipts />} />
        <Route path="/pending-80g-dashboard" element={<Pending80GPage />} />
        <Route path="/pending-ack" element={<PendingAcknowledgements />} />
        <Route path="/disputedTransaction" element={<DisputedTransaction />} />
        <Route path="/add-staff" element={<AddStaff />} />

        <Route
          path="/reports/donations"
          element={<DonationReportSnapshot reportType="donations" />}
        />
        <Route
          path="/reports/payments"
          element={<DonationReportSnapshot reportType="payments" />}
        />
        <Route
          path="/reports/today"
          element={<DonationReportSnapshot reportType="today" />}
        />
        <Route
          path="/reports/monthly"
          element={<DonationReportSnapshot reportType="monthly" />}
        />
        <Route path="/certificates/80g" element={<div>80G Certificates</div>} />
        <Route path="/donors" element={<div>Donors List</div>} />

        <Route path="/donors/active" element={<ActiveDonors />} />
        <Route
          path="/reconcile"
          element={
            role === "ADMIN" ? (
              <AdminReconciliation />
            ) : (
              <Reconciliation />
            )
          }
        />
        <Route path="/admin/donation-categories" element={<DonationCategories />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/actions" element={
                role === "STAFF" ? (
                <StaffActions />
              ) : (
              <AdminActionMonitoring />
            )
          }
        />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
