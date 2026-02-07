import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Card,
  Upload,
  message,
  Alert,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useApi } from "../../api/useApi";
import axios from "axios";

/* ================= TYPES ================= */

type ReconciliationStatus =
  | "UNSETTLED"
  | "MATCHED"
  | "SETTLED"
  | "NOT_FOUND";

type ReconciledTransaction = {
  id: number;
  transactionId: string;
  transactionAmount: number;
  reconciliationStatus: ReconciliationStatus;
};

/* ============== STATUS GROUPS ============== */

const STATUS_GROUPS: Record<
  "DEFAULT" | "MATCHED" | "SETTLED",
  ReconciliationStatus[]
> = {
  DEFAULT: ["UNSETTLED", "NOT_FOUND"],
  MATCHED: ["MATCHED"],
  SETTLED: ["SETTLED"],
};

export default function Reconcile() {
  const { baseApi } = useApi();
  const api = baseApi();

  const [data, setData] = useState<ReconciledTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 🔥 Processing banner
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeView, setActiveView] =
    useState<"DEFAULT" | "MATCHED" | "SETTLED">("DEFAULT");

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const statuses = STATUS_GROUPS[activeView].join(",");
      const res = await api.get(
        `/reconciliation/transactions?status=${statuses}`
      );
      setData(res.data || []);
      setSelectedRowKeys([]);
      setIsProcessing(false);
    } catch {
      message.error("Failed to load reconciliation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeView]);

  /* ================= FILE UPLOAD ================= */

  const handleUpload = async () => {
    if (!file) {
      message.warning("Please select a bank statement file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setIsProcessing(true);

      await api.post("/batch/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success(
        "Bank statement uploaded. Processing has started."
      );

      setFile(null);

      setTimeout(() => {
        fetchData();
      }, 3000);

    } catch (error: any) {

      // 🔥 EXTRACT BACKEND MESSAGE PROPERLY
      let errorMsg = "Failed to upload bank statement";

      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data ||
          errorMsg;
      }

      message.error(errorMsg);
      setIsProcessing(false);

    } finally {
      setUploading(false);
    }
  };

  /* ================= BULK MANUAL SETTLE ================= */

  const manuallySettleBulk = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      await api.put(
        "/reconciliation/transactions/settle",
        selectedRowKeys
      );
      message.success(
        `Manually settled ${selectedRowKeys.length} record(s)`
      );
      fetchData();
    } catch {
      message.error("Failed to settle selected records");
    }
  };

  /* ================= STATUS TAG ================= */

  const renderStatus = (status: ReconciliationStatus) => {
    switch (status) {
      case "MATCHED":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Matched (Auto)
          </Tag>
        );
      case "SETTLED":
        return (
          <Tag color="blue" icon={<CheckCircleOutlined />}>
            Settled (Manual)
          </Tag>
        );
      case "NOT_FOUND":
        return (
          <Tag color="red" icon={<WarningOutlined />}>
            Not Found
          </Tag>
        );
      default:
        return (
          <Tag color="orange" icon={<ExclamationCircleOutlined />}>
            Unsettled
          </Tag>
        );
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<ReconciledTransaction> = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Amount (₹)",
      dataIndex: "transactionAmount",
      render: (amt) => `₹${amt.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "reconciliationStatus",
      render: renderStatus,
    },
  ];

  /* ================= ROW SELECTION ================= */

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) =>
      setSelectedRowKeys(keys as number[]),
    getCheckboxProps: (record: ReconciledTransaction) => ({
      disabled:
        record.reconciliationStatus === "SETTLED" ||
        record.reconciliationStatus === "MATCHED",
    }),
  };

  /* ================= PAGINATION ================= */

  const paginationConfig: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: data.length,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    onChange: (page, size) => {
      setCurrentPage(page);
      if (size) setPageSize(size);
    },
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Typography.Title level={2}>Bank Reconciliation</Typography.Title>
        <Typography.Text type="secondary">
          Upload bank statements, review auto matches, and manually settle
          unmatched transactions.
        </Typography.Text>
      </div>

      {isProcessing && (
        <Alert
          type="info"
          showIcon
          icon={<LoadingOutlined />}
          message="We’re processing your bank statement"
          description="This may take a few moments. The data will refresh automatically."
        />
      )}

      <Card title="Upload Bank Statement">
        <Space>
          <Upload
            accept=".xlsx,.xls,.csv"
            maxCount={1}
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              Select File
            </Button>
          </Upload>

          <Button
            type="primary"
            loading={uploading}
            onClick={handleUpload}
          >
            Upload & Process
          </Button>
        </Space>
      </Card>

      <Space>
        <Button
          type={activeView === "DEFAULT" ? "primary" : "default"}
          onClick={() => setActiveView("DEFAULT")}
        >
          Unsettled / Not Found
        </Button>

        <Button
          type={activeView === "MATCHED" ? "primary" : "default"}
          onClick={() => setActiveView("MATCHED")}
        >
          Matched (Auto)
        </Button>

        <Button
          type={activeView === "SETTLED" ? "primary" : "default"}
          onClick={() => setActiveView("SETTLED")}
        >
          Settled (Manual)
        </Button>
      </Space>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
          pagination={paginationConfig}
        />
      </Card>

      <Card>
        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button
            type="primary"
            disabled={selectedRowKeys.length === 0}
            onClick={manuallySettleBulk}
          >
            Manually Settle {selectedRowKeys.length} Record
            {selectedRowKeys.length !== 1 ? "s" : ""}
          </Button>
        </Space>
      </Card>
    </Space>
  );
}
