import { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import { useApi } from "../../api/useApi";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { formatINRCompact } from "../../utils/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

type AdminAnalytics = {
  dailyDonations: Record<string, number>;
  staffContribution: Record<string, number>;
};

type StaffAnalytics = {
  dailyDonations: Record<string, number>;
  staffName: string;
};

export default function AnalyticsOverview() {
  const { baseApi } = useApi();
  const api = baseApi();
  const role = localStorage.getItem("role") || "STAFF";
  const isAdmin = role === "ADMIN";
  const staffId = localStorage.getItem("staffId") || "2";

  const [adminData, setAdminData] = useState<AdminAnalytics | null>(null);
  const [staffData, setStaffData] = useState<StaffAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isAdmin) {
          const res = await api.get("/analytics/admin");
          setAdminData(res.data);
          return;
        }

        const res = await api.get(`/donations/staff/${staffId}`);
        setStaffData(res.data);
      } catch (err) {
        console.error("Failed to load analytics overview", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAdmin, staffId]);

  const daily = isAdmin ? adminData?.dailyDonations : staffData?.dailyDonations;

  const trendEntries = useMemo(() => {
    if (!daily) {
      return [] as Array<[string, number]>;
    }

    return Object.entries(daily)
      .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
      .slice(-30);
  }, [daily]);

  const trendLabels = trendEntries.map(([d]) => dayjs(d).format("MMM D"));
  const trendValues = trendEntries.map(([, v]) => v);

  const staffContributionEntries = useMemo(() => {
    if (!isAdmin || !adminData?.staffContribution) {
      return [] as Array<[string, number]>;
    }

    return Object.entries(adminData.staffContribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [adminData, isAdmin]);

  return (
    <Card title={isAdmin ? "Analytics Overview" : "My Donation Trend"}>
      {loading && <p>Loading analytics...</p>}

      {!loading && (
        <div className="analytics-overview-grid">
          <div className="analytics-mini-chart">
            <h4>{isAdmin ? "Donation Trend (Last 30 Days)" : `${staffData?.staffName || "My"} Trend`}</h4>
            <div className="analytics-mini-chart-box">
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
                }}
                data={{
                  labels: trendLabels,
                  datasets: [
                    {
                      data: trendValues,
                      borderColor: "#2563eb",
                      backgroundColor: "rgba(37,99,235,0.15)",
                      fill: true,
                      tension: 0.35,
                    },
                  ],
                }}
              />
            </div>
          </div>

          {isAdmin && (
            <div className="analytics-mini-chart">
              <h4>Top 5 Staff Contribution</h4>
              <div className="analytics-mini-chart-box">
                <Bar
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
                  }}
                  data={{
                    labels: staffContributionEntries.map(([name]) => name),
                    datasets: [
                      {
                        data: staffContributionEntries.map(([, value]) => value),
                        backgroundColor: ["#60a5fa", "#0ea5e9", "#14b8a6", "#22c55e", "#a78bfa"],
                        borderRadius: 8,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
