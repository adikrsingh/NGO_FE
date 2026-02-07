import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddDonation from "./pages/Donations/AddDonation";
import Analytics from "./pages/Analytics";
import AddDonor from "./pages/Donar/AddDonor";
import DonorList from "./pages/Donar/DonorList";
import DonationList from "./pages/Donations/DonationList";
import AppLayout from "./components/Layout";
import PendingReceipts from "./pages/PendingReceipts";
import Pending80G from "./pages/Pending80G";
import DisputedTransaction from "./pages/DisputedTransaction";
import AddStaff from "./pages/AddStaff";
import ActiveDonors from "./pages/Donar/ActiveDonors";
import Pending80GPage from "./pages/Pending80GPage";
import Reconcile from "./pages/Reconcile";
import DonationCategories from "./components/DonationCategories";


function App() {
  return (
    <BrowserRouter>
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
        <Route path="/pending-80g" element={<Pending80G />} />
        <Route path="/disputedTransaction" element={<DisputedTransaction />} />
        <Route path="/add-staff" element={<AddStaff />} />

        <Route path="/reports/donations" element={<div>Donations Page</div>} />
        <Route path="/reports/payments" element={<div>Payments Page</div>} />
        <Route path="/reports/today" element={<div>Today Report</div>} />
        <Route path="/reports/monthly" element={<div>Monthly Report</div>} />
        <Route path="/certificates/80g" element={<div>80G Certificates</div>} />
        <Route path="/donors" element={<div>Donors List</div>} />

        <Route path="/donors/active" element={<ActiveDonors />} />
        <Route path="/reconcile" element={<Reconcile />} />
        <Route path="/admin/donation-categories" element={<DonationCategories />} />





        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
