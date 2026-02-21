import StatCard from "../components/StatCard";
import NeedsAttention from "../components/dashboard/NeedsAttention";
import UserContext from "../components/dashboard/UserContext";
import DonationFlowStatus from "../components/dashboard/DonationFlowStatus";
import RecentDonations from "../components/dashboard/RecentDonations";
import AnalyticsOverview from "../components/dashboard/AnalyticsOverview";
import { TotalDonationSummary } from "../types/TotalDonationSummary";
import { formatINRCompact } from "../utils/currency";
import { StaffDonationDashboard } from "../types/StaffDonationDashboard";
import { getTodayKey } from "../utils/date";
import { DonorService } from "../api/donorApi";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Award,
  Users,
  IndianRupeeIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DonationService } from "../api/donationApi";
import { PaidVsPending } from "../types/PaidVsPending";
import { MonthlyRunRate } from "../types/MonthlyRunRate";

function Dashboard() {
  const [totalDonationSummary, setTotalDonationSummary] =
    useState<TotalDonationSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [staffDashboard, setStaffDashboard] =
    useState<StaffDonationDashboard | null>(null);

  const { getActiveDonorCount } = DonorService();
  const [activeDonorCount, setActiveDonorCount] = useState<number | null>(null);
  const [paidVsPending, setPaidVsPending] = useState<PaidVsPending | null>(null);
  const [ackPendingCount, setAckPendingCount] = useState<number>(0);

  const staffId = 2;

  const { getTotalDonationSummary, getStaffDonationDashboard, getPaidVsPendingForMonth, getPendingAcknowledgementSummary } =
    DonationService();

  const todayAmount = staffDashboard?.dailyDonations[getTodayKey()] ?? 0;
  const [monthlyRunRate, setMonthlyRunRate] = useState<MonthlyRunRate | null>(null);
  const { getMonthlyRunRate } = DonationService();

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  useEffect(() => {
    getMonthlyRunRate(staffId, year, month).then(setMonthlyRunRate).catch(console.error);
  }, [staffId, year, month]);

  useEffect(() => {
    setSummaryLoading(true);
    getTotalDonationSummary(staffId)
      .then(setTotalDonationSummary)
      .catch((err) => console.error("Failed to load total donation summary", err))
      .finally(() => setSummaryLoading(false));
  }, [staffId]);

  useEffect(() => {
    getStaffDonationDashboard(staffId)
      .then(setStaffDashboard)
      .catch((err) => console.error("Failed to load staff dashboard data", err));
  }, [staffId]);

  useEffect(() => {
    getActiveDonorCount()
      .then((res) => setActiveDonorCount(res.activeDonorCount))
      .catch((err) => console.error("Failed to fetch active donor count", err));
  }, []);

  useEffect(() => {
    getPaidVsPendingForMonth(staffId)
      .then(setPaidVsPending)
      .catch((err) => console.error("Failed to fetch paid vs pending", err));
  }, [staffId]);


  useEffect(() => {
    getPendingAcknowledgementSummary()
      .then((res) => {
        const value = Number(res?.pendingCount ?? res?.pendingAcknowledgements ?? 0);
        setAckPendingCount(value);
      })
      .catch((err) => console.error("Failed to fetch acknowledgement summary", err));
  }, []);
  const pendingReceiptCount = staffDashboard?.receiptNotIssued ?? 0;
  const receiptSentPaymentPendingCount = staffDashboard?.nonIssueCount ?? 0;
  const pending80GCount = pendingReceiptCount + receiptSentPaymentPendingCount;


  return (
    <div className="dashboard-shell">

      <div className="dashboard-stats">
        <div className="stats-inner">
          <div className="cards-row">
            <StatCard
              title="Total Donations"
              value={totalDonationSummary ? formatINRCompact(totalDonationSummary.totalAmount) : "—"}
              subtitle={
                totalDonationSummary
                  ? `${totalDonationSummary.donationCount} donations`
                  : summaryLoading
                  ? "Loading..."
                  : "No data"
              }
              icon={<IndianRupeeIcon />}
              iconBg="icon-green"
              to="/reports/donations"
            />

            <StatCard
              title="Paid vs Pending"
              value={paidVsPending ? formatINRCompact(paidVsPending.paidAmount) : "—"}
              subtitle={paidVsPending ? `${formatINRCompact(paidVsPending.pendingAmount)} pending` : "Loading..."}
              icon={<CreditCard />}
              iconBg="icon-blue"
              to="/reports/payments"
            />

            <StatCard
              title="Today's Collections"
              value={staffDashboard ? formatINRCompact(todayAmount) : "—"}
              subtitle="Today's total"
              icon={<Calendar />}
              iconBg="icon-purple"
              to="/reports/today"
            />

            <StatCard
              title="Monthly Run Rate"
              value={monthlyRunRate ? `${monthlyRunRate.runRate.toFixed(0)}%` : "—"}
              subtitle={
                monthlyRunRate
                  ? `${formatINRCompact(monthlyRunRate.paidAmount)} of ${formatINRCompact(monthlyRunRate.totalAmount)}`
                  : "Loading..."
              }
              icon={<TrendingUp />}
              iconBg="icon-orange"
              to="/reports/monthly"
            />

            <StatCard
              title="80G / Receipt Follow-ups"
              value={staffDashboard ? String(pending80GCount) : "—"}
              subtitle={
                staffDashboard
                  ? `${pendingReceiptCount} receipt pending · ${receiptSentPaymentPendingCount} payment pending`
                  : "Loading..."
              }
              icon={<Award />}
              iconBg="icon-red"
              to="/pending-80g-dashboard"
            />

            <StatCard
              title="Active Donors"
              value={activeDonorCount !== null ? String(activeDonorCount) : "—"}
              subtitle="Last 90 days"
              icon={<Users />}
              iconBg="icon-blue"
              to="/donors/active"
            />
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="grid-2">
          <NeedsAttention
            pendingReceipts={staffDashboard?.receiptNotIssued ?? 0}
            pendingAck={ackPendingCount}
          />
          <UserContext />
        </div>

        <DonationFlowStatus />

        <div>
          <AnalyticsOverview />
        </div>

        <div style={{ marginTop: 16 }}>
          <RecentDonations />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
