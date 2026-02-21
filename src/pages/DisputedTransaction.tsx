import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useApi } from "../api/useApi";

type DisputeStatus = "CREATED" | "APPROVED" | "REJECTED";

type StaffClaim = {
  id: number;
  bankTransactionId: string;
  bankAmount: number;
  bankTransactionDate: string;
  donationAmount: number;
  donorName: string;
  disputeStatus: DisputeStatus;
  claimedAt: string;
  reviewedAt?: string;
};

type PendingReconciliation = {
  reconciliationId: number;
  claimsCount: number;
  bankTransactionId: string;
  bankAmount: number;
  bankDate: string;
};

type AdminClaim = {
  id: number;
  staffName: string;
  donationAmount: number;
  donorName: string;
  claimedAt: string;
  disputeStatus: DisputeStatus;
  reconciliationId?: number;
  bankTransactionId?: string;
  bankAmount?: number;
  bankDate?: string;
};

const COMMISSION_RATE = 0.05;

export default function DisputedTransaction() {
  const role = localStorage.getItem("role") || "STAFF";
  const isStaff = role === "STAFF";
  const staffId = localStorage.getItem("staffId") || "2";

  const { baseApi } = useApi();
  const api = baseApi();

  const [loading, setLoading] = useState(false);
  const [staffClaims, setStaffClaims] = useState<StaffClaim[]>([]);
  const [adminDisputes, setAdminDisputes] = useState<AdminClaim[]>([]);

  const fetchStaffClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/donations/disputes/staff/${staffId}`);
      setStaffClaims(res.data || []);
    } catch (err: any) {
      message.error(err?.response?.data || "Failed to load your commission data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminDisputes = async () => {
    try {
      setLoading(true);

      // Primary expected endpoint: all disputes from disputed_transaction table.
      try {
        const directRes = await api.get("/donations/disputes");
        const normalized = (directRes.data || []).map((row: any) => ({
          id: row.id,
          donorName: row.donorName,
          staffName: row.staffName,
          donationAmount: row.donationAmount,
          claimedAt: row.claimedAt,
          disputeStatus: row.disputeStatus,
          bankTransactionId: row.bankTransactionId,
          bankAmount: row.bankAmount,
          bankDate: row.bankDate,
        }));
        setAdminDisputes(normalized);
        return;
      } catch {
        // Fallback: build disputed view from pending reconciliation + claims pages.
      }

      const pendingRes = await api.get(
        `/admin/reconciliation/pending?page=0&size=50`
      );

      const pendingRows: PendingReconciliation[] = pendingRes.data?.content || [];
      const multiClaimRows = pendingRows.filter((row) => (row.claimsCount || 0) > 1);

      const claimsLists = await Promise.all(
        multiClaimRows.map(async (row) => {
          const claimsRes = await api.get(
            `/admin/reconciliation/claims/pages/${row.reconciliationId}?page=0&size=20`
          );

          const claims = claimsRes.data?.content || claimsRes.data || [];

          return claims.map((claim: any) => ({
            id: claim.id,
            donorName: claim.donorName,
            staffName: claim.staffName,
            donationAmount: claim.donationAmount,
            claimedAt: claim.claimedAt,
            disputeStatus: claim.disputeStatus,
            reconciliationId: row.reconciliationId,
            bankTransactionId: row.bankTransactionId,
            bankAmount: row.bankAmount,
            bankDate: row.bankDate,
          }));
        })
      );

      setAdminDisputes(claimsLists.flat());
    } catch {
      message.error("Failed to load disputed transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchStaffClaims();
      return;
    }

    fetchAdminDisputes();
  }, [isStaff, staffId]);

  const approvedClaims = useMemo(
    () => staffClaims.filter((row) => row.disputeStatus === "APPROVED"),
    [staffClaims]
  );

  const pendingClaims = useMemo(
    () => staffClaims.filter((row) => row.disputeStatus === "CREATED"),
    [staffClaims]
  );

  const totalCommission = useMemo(
    () => approvedClaims.reduce((acc, row) => acc + row.donationAmount * COMMISSION_RATE, 0),
    [approvedClaims]
  );

  const pendingCommission = useMemo(
    () => pendingClaims.reduce((acc, row) => acc + row.donationAmount * COMMISSION_RATE, 0),
    [pendingClaims]
  );

  const staffColumns: ColumnsType<StaffClaim> = [
    { title: "Donor", dataIndex: "donorName" },
    {
      title: "Donation",
      dataIndex: "donationAmount",
      render: (amount) => `₹${Number(amount || 0).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "disputeStatus",
      render: (status: DisputeStatus) => {
        if (status === "APPROVED") return <Tag color="green">Approved</Tag>;
        if (status === "REJECTED") return <Tag color="red">Rejected</Tag>;
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: "Commission (5%)",
      render: (_, record) => `₹${(record.donationAmount * COMMISSION_RATE).toLocaleString()}`,
    },
    {
      title: "Eligible",
      render: (_, record) =>
        record.disputeStatus === "APPROVED" ? (
          <Tag color="green">Yes</Tag>
        ) : (
          <Tag color="default">No</Tag>
        ),
    },
    { title: "Claimed At", dataIndex: "claimedAt" },
  ];

  const adminColumns: ColumnsType<AdminClaim> = [
    { title: "Donor", dataIndex: "donorName" },
    { title: "Staff", dataIndex: "staffName" },
    {
      title: "Donation",
      dataIndex: "donationAmount",
      render: (amount) => `₹${Number(amount || 0).toLocaleString()}`,
    },
    {
      title: "Bank Txn",
      dataIndex: "bankTransactionId",
      render: (val) => val || "-",
    },
    {
      title: "Status",
      dataIndex: "disputeStatus",
      render: (status: DisputeStatus) => {
        if (status === "APPROVED") return <Tag color="green">Approved</Tag>;
        if (status === "REJECTED") return <Tag color="red">Rejected</Tag>;
        return <Tag color="orange">Pending Review</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={async () => {
              try {
                await api.put(`/donations/approve-claim/${record.id}`);
                message.success("Claim approved");
                fetchAdminDisputes();
              } catch {
                message.error("Approval failed");
              }
            }}
          >
            Approve
          </Button>
          <Button
            danger
            onClick={async () => {
              try {
                await api.put(`/donations/dispute/reject/${record.id}`);
                message.success("Claim rejected");
                fetchAdminDisputes();
              } catch {
                message.error("Reject failed");
              }
            }}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  if (isStaff) {
    return (
      <div>
        <h2>My Commission</h2>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Eligible Commission" value={totalCommission} prefix="₹" precision={2} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Potential (Pending)" value={pendingCommission} prefix="₹" precision={2} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Approved Claims" value={approvedClaims.length} />
            </Card>
          </Col>
        </Row>

        <Table rowKey="id" loading={loading} columns={staffColumns} dataSource={staffClaims} />
      </div>
    );
  }

  return (
    <Card title="Disputed Transactions">
      <Table rowKey="id" loading={loading} columns={adminColumns} dataSource={adminDisputes} />
    </Card>
  );
}
