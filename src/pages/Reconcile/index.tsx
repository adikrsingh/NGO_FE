import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Card,
  Modal,
  Input,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useApi } from "../../api/useApi";

/* ================= TYPES ================= */

type ReconciliationStatus = "UNCLAIMED" | "SETTLED";

type ReconciledTransaction = {
  id: number;
  transactionId: string;
  transactionAmount: number;
  transactionDate: string;
  transactionMode: string;
  claimsCount: number;
};

type Donation = {
  id: number;
  amount: number;
  donationDate: string;
  transactionId: string;
  donationCampaign?: string;
  donationSource?: string;
  donor: {
    name: string;
  };
};

/* ================= HARD CODE STAFF ================= */

const staffId = 2;

export default function Reconciliation() {
  const { baseApi } = useApi();
  const api = baseApi();

  const [messageApi, contextHolder] = message.useMessage();

  /* ================= STATE ================= */

  const [data, setData] = useState<ReconciledTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<ReconciledTransaction | null>(null);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDonation, setSelectedDonation] =
    useState<Donation | null>(null);

  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const [donationPage, setDonationPage] = useState(0);
  const [donationPageSize] = useState(5);
  const [donationTotal, setDonationTotal] = useState(0);

  /* ================= FETCH RECONCILIATION ================= */

  const fetchReconciliation = async (pageNumber = 0) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/reconciliation/transactions/staff/${staffId}?page=${pageNumber}&size=${pageSize}`
      );

      setData(res.data.content || []);
      setTotal(res.data.totalElements || 0);
      setPage(pageNumber);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detailedMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load reconciliation data";

      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  /* ================= FETCH DONATIONS ================= */

  const fetchDonations = async (page = 0) => {
    try {
      setSearching(true);

      const res = await api.get(
        `/donations/search?staffId=${staffId}&keyword=${searchKeyword || ""}&page=${page}&size=${donationPageSize}`
      );

      setDonations(res.data.content || []);
      setDonationTotal(res.data.totalElements || 0);
      setDonationPage(page);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detailedMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to search donations";

      messageApi.error(errorMessage);
    } finally {
      setSearching(false);
    }
  };

  /* ================= OPEN CLAIM MODAL ================= */

  const openClaimModal = (record: ReconciledTransaction) => {
    setSelectedTransaction(record);
    setClaimModalOpen(true);
    setSelectedDonation(null);
    setSearchKeyword("");
    fetchDonations(0);
  };

  /* ================= CONFIRM CLAIM ================= */

  const confirmClaim = async () => {
    if (!selectedDonation || !selectedTransaction) {
      messageApi.warning("Please select a donation");
      return;
    }

    try {
      setClaiming(true);

      await api.put(
        `/donations/claim/${selectedDonation.id}/${staffId}?reconciliationId=${selectedTransaction.id}`
      );

      messageApi.success(
        "Transaction claimed successfully. Pending admin approval."
      );

      setClaimModalOpen(false);
      fetchReconciliation(page);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detailedMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to claim transaction";

      messageApi.error(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  /* ================= STATUS TAG ================= */

  const renderStatus = (status: ReconciliationStatus) => {
    if (status === "SETTLED") {
      return <Tag color="green">Settled</Tag>;
    }

    return (
      <Tag color="orange" icon={<ExclamationCircleOutlined />}>
        Unclaimed
      </Tag>
    );
  };

  /* ================= RECONCILIATION TABLE ================= */

  const reconciliationColumns: ColumnsType<ReconciledTransaction> = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
    },
    {
      title: "Date",
      dataIndex: "transactionDate",
    },
    {
      title: "Amount (₹)",
      dataIndex: "transactionAmount",
      render: (amt: number) =>
        amt ? `₹${amt.toLocaleString()}` : "₹0",
    },
    {
      title: "Claims",
      dataIndex: "claimsCount",
      render: (count: number) => (
        <Tag color={count > 0 ? "blue" : "default"}>
          {count} {count === 1 ? "Claim" : "Claims"}
        </Tag>
      ),
    },
    {
      title: "Mode",
      dataIndex: "transactionMode",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => openClaimModal(record)}
        >
          Claim
        </Button>
      ),
    },
  ];

  /* ================= DONATION TABLE ================= */


  const donationColumns = [
    {
      title: "Donor Name",
      dataIndex: ["donor", "name"],
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      render: (amt: number) =>
        amt ? `₹${amt.toLocaleString()}` : "₹0",
    },
    {
      title: "Date",
      dataIndex: "donationDate",
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
    },
    {
      title: "Mode of Payment",
      dataIndex: "donationSource",
    },
  ];

  /* ================= UI ================= */

  return (
    <>
      {contextHolder}

      <Card title="Unclaimed Transactions">
        <Table
          rowKey="id"
          loading={loading}
          columns={reconciliationColumns}
          dataSource={data}
          pagination={{
            current: page + 1,
            pageSize: pageSize,
            total: total,
            onChange: (newPage) =>
              fetchReconciliation(newPage - 1),
          }}
        />
      </Card>

      <Modal
        title="Claim Transaction"
        open={claimModalOpen}
        onOk={confirmClaim}
        onCancel={() => setClaimModalOpen(false)}
        confirmLoading={claiming}
        okButtonProps={{ disabled: !selectedDonation }}
        width={900}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card size="small">
            <Typography.Text strong>Bank Amount:</Typography.Text>{" "}
            ₹{selectedTransaction?.transactionAmount?.toLocaleString()}
            <br />
            <Typography.Text strong>Bank Date:</Typography.Text>{" "}
            {selectedTransaction?.transactionDate}
          </Card>

          <Input.Search
            placeholder="Search by donor name or amount"
            enterButton="Search"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={() => fetchDonations(0)}
            loading={searching}
          />

          <Table
            rowKey="id"
            dataSource={donations}
            loading={searching}
            pagination={{
              current: donationPage + 1,
              pageSize: donationPageSize,
              total: donationTotal,
              onChange: (newPage) =>
                fetchDonations(newPage - 1),
            }}
            rowSelection={{
              type: "radio",
              onChange: (_, selectedRows) =>
                setSelectedDonation(selectedRows[0]),
            }}
            columns={donationColumns}
          />
        </Space>
      </Modal>
    </>
  );
}
