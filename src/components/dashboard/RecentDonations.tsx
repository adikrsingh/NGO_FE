import { useEffect, useState } from "react";
import Card from "../common/Card";
import CustomTable from "../Table";
import { Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { DonationService } from "../../api/donationApi";
const { getRecentContributions } = DonationService();
import { RecentContribution } from "../../types/RecentContribution";

export default function RecentDonations() {
  const [data, setData] = useState<RecentContribution[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🔐 Logged-in employee ID
   *
   * TEMP:
   * Hardcoded to 1
   *
   * TODO:
   * Replace with ID from auth context / JWT
   * Example:
   *   const { user } = useAuth();
   *   const employeeId = user.id;
   */
  const employeeId = 2;

  useEffect(() => {
    setLoading(true);

    getRecentContributions(employeeId)
      .then(setData)
      .catch((err) =>
        console.error("Failed to fetch recent contributions", err)
      )
      .finally(() => setLoading(false));
  }, [employeeId]);

  const columns: ColumnsType<RecentContribution> = [
    {
      title: "Date",
      dataIndex: "donationDate",
      key: "donationDate",
      render: (date: string) =>
        dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Donor",
      dataIndex: "donorName",
      key: "donorName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) =>
        `₹${amount.toLocaleString()}`,
    },
    {
      title: "Mode",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color="blue">{status}</Tag>
      ),
    },
    {
      title: "Receipt",
      dataIndex: "receipt",
      key: "receipt",
      render: (value: string) => (
        <Tag color={value === "Sent" ? "green" : "orange"}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Certificate",
      dataIndex: "form80Sent",
      key: "form80Sent",
      render: (value: string) => (
        <Tag color={value === "Sent" ? "green" : "orange"}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Staff",
      dataIndex: "staffName",
      key: "staffName",
      render: (name: string | null) => name ?? "—",
    },
  ];

  return (
    <Card title="Recent Donations">
     <CustomTable<RecentContribution>
        rowKey={(record, index) =>
          `${record.donationDate}-${record.donorName}-${record.amount}-${index}`
        }
        columns={columns}
        data={data}
        loading={loading}
      />


    </Card>
  );
}
