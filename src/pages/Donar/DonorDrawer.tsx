import { Tabs, Descriptions, Table, Tag } from "antd";
import { ActiveDonor } from "../../types/ActiveDonor";
import { donorHistoryMock } from "./mockDonorHistory";

interface Props {
  donor: ActiveDonor;
}

export default function DonorDrawer({ donor }: Props) {
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
                dataSource={donorHistoryMock}
                rowKey="id"
                columns={[
                  {
                    title: "Date",
                    dataIndex: "date",
                  },
                  {
                    title: "Amount",
                    dataIndex: "amount",
                    render: (amt) => `₹${amt.toLocaleString()}`,
                  },
                  {
                    title: "Mode",
                    dataIndex: "mode",
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
