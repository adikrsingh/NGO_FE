import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Drawer } from "antd";
import Card from "../../components/common/Card";
import CustomTable from "../../components/Table";
import { DonorService } from "../../api/donorApi";
import { ActiveDonor } from "../../types/ActiveDonor";
import DonorDrawer from "./DonorDrawer";
import ActiveDonorSummary from "./ActiveDonorSummary";
import DonorInsights from "./DonorInsights";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

export default function ActiveDonors() {
  const { getActiveDonors } = DonorService();

  const [data, setData] = useState<ActiveDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<ActiveDonor | null>(null);

  useEffect(() => {
    setLoading(true);
    getActiveDonors()
      .then(setData)
      .catch((err) => console.error("Failed to load active donors", err))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnsType<ActiveDonor> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span
          style={{ color: "#1677ff", cursor: "pointer", fontWeight: 500 }}
          onClick={() => setSelectedDonor(record)}
        >
          {text}
        </span>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "PAN", dataIndex: "pan", key: "pan" },
  ];

  return (
    <>

    <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  }}
>
      <div>
        <h1 style={{ marginBottom: 4 }}>Active Donors</h1>
        <p style={{ margin: 0, color: "#666" }}>
          Donors who contributed during the selected period
        </p>
      </div>

      <Button
        icon={<DownloadOutlined />}
        type="default"
        size="middle"
      >
        Export Donor List
      </Button>
    </div>


    <ActiveDonorSummary />
    <DonorInsights />

      <Card title="Active Donors (Last 90 Days)">
        <CustomTable<ActiveDonor>
          rowKey={(record) => record.id}
          columns={columns}
          data={data}
          loading={loading}
        />
      </Card>

      {/* Donor Details Drawer */}
      <Drawer
        width={420}
        open={!!selectedDonor}
        onClose={() => setSelectedDonor(null)}
        destroyOnClose
      >
        {selectedDonor && <DonorDrawer donor={selectedDonor} />}
      </Drawer>
    </>
  );
}
