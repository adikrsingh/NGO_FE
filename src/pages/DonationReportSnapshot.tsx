import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DonationService } from "../api/donationApi";
import { formatINRCompact } from "../utils/currency";
import { StaffDonationDashboard } from "../types/StaffDonationDashboard";
import { TotalDonationSummary } from "../types/TotalDonationSummary";
import { PaidVsPending } from "../types/PaidVsPending";
import { MonthlyRunRate } from "../types/MonthlyRunRate";
import "../styles/dashboardReports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type ReportType = "donations" | "payments" | "today" | "monthly";

const reportConfig: Record<
  ReportType,
  { title: string; subtitle: string; valueLabel: string }
> = {
  donations: {
    title: "Total Donations Snapshot",
    subtitle: "Overview of cumulative donation performance with 30-day movement.",
    valueLabel: "Total Collected",
  },
  payments: {
    title: "Paid vs Pending Snapshot",
    subtitle: "Track cleared payments versus pending pipeline over the recent trend.",
    valueLabel: "Paid Amount",
  },
  today: {
    title: "Today's Collections Snapshot",
    subtitle: "Live daily performance with rolling trend to compare momentum.",
    valueLabel: "Today's Collection",
  },
  monthly: {
    title: "Monthly Run Rate Snapshot",
    subtitle: "Measure progress against this month's expected collection plan.",
    valueLabel: "Run Rate",
  },
};

export default function DonationReportSnapshot({ reportType }: { reportType: ReportType }) {
  const staffId = 2;
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const {
    getTotalDonationSummary,
    getStaffDonationDashboard,
    getPaidVsPendingForMonth,
    getMonthlyRunRate,
  } = DonationService();

  const [summary, setSummary] = useState<TotalDonationSummary | null>(null);
  const [staffDashboard, setStaffDashboard] = useState<StaffDonationDashboard | null>(null);
  const [paidVsPending, setPaidVsPending] = useState<PaidVsPending | null>(null);
  const [monthlyRunRate, setMonthlyRunRate] = useState<MonthlyRunRate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [summaryData, staffData, paymentData, runRateData] = await Promise.all([
          getTotalDonationSummary(staffId),
          getStaffDonationDashboard(staffId),
          getPaidVsPendingForMonth(staffId),
          getMonthlyRunRate(staffId, year, month),
        ]);

        if (!mounted) {
          return;
        }

        setSummary(summaryData);
        setStaffDashboard(staffData);
        setPaidVsPending(paymentData);
        setMonthlyRunRate(runRateData);
      } catch (error) {
        console.error("Failed to load report snapshot", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    const interval = window.setInterval(load, 45000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [month, year]);

  const trendEntries = useMemo(() => {
    if (!staffDashboard?.dailyDonations) {
      return [] as Array<[string, number]>;
    }

    return Object.entries(staffDashboard.dailyDonations)
      .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
      .slice(-30);
  }, [staffDashboard]);

  const trendLabels = trendEntries.map(([date]) => dayjs(date).format("MMM D"));
  const trendValues = trendEntries.map(([, amount]) => amount);

  const snapshotPrimaryValue = useMemo(() => {
    switch (reportType) {
      case "donations":
        return summary ? formatINRCompact(summary.totalAmount) : "—";
      case "payments":
        return paidVsPending ? formatINRCompact(paidVsPending.paidAmount) : "—";
      case "today": {
        const todayKey = dayjs().format("YYYY-MM-DD");
        return staffDashboard
          ? formatINRCompact(staffDashboard.dailyDonations[todayKey] || 0)
          : "—";
      }
      case "monthly":
        return monthlyRunRate ? `${monthlyRunRate.runRate.toFixed(1)}%` : "—";
      default:
        return "—";
    }
  }, [monthlyRunRate, paidVsPending, reportType, staffDashboard, summary]);

  return (
    <div className="report-snapshot-page">
      <header className="report-snapshot-header">
        <h2>{reportConfig[reportType].title}</h2>
        <p>{reportConfig[reportType].subtitle}</p>
      </header>

      <div className="report-kpi-row">
        <article className="report-kpi-card report-kpi-primary">
          <span>{reportConfig[reportType].valueLabel}</span>
          <strong>{loading ? "Loading..." : snapshotPrimaryValue}</strong>
        </article>

        <article className="report-kpi-card">
          <span>Total Transactions</span>
          <strong>{summary ? summary.donationCount : "—"}</strong>
        </article>

        <article className="report-kpi-card">
          <span>Pending Amount</span>
          <strong>
            {paidVsPending ? formatINRCompact(paidVsPending.pendingAmount) : "—"}
          </strong>
        </article>

        <article className="report-kpi-card">
          <span>Pending Acknowledgements</span>
          <strong>{staffDashboard ? staffDashboard.pendingAcknowledgements : "—"}</strong>
        </article>
      </div>

      <section className="report-chart-card">
        <div className="report-chart-header">
          <h3>Last 30 days donation trend</h3>
          <p>Auto-refreshes every 45 seconds for near real-time visibility.</p>
        </div>

        <div className="report-chart-wrapper">
          <Line
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => formatINRCompact(Number(ctx.raw || 0)),
                  },
                },
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value) => formatINRCompact(Number(value)),
                  },
                },
              },
            }}
            data={{
              labels: trendLabels,
              datasets: [
                {
                  data: trendValues,
                  borderColor: "#dc2626",
                  backgroundColor: "rgba(220,38,38,0.16)",
                  fill: true,
                  tension: 0.36,
                  pointRadius: 2,
                },
              ],
            }}
          />
        </div>
      </section>
    </div>
  );
}
