import { useEffect, useState, useMemo } from "react";
import { Card, Typography, Row, Col, Spin } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import dayjs from "dayjs";
import { useApi } from "../api/useApi";
import { formatINRCompact } from "../utils/currency";
import "../styles/analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ================= TYPES ================= */

type AdminAnalytics = {
  totalDonations: number;
  todayTotal: number;
  monthTotal: number;
  paidAmount: number;
  pendingAmount: number;
  dailyDonations: Record<string, number>;
  sourceSplit: Record<string, number>;
  staffContribution: Record<string, number>;
};

type StaffAnalytics = {
  staffId: number;
  staffName: string;
  totalDonations: number;
  dailyDonations: Record<string, number>;
  monthlyDonations: Record<string, number>;
  pendingAcknowledgements: number;
  receiptIssued: number;
  receiptNotIssued: number;
  paidAmount: number;
  pendingAmount: number;
};

/* ================= COMPONENT ================= */

export default function Analytics() {
  const { baseApi } = useApi();
  const api = baseApi();

  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";

  const [adminData, setAdminData] = useState<AdminAnalytics | null>(null);
  const [staffData, setStaffData] = useState<StaffAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const STAFF_ID = 2; // replace later with logged-in user

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const res = await api.get("/analytics/admin");
          setAdminData(res.data);
        } else {
          const res = await api.get(`/donations/staff/${STAFF_ID}`);
          setStaffData(res.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= DERIVED VALUES ================= */

  const paid = isAdmin
    ? adminData?.paidAmount || 0
    : staffData?.paidAmount || 0;

  const pending = isAdmin
    ? adminData?.pendingAmount || 0
    : staffData?.pendingAmount || 0;

  const todayValue = isAdmin
    ? adminData?.todayTotal || 0
    : 0;

  const monthValue = isAdmin
    ? adminData?.monthTotal || 0
    : staffData?.totalDonations || 0;

  /* ================= TREND ================= */

  const trendLabels = useMemo(() => {
    const data = isAdmin
      ? adminData?.dailyDonations
      : staffData?.dailyDonations;

    if (!data) return [];

    return Object.keys(data).map((date) =>
      dayjs(date).format("MMM D")
    );
  }, [adminData, staffData]);

  const trendAmounts = useMemo(() => {
    const data = isAdmin
      ? adminData?.dailyDonations
      : staffData?.dailyDonations;

    if (!data) return [];

    return Object.values(data);
  }, [adminData, staffData]);

  /* ================= ADMIN ONLY DATA ================= */

  const sourceLabels = adminData
    ? Object.keys(adminData.sourceSplit)
    : [];

  const sourceValues = adminData
    ? Object.values(adminData.sourceSplit)
    : [];

  const staffLabels = adminData
    ? Object.keys(adminData.staffContribution)
    : [];

  const staffAmounts = adminData
    ? Object.values(adminData.staffContribution)
    : [];

  const currencyTooltip = {
    callbacks: {
      label: (ctx: any) => formatINRCompact(Number(ctx.raw)),
    },
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <Typography.Title level={2}>
        {isAdmin ? "Organization Analytics" : "My Analytics"}
      </Typography.Title>

      {/* ================= KPI CARDS ================= */}

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={6}>
          <Card title="Today" className="analytics-card">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {formatINRCompact(todayValue)}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="This Month" className="analytics-card">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {formatINRCompact(monthValue)}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="Paid" className="analytics-card">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {formatINRCompact(paid)}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="Pending" className="analytics-card">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {formatINRCompact(pending)}
            </Typography.Title>
          </Card>
        </Col>
      </Row>

      {/* ================= CHARTS ================= */}

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Trend */}
        <Col xs={24} lg={14}>
          <Card
            title="Donation Trend (Last 30 Days)"
            className="analytics-chart-card"
          >
            <div className="analytics-chart-wrapper">
              <Line
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: currencyTooltip,
                  },
                }}
                data={{
                  labels: trendLabels,
                  datasets: [
                    {
                      data: trendAmounts,
                      borderColor: "#1677ff",
                      backgroundColor: "rgba(22,119,255,0.25)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Paid vs Pending (Both Roles) */}
        <Col xs={24} lg={10}>
          <Card
            title="Paid vs Pending"
            className="analytics-chart-card"
          >
            <div className="analytics-chart-wrapper">
              <Bar
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: currencyTooltip,
                  },
                }}
                data={{
                  labels: ["Paid", "Pending"],
                  datasets: [
                    {
                      data: [paid, pending],
                      backgroundColor: ["#52c41a", "#faad14"],
                    },
                  ],
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Admin Only: Source Split */}
        {isAdmin && (
          <Col xs={24} lg={12}>
            <Card
              title="Donation Source Split"
              className="analytics-chart-card"
            >
              <div className="analytics-chart-wrapper">
                <Doughnut
                  options={{
                    plugins: {
                      tooltip: currencyTooltip,
                      legend: { position: "top" },
                    },
                    cutout: "40%",
                  }}
                  data={{
                    labels: sourceLabels,
                    datasets: [
                      {
                        data: sourceValues,
                        backgroundColor: [
                          "#1677ff",
                          "#722ed1",
                          "#52c41a",
                          "#faad14",
                          "#cf1322",
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </Card>
          </Col>
        )}

        {/* Admin Only: Top Staff */}
        {isAdmin && (
          <Col xs={24} lg={12}>
            <Card
              title="Top 5 Staff"
              className="analytics-chart-card"
            >
              <div className="analytics-chart-wrapper">
                <Bar
                  options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: currencyTooltip,
                    },
                  }}
                  data={{
                    labels: staffLabels,
                    datasets: [
                      {
                        data: staffAmounts,
                        backgroundColor: "#0b2545",
                      },
                    ],
                  }}
                />
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}