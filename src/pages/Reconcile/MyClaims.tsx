import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Card,
  message,
  Typography,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useApi } from "../../api/useApi";

/* ================= TYPES ================= */

type DisputeStatus = "CREATED" | "APPROVED" | "REJECTED";

type StaffClaim = {
  id: number;
  bankTransactionId: string;
  bankAmount: number;
  bankTransactionDate: string;
  donationAmount: number;
  donorName: string;
  disputeStatus: DisputeStatus;
  claimedAt: string;
  reviewedAt?: string;
};

/* ================= HARD CODE STAFF ================= */

const staffId = 2;

export default function MyClaims() {
  const { baseApi } = useApi();
  const api = baseApi();

  const [data, setData] = useState<StaffClaim[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/donations/disputes/staff/${staffId}`
      );

      setData(res.data || []);
    } catch (err: any) {
      message.error(
        err?.response?.data || "Failed to load claims"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  /* ================= STATUS TAG ================= */

  const renderStatus = (status: DisputeStatus) => {
    switch (status) {
      case "APPROVED":
        return <Tag color="green">Approved</Tag>;
      case "REJECTED":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag color="orange">Pending Review</Tag>;
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<StaffClaim> = [
    {
      title: "Bank Transaction ID",
      dataIndex: "bankTransactionId",
    },
    {
      title: "Bank Date",
      dataIndex: "bankTransactionDate",
    },
    {
      title: "Bank Amount (₹)",
      dataIndex: "bankAmount",
      render: (amt: number) => `₹${amt.toLocaleString()}`,
    },
    {
      title: "Donor Name",
      dataIndex: "donorName",
    },
    {
      title: "Donation Amount (₹)",
      dataIndex: "donationAmount",
      render: (amt: number) => `₹${amt.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "disputeStatus",
      render: renderStatus,
    },
    {
      title: "Claimed At",
      dataIndex: "claimedAt",
    },
    {
      title: "Reviewed At",
      dataIndex: "reviewedAt",
      render: (val: string | undefined) =>
        val ? val : "-",
    },
  ];

  return (
    <Card title="My Claimed Transactions">
      <Typography.Text type="secondary">
        View all transactions you have claimed and their status.
      </Typography.Text>

      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
      />
    </Card>
  );
}
