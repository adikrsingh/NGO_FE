import { Tabs, Descriptions, Table, Tag } from "antd";
import { ActiveDonor } from "../../types/ActiveDonor";
import axios from "axios";
import { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";

interface Props {
  donor: ActiveDonor;
}

type HistoryItem = {
  donationAmount: number;
  donationDate: string;
  campaign: string;
  paymentMethod: string;
  status: string;
};

export default function DonorDrawer({ donor }: Props) {

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchHistory = async () => {

    const res = await axios.get(
      useApi().baseApi().defaults.baseURL +
        `/donors/${donor.id}/history`
      );
    console.log("Fetched history:", res.data);
    
    setHistory(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, [donor.id]);

      
  return (
    <>
      <h2 style={{ marginBottom: 4 }}>{donor.name}</h2>
      <Tag color="blue">Active Donor</Tag>

      <Tabs
        defaultActiveKey="profile"
        style={{ marginTop: 16 }}
        items={[
          {
            key: "profile",
            label: "Profile",
            children: (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">
                  {donor.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {donor.phone}
                </Descriptions.Item>
                <Descriptions.Item label="PAN">
                  {donor.pan}
                </Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: "history",
            label: "History",
            children: (
              <Table
                size="small"
                pagination={false}
                dataSource={history}
                rowKey={(record, index) => index}
                columns={[
                  {
                    title: "Date",
                    dataIndex: "donationDate",
                  },
                  {
                    title: "Amount",
                    dataIndex: "donationAmount",
                    render: (amt) => `₹${amt.toLocaleString()}`,
                  },
                  {
                    title: "Campaign",
                    dataIndex: "campaign",
                  },
                  {
                    title: "Payment Method",
                    dataIndex: "paymentMethod",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (status) => (
                      <Tag color={status === "CREATED" ? "blue" : "green"}>
                        {status}
                      </Tag>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: "comms",
            label: "Comms",
            children: (
              <p style={{ color: "#888" }}>
                Communication timeline will be available once backend is ready.
              </p>
            ),
          },
          {
            key: "notes",
            label: "Notes",
            children: (
              <p style={{ color: "#888" }}>
                Notes feature coming soon.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
