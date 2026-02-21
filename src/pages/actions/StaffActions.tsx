import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Card,
  Progress,
  Modal,
  message,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useApi } from "../../api/useApi";
import ReceiptModal from "../../components/donation/ReceiptModal";

type RowType = {
  donationId: number;
  donorName: string;
  amount: number;
  receiptSent: boolean;
  ackSent: boolean;
  completedActions: number;
  totalActions: number;
};

type DonationDetails = {
  donor: { name: string };
  amount: number;
  donationDate: string;
  donationSource: string;
};

export default function StaffActions() {
  const { baseApi } = useApi();
  const api = baseApi();

  const staffId = localStorage.getItem("staffId") || 2;

  const [data, setData] = useState<RowType[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const [receiptVisible, setReceiptVisible] = useState(false);
  const [selectedDonation, setSelectedDonation] =
    useState<DonationDetails | null>(null);
  const [selectedDonationId, setSelectedDonationId] =
    useState<number | null>(null);

  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const pageSize = 10;

  /* ================= FETCH DATA ================= */

  const fetchData = async (pageNumber = 0) => {
    setLoading(true);

    try {
      const filterQuery =
        activeFilters.length > 0
          ? activeFilters.map((f) => `filters=${f}`).join("&")
          : "";

      const res = await api.get(
        `/actions?role=STAFF&staffId=${staffId}&${filterQuery}&page=${pageNumber}&size=${pageSize}`
      );

      setData(res.data.content);
      setTotal(res.data.totalElements);
      setPage(pageNumber);
    } catch {
      message.error("Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    const res = await api.get(`/actions/count?staffId=${staffId}`);
    setCounts(res.data);
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchData(0);
  }, [activeFilters]);

  /* ================= CLICK HANDLERS ================= */

  const openReceiptModal = async (donationId: number) => {
    try {
      const res = await api.get(`/donations/donor/${donationId}`);
      setSelectedDonation(res.data);
      setSelectedDonationId(donationId);
      setReceiptVisible(true);
    } catch {
      message.error("Failed to load donation details");
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<RowType> = [
    { title: "Donor", dataIndex: "donorName" },

    {
      title: "Amount",
      dataIndex: "amount",
      render: (amt: number) => `₹${amt.toLocaleString()}`,
    },

    {
      title: "Receipt",
      render: (_, record) =>
        record.receiptSent ? (
          <Tag
            color="green"
            style={{ cursor: "pointer" }}
            // onClick={() => openReceiptModal(record.donationId)}
          >
            Sent
          </Tag>
        ) : (
          <Tag
            color="orange"
            style={{ cursor: "pointer" }}
            onClick={() => openReceiptModal(record.donationId)}
          >
            Pending
          </Tag>
        ),
    },

    {
      title: "Acknowledgement",
      render: (_, record) =>
        record.ackSent ? (
          <Tag
            color="green"
            style={{ cursor: "pointer" }}
            onClick={() => setAckModalOpen(true)}
          >
            Sent
          </Tag>
        ) : (
          <Tag
            color="orange"
            style={{ cursor: "pointer" }}
            onClick={() => setAckModalOpen(true)}
          >
            Pending
          </Tag>
        ),
    },

    {
      title: "Actions",
      render: () => (
        <Tag
          color="blue"
          style={{ cursor: "pointer" }}
          onClick={() => setActionModalOpen(true)}
        >
          0 / 0
        </Tag>
      ),
    },

    {
      title: "Progress",
      render: (_, record) => {
        const percent =
          (record.completedActions / record.totalActions) * 100;

        return (
          <Progress
            percent={percent}
            size="small"
          />
        );
      },
    },
  ];

  /* ================= RENDER ================= */

  return (
    <>
      <Card title="Donation Actions">
        <Space style={{ marginBottom: 20 }} wrap>
          {[
            {
              key: "RECEIPT",
              label: "Pending Receipt",
              count: counts.pendingReceipt,
            },
            {
              key: "ACK",
              label: "Pending Ack",
              count: counts.pendingAck,
            },
            {
              key: "COMPLETED",
              label: "Completed",
              count: counts.completed,
            },
          ].map((item) => {
            const isActive = activeFilters.includes(item.key);

            return (
              <Tag
                key={item.key}
                color={isActive ? "blue" : "default"}
                style={{
                  borderRadius: 20,
                  padding: "4px 14px",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                closable={isActive}
                onClose={(e) => {
                  e.preventDefault();
                  setActiveFilters((prev) =>
                    prev.filter((f) => f !== item.key)
                  );
                }}
                onClick={() => {
                  if (!isActive) {
                    setActiveFilters((prev) => [
                      ...prev,
                      item.key,
                    ]);
                  }
                }}
              >
                {item.label} ({item.count})
              </Tag>
            );
          })}
        </Space>

        <Table
          rowKey="donationId"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            onChange: (p) => fetchData(p - 1),
          }}
        />
      </Card>

      {/* Receipt Modal */}
      {selectedDonation && (
        <ReceiptModal
          visible={receiptVisible}
          donationId={selectedDonationId ?? undefined}
          onClose={() => {
            setReceiptVisible(false);
            setSelectedDonation(null);
            fetchData(page);
            fetchCounts();
          }}
        />
      )}

      {/* Dummy Acknowledgement Modal */}
      <Modal
        open={ackModalOpen}
        onCancel={() => setAckModalOpen(false)}
        footer={null}
        title="Acknowledgement"
      >
        Acknowledgement sending feature will be implemented soon.
      </Modal>

      {/* Additional Actions Modal */}
      <Modal
        open={actionModalOpen}
        onCancel={() => setActionModalOpen(false)}
        footer={null}
        title="Additional Actions"
      >
        No additional actions pending.
      </Modal>
    </>
  );
}