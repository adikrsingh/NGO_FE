import { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Card,
  Button,
  Modal,
  Tag,
  message,
  Upload,
  Space,
  Typography,
  Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import { useApi } from "../../api/useApi";
import "../../styles/reconcile.css";
const { TabPane } = Tabs;
const pageSizeDefault = 10;

/* ================= TYPES ================= */

type PendingReconciliation = {
  reconciliationId: number;
  bankTransactionId: string;
  bankAmount: number;
  bankDate: string;
  transactionMode: string;
  claimsCount: number;
};

type Claim = {
  id: number;
  staffName: string;
  donationAmount: number;
  donorName: string;
  claimedAt: string;
  disputeStatus: string;
};

/* ================= COMPONENT ================= */

export default function AdminReconciliation() {
  const { baseApi } = useApi();
  const api = baseApi();

  const [activeTab, setActiveTab] = useState("pending");

  const [pendingData, setPendingData] = useState<any>({});
  const [unclaimedData, setUnclaimedData] = useState<any>({});
  const [settledData, setSettledData] = useState<any>({});

  const [loading, setLoading] = useState(false);

  const [claimsModalOpen, setClaimsModalOpen] = useState(false);
  const [claimsData, setClaimsData] = useState<Claim[]>([]);

  const [fileUploading, setFileUploading] = useState(false);

  const [singleClaimMode, setSingleClaimMode] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  /* ================= FETCH FUNCTIONS ================= */

  const fetchPending = async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/reconciliation/pending?page=${page}&size=${pageSizeDefault}`
      );
      setPendingData(res.data);
    } catch {
      message.error("Failed to load pending claims");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnclaimed = async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/reconciliation/unclaimed?page=${page}&size=${pageSizeDefault}`
      );
      setUnclaimedData(res.data);
    } catch {
      message.error("Failed to load unclaimed");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettled = async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/reconciliation/settled?page=${page}&size=${pageSizeDefault}`
      );
      setSettledData(res.data);
    } catch {
      message.error("Failed to load settled");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  /* ================= FETCH CLAIMS ================= */

  const fetchClaims = async (reconciliationId: number) => {
    try {
      const response = await api.get(
        `/admin/reconciliation/claims/pages/${reconciliationId}?page=0&size=10`
      );

      const data = response.data.content ?? response.data;
      setClaimsData(data);
      setClaimsModalOpen(true);
    } catch {
      message.error("Failed to load claims");
    }
  };

  /* ================= APPROVE ================= */

  const approveClaim = async (disputeId: number) => {
    try {
      await api.put(`/donations/approve-claim/${disputeId}`);
      message.success("Claim approved");
      fetchPending();
      setClaimsModalOpen(false);
    } catch {
      message.error("Approval failed");
    }
  };

  const rejectClaim = async (disputeId: number) => {
    try {
      await api.put(`/donations/dispute/reject/${disputeId}`);
      message.success("Claim rejected");
      fetchPending();
    } catch {
      message.error("Reject failed");
    }
  };

  const approveSelected = async () => {
    try {
      await api.put(`/admin/reconciliation/bulk-approve`, selectedRowKeys);
      message.success("Bulk approval successful");
      setSelectedRowKeys([]);
      fetchPending();
    } catch {
      message.error("Bulk approval failed");
    }
  };

  /* ================= UPLOAD ================= */

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setFileUploading(true);
      await api.post("/batch/upload", formData);
      message.success("File uploaded successfully");
      fetchPending();
    } catch {
      message.error("Upload failed");
    } finally {
      setFileUploading(false);
    }
    return false;
  };

  /* ================= FILTER ================= */

  const filteredPending = singleClaimMode
    ? pendingData.content?.filter((r: any) => r.claimsCount === 1)
    : pendingData.content;

  /* ================= TABLE COLUMNS ================= */

  const pendingColumns: ColumnsType<PendingReconciliation> = [
    {
      title: "Bank Txn",
      dataIndex: "bankTransactionId",
    },
    {
      title: "Amount",
      dataIndex: "bankAmount",
      render: (amt?: number) =>
        typeof amt === "number"
          ? `₹${amt.toLocaleString()}`
          : "-",
    },
    {
      title: "Date",
      dataIndex: "bankDate",
    },

    //We will not show claim count for single claim mode as it will always be 1 and can cause confusion. Instead, we will directly show the mode of payment in that case.

    // {
    //   title: "Claims",
    //   dataIndex: "claimsCount",
    //   render: (count: number, record) => (
    //     <Tag
    //       color="blue"
    //       style={{ cursor: "pointer" }}
    //       onClick={() => fetchClaims(record.reconciliationId)}
    //     >
    //       {count} {count === 1 ? "Claim" : "Claims"}
    //     </Tag>
    //   ),
    // },

        ...(!singleClaimMode
    ? [
        {
          title: "Claims",
          dataIndex: "claimsCount",
          render: (count: number, record) => (
            <Tag
              color="blue"
              style={{ cursor: "pointer" }}
              onClick={() =>
                fetchClaims(record.reconciliationId)
              }
            >
              {count} {count === 1 ? "Claim" : "Claims"}
            </Tag>
          ),
        },
      ]
    : []),

    ...(singleClaimMode
    ? [
        {
          title: "Mode",
          dataIndex: "transactionMode",
        },
      ]
    : []),

  ...(singleClaimMode
    ? [
        {
          title: "View Linked Donation",
          render: (count: number, record) => (
            <Tag
              color="blue"
              style={{ cursor: "pointer" }}
              onClick={() =>
                fetchClaims(record.reconciliationId)
              }
            >
              linkedDonation
            </Tag>
          ),
        }
    ]
    : []
  ),

    // INLINE APPROVE/REJECT BUTTON (Single Claim Mode)
    ...(singleClaimMode
  ? [
      {
        title: "Action",
        render: (_: any, record: PendingReconciliation) =>
          record.claimsCount === 1 ? (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={async () => {
                  try {
                    const res = await api.get(
                      `/admin/reconciliation/claims/${record.reconciliationId}?page=0&size=1`
                    );

                    const data = res.data.content ?? res.data;
                    if (data && data.length > 0) {
                      approveClaim(data[0].id);
                    }
                  } catch {
                    message.error("Failed to fetch claim");
                  }
                }}
              >
                Approve
              </Button>

              <Button
                danger
                size="small"
                onClick={async () => {
                  try {
                    const res = await api.get(
                      `/admin/reconciliation/claims/${record.reconciliationId}?page=0&size=1`
                    );

                    const data = res.data.content ?? res.data;
                    if (data && data.length > 0) {
                      rejectClaim(data[0].id);
                    }
                  } catch {
                    message.error("Failed to fetch claim");
                  }
                }}
              >
                Reject
              </Button>
            </Space>
          ) : null,
      },
    ]
  : []),
  ];

  const bankTxnColumns: ColumnsType<any> = [
    { title: "Transaction ID", dataIndex: "transactionId" },
    { title: "Mode", dataIndex: "transactionMode" },
    {
      title: "Amount",
      dataIndex: "transactionAmount",
      render: (amt?: number) =>
        typeof amt === "number"
          ? `₹${amt.toLocaleString()}`
          : "-",
    },
    { title: "Date", dataIndex: "transactionDate" },
    {
      title: "Status",
      dataIndex: "reconciliationStatus",
      render: (status: string) => (
        <Tag color={status === "SETTLED" ? "green" : "orange"}>
          {status}
        </Tag>
      ),
    },
  ];

  /* ================= RENDER ================= */

  return (
    <Card>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3}>
          Admin Reconciliation
        </Typography.Title>

        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />} loading={fileUploading}>
            Upload Bank Statement
          </Button>
        </Upload>
      </Space>

      <Space style={{ marginTop: 16 }}>
        <Typography.Text>
          Show Only Single Claim Records
        </Typography.Text>
        <Switch
          checked={singleClaimMode}
          onChange={(val) => {
            setSingleClaimMode(val);
            setSelectedRowKeys([]);

          }}
        />
      </Space>

      {singleClaimMode && selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          style={{ marginTop: 10 }}
          onClick={approveSelected}
        >
          Approve Selected
        </Button>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key === "pending") fetchPending();
          if (key === "unclaimed") fetchUnclaimed();
          if (key === "settled") fetchSettled();
        }}
      >
        <TabPane tab="Pending Claims" key="pending">
          <Table
            rowKey="reconciliationId"
            loading={loading}
            columns={pendingColumns}
            dataSource={filteredPending}
            rowSelection={
              singleClaimMode
                ? {
                    selectedRowKeys,
                    onChange: (keys) =>
                      setSelectedRowKeys(keys as number[]),
                    columnWidth: 60,
                  }
                : undefined
            }
            pagination={{
              total: pendingData.totalElements,
              pageSize: pageSizeDefault,
              onChange: (page) => fetchPending(page - 1),
            }}
          />
        </TabPane>

        <TabPane tab="Unclaimed" key="unclaimed">
          <Table
            rowKey="id"
            loading={loading}
            columns={bankTxnColumns}
            dataSource={unclaimedData.content}
            pagination={{
              total: unclaimedData.totalElements,
              pageSize: pageSizeDefault,
              onChange: (page) => fetchUnclaimed(page - 1),
            }}
          />
        </TabPane>

        <TabPane tab="Settled" key="settled">
          <Table
            rowKey="id"
            loading={loading}
            columns={bankTxnColumns}
            dataSource={settledData.content}
            pagination={{
              total: settledData.totalElements,
              pageSize: pageSizeDefault,
              onChange: (page) => fetchSettled(page - 1),
            }}
          />
        </TabPane>
      </Tabs>

      <Modal
        open={claimsModalOpen}
        onCancel={() => setClaimsModalOpen(false)}
        footer={null}
        width={800}
        title="Claims"
      >
        <Table
          rowKey="id"
          columns={[
            { title: "Staff", dataIndex: "staffName" },
            { title: "Donor", dataIndex: "donorName" },
            {
              title: "Donation Amount",
              dataIndex: "donationAmount",
              render: (amt?: number) =>
                typeof amt === "number"
                  ? `₹${amt.toLocaleString()}`
                  : "-",
            },
            {
              title: "Actions",
              render: (_: any, record: any) => (
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => approveClaim(record.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => rejectClaim(record.id)}
                  >
                    Reject
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={claimsData}
          pagination={false}
        />
      </Modal>
    </Card>
  );
}
