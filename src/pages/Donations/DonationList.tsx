import { useNavigate } from "react-router-dom";
import { Button, Tag, Select, Space, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import CustomTable from "../../components/Table";
import { DonationStatus, DonationType } from "./types";
import { DonationService } from "../../api/donationApi";
import { CalendarOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

type RangeType = "THIS_MONTH" | "LAST_3" | "LAST_6" | "CUSTOM";

function DonationList() {
  const navigate = useNavigate();
  const { getDonationsByDateRange } = DonationService();

  // TEMP staff id
  const staffId = 2;

  const today = dayjs();

  const [rangeType, setRangeType] = useState<RangeType>("THIS_MONTH");
  const [customRange, setCustomRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);

  const [donations, setDonations] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(false);

  /** Calculate date range based on selection */
  const getDateRange = () => {
    switch (rangeType) {
      case "THIS_MONTH":
        return {
          from: today.startOf("month"),
          to: today.endOf("month"),
        };

      case "LAST_3":
        return {
          from: today.subtract(2, "month").startOf("month"),
          to: today.endOf("month"),
        };

      case "LAST_6":
        return {
          from: today.subtract(5, "month").startOf("month"),
          to: today.endOf("month"),
        };

      case "CUSTOM":
        if (!customRange) return null;
        return {
          from: customRange[0],
          to: customRange[1],
        };
    }
  };

  /** Fetch donations */
  useEffect(() => {
    const range = getDateRange();
    if (!range) return;

    setLoading(true);

    getDonationsByDateRange(
      staffId,
      range.from.format("YYYY-MM-DD"),
      range.to.format("YYYY-MM-DD")
    )
      .then(setDonations)
      .catch((err) => {
        console.error("Failed to load donations", err);
        setDonations([]);
      })
      .finally(() => setLoading(false));
  }, [rangeType, customRange]);

  const columns: ColumnsType<DonationType> = [
    {
      title: "Date",
      dataIndex: "donationDate",
      render: (d: string) => dayjs(d).format("DD MMM YYYY"),
    },
    {
      title: "Donor",
      dataIndex: ["donor", "name"],
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amt: number) => `₹${amt.toLocaleString()}`,
    },
    {
      title: "Mode",
      dataIndex: "donationSource",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === DonationStatus.CREATED ? "blue" : "green"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Receipt",
      dataIndex: "receiptSent",
      render: (v: boolean | null) => (
        <Tag color={v ? "green" : "default"}>
          {v === null ? "N/A" : v ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Amount Received",
      dataIndex: "status",
      render: (status: string, record: DonationType) => {
        const received = status !== DonationStatus.CREATED;
        return  (
        <Tag color={received ? "green" : "red"}>
          {received ? "Yes" : "No"}
       </Tag>
       );
      }
    },

    {
      title: "Staff",
      dataIndex: ["staff", "name"],
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>Donations</h1>

        <Space>
          <CalendarOutlined />

          <Select
            value={rangeType}
            style={{ width: 200 }}
            onChange={(v) => {
              setRangeType(v);
              setCustomRange(null);
            }}
            options={[
              { value: "THIS_MONTH", label: "This Month" },
              { value: "LAST_3", label: "Last 3 Months" },
              { value: "LAST_6", label: "Last 6 Months" },
              { value: "CUSTOM", label: "Custom Range" },
            ]}
          />

          {rangeType === "CUSTOM" && (
            <RangePicker
              value={customRange}
              onChange={(v) =>
                setCustomRange(v as [dayjs.Dayjs, dayjs.Dayjs])
              }
            />
          )}
        </Space>

        <Button type="primary" onClick={() => navigate("/donations/new")}>
          Add Donation
        </Button>
      </div>

      <CustomTable<DonationType>
        rowKey={(r) => r.id}
        columns={columns}
        data={donations}
        loading={loading}
      />

      {!loading && donations.length === 0 && (
        <div style={{ padding: 24, textAlign: "center" }}>
          No donations found for selected period
        </div>
      )}
    </>
  );
}

export default DonationList;
