import { useEffect, useState } from "react";
import { Table, Tag, Card, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useApi } from "../../api/useApi";

type RowType = {
  donationId: number;
  donorName: string;
  amount: number;
  receiptSent: boolean;
  ackSent: boolean;
  completedActions: number;
  totalActions: number;
  staffName?: string;
  staffId?: number;
};

export default function AdminActionMonitoring() {
  const { baseApi } = useApi();
  const api = baseApi();

  const [data, setData] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const pageSize = 10;

  const fetchActions = async (pageNumber = 0) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/actions?role=ADMIN&page=${pageNumber}&size=${pageSize}`
      );

      setData(res.data.content);
      setTotal(res.data.totalElements);
      setPage(pageNumber);
    } catch (error) {
      console.error("Failed to load monitoring data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const columns: ColumnsType<RowType> = [
    {
      title: "Donor",
      dataIndex: "donorName",
    },
    {
      title: "Staff",
      dataIndex: "staffName",
      render: (name?: string) => name || "Unassigned",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amt?: number) =>
        typeof amt === "number"
          ? `₹${amt.toLocaleString()}`
          : "₹0",
    },
    {
      title: "Receipt",
      render: (_, record) =>
        record.receiptSent ? (
          <Tag color="green">Sent</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: "Acknowledgement",
      render: (_, record) =>
        record.ackSent ? (
          <Tag color="green">Sent</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: "Progress",
      render: (_, record) => {
        const percent = Math.round(
          (record.completedActions / record.totalActions) * 100
        );

        let color = "red";
        if (percent === 100) color = "green";
        else if (percent >= 50) color = "orange";

        return (
          <Progress
            percent={percent}
            strokeColor={color}
            size="small"
          />
        );
      },
    },
  ];

  return (
    <Card title="Action Monitoring">
      <Table
        rowKey="donationId"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page + 1,
          pageSize,
          total,
          onChange: (p) => fetchActions(p - 1),
        }}
      />
    </Card>
  );
}
