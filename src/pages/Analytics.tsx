import { useEffect, useState } from "react";
import { Card, Typography, Row, Col } from "antd";
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
import { Line, Bar, Pie } from "react-chartjs-2";
import dayjs from "dayjs";
import { useApi } from "../api/useApi";
import { formatINRCompact } from "../utils/currency";
import "../styles/Analytics.css";

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

type Donation = {
  amount: number;
  status: string;
  donationDate: string;
  donationSource: string;
  staff?: {
    name: string;
  };
};

type StaffDonationResponse = {
  staffId: number;
  staffName: string;
  totalDonations: number;
  dailyDonations: Record<string, number>;
};

const STAFF_ID = 2;

/* ================= COMPONENT ================= */

export default function Analytics() {
  const { baseApi } = useApi();
  const api = baseApi();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [staffData, setStaffData] =
    useState<StaffDonationResponse | null>(null);

  /* ===== Fetch all donations ===== */
  useEffect(() => {
    api.get("/donations").then((res) => {
      setDonations(res.data || []);
    });
  }, []);

  /* ===== Fetch staff-based analytics ===== */
  useEffect(() => {
    api.get(`/donations/staff/${STAFF_ID}`).then((res) => {
      setStaffData(res.data);
    });
  }, []);

  /* ================= KPIs ================= */

  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("YYYY-MM");

  let todayTotal = 0;
  let monthTotal = 0;
  let paidTotal = 0;
  let pendingTotal = 0;

  donations.forEach((d) => {
    if (d.donationDate === today) {
      todayTotal += d.amount;
    }

    if (d.donationDate.startsWith(currentMonth)) {
      monthTotal += d.amount;
    }

    if (d.status === "PAID" || d.status === "SETTLED") {
      paidTotal += d.amount;
    } else {
      pendingTotal += d.amount;
    }
  });

  /* ================= PAID vs PENDING ================= */

  const paidPendingData = [paidTotal, pendingTotal];
 
  /* ================= SOURCE SPLIT ================= */

  const sourceMap: Record<string, number> = {};
  donations.forEach((d) => {
    sourceMap[d.donationSource] =
      (sourceMap[d.donationSource] || 0) + d.amount;
  });

  /* ================= TOP 5 STAFF ================= */

  const staffMap: Record<string, number> = {};
  donations.forEach((d) => {
    if (!d.staff?.name) return;
    staffMap[d.staff.name] =
      (staffMap[d.staff.name] || 0) + d.amount;
  });

  const topStaff = Object.entries(staffMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const staffLabels = topStaff.map(([name]) => name);
  const staffAmounts = topStaff.map(([, amount]) => amount);

  /* ================= DONATION TREND (STAFF API) ================= */

  const trendLabels: string[] = [];
  const trendAmounts: number[] = [];

  if (staffData) {
    Object.entries(staffData.dailyDonations).forEach(
      ([date, amount]) => {
        if (dayjs(date).isAfter(dayjs().subtract(30, "day"))) {
          trendLabels.push(dayjs(date).format("MMM D"));
          trendAmounts.push(amount);
        }
      }
    );
  }


  const currencyTooltip = {
    callbacks: {
      label: (ctx: any) => formatINRCompact(Number(ctx.raw)),
    },
  };



  return (
    <div className="analytics-page">
      <Typography.Title level={2}>Analytics</Typography.Title>
      <Typography.Text type="secondary">
        Donation performance and operational insights
      </Typography.Text>


      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={6}>
          <Card title="Today">
            <Typography.Title level={4}>
              {formatINRCompact(todayTotal)}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="This Month">
            <Typography.Title level={4}>
              {formatINRCompact(monthTotal)}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="Paid">
            <Typography.Title level={4}>
              {formatINRCompact(paidTotal)}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="Pending">
            <Typography.Title level={4}>
              {formatINRCompact(pendingTotal)}
            </Typography.Title>
          </Card>
        </Col>
      </Row>

      {/* ===== CHARTS ===== */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Donation Trend */}
        <Col xs={24} lg={14}>
          <Card title="Donation Trend (Last 30 Days)">
            <div style={{ height: 300 }}>
              <Line
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: currencyTooltip,
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (v) =>
                          formatINRCompact(Number(v)),
                      },
                    },
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

        {/* Paid vs Pending */}
        <Col xs={24} lg={10}>
          <Card title="Paid vs Pending">
            <div style={{ height: 300 }}>
              <Bar
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: currencyTooltip,
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (v) =>
                          formatINRCompact(Number(v)),
                      },
                    },
                  },
                }}
                data={{
                  labels: ["Paid", "Pending"],
                  datasets: [
                    {
                      data: paidPendingData,
                      backgroundColor: ["#52c41a", "#faad14"],
                      borderRadius: 6,
                    },
                  ],
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Source Split */}
        <Col xs={24} lg={12}>
          <Card title="Donation Source Split">
            <div style={{ height: 300 }}>
              <Pie
                options={{
                  plugins: {
                    tooltip: currencyTooltip,
                  },
                }}
                data={{
                  labels: Object.keys(sourceMap),
                  datasets: [
                    {
                      data: Object.values(sourceMap),
                      backgroundColor: [
                        "#1677ff",
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

        {/* Top 5 Staff */}
        <Col xs={24} lg={12}>
          <Card title="Top 5 Staff by Contribution">
            <div style={{ height: 300 }}>
              <Bar
                options={{
                  indexAxis: "y",
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: currencyTooltip,
                  },
                  scales: {
                    x: {
                      ticks: {
                        callback: (v) =>
                          formatINRCompact(Number(v)),
                      },
                    },
                  },
                }}
                data={{
                  labels: staffLabels,
                  datasets: [
                    {
                      data: staffAmounts,
                      backgroundColor: "#0b2545",
                      borderRadius: 6,
                    },
                  ],
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
