import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Row, Statistic, Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  MailOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { DonationService } from "../api/donationApi";
import { StaffDonationDashboard } from "../types/StaffDonationDashboard";
import { PaidVsPending } from "../types/PaidVsPending";
import { useNavigate } from "react-router-dom";

export default function Pending80GPage() {
  const staffId = 2;
  const navigate = useNavigate();
  const { getStaffDonationDashboard, getPaidVsPendingForMonth, getPendingReceiptDonations, getPendingAcknowledgementSummary } = DonationService();

  const [dashboard, setDashboard] = useState<StaffDonationDashboard | null>(null);
  const [payments, setPayments] = useState<PaidVsPending | null>(null);
  const [pendingReceiptsList, setPendingReceiptsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ackPendingCount, setAckPendingCount] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStaffDonationDashboard(staffId),
      getPaidVsPendingForMonth(staffId),
      getPendingReceiptDonations(),
      getPendingAcknowledgementSummary(),
    ])
      .then(([staffData, paymentData, pendingReceipts, ackSummary]) => {
        setDashboard(staffData);
        setPayments(paymentData);
        setPendingReceiptsList(pendingReceipts || []);
        setAckPendingCount(Number(ackSummary?.pendingCount ?? ackSummary?.pendingAcknowledgements ?? staffData?.pendingAcknowledgements ?? 0));
      })
      .catch((err) => console.error("Failed to load 80G summary", err))
      .finally(() => setLoading(false));
  }, [staffId]);

  const receiptIssued = dashboard?.receiptIssued || 0;
  const pendingAcknowledgements = ackPendingCount;
  const receiptNotIssued = pendingReceiptsList.length || dashboard?.receiptNotIssued || 0;
  const receiptSentPaymentPending = dashboard?.nonIssueCount || 0;
  const pendingPaymentAmount = payments?.pendingAmount || 0;
  const totalPaymentAmount = (payments?.paidAmount || 0) + (payments?.pendingAmount || 0);

  const followupCount = receiptNotIssued + receiptSentPaymentPending;

  const eligibleByReceipt = useMemo(() => {
    if (!dashboard || !payments) {
      return 0;
    }

    return Math.max(0, receiptIssued);
  }, [dashboard, payments, receiptIssued]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1>80G & Acknowledgement Center</h1>
      <p style={{ marginTop: -8 }}>
        Manage receipt follow-ups, LOA communication and tax-compliance actions in one place.
      </p>

      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="Compliance view"
        description="Track receipts not yet issued, payments not yet completed, and acknowledgement follow-ups to keep donor communication clean and timely."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Eligible via Receipt"
              value={eligibleByReceipt}
              prefix={<CheckCircleOutlined />}
            />
            <Tag color="green" style={{ marginTop: 8 }}>
              Receipt processed
            </Tag>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Ack Pending"
              value={pendingAcknowledgements}
              prefix={<MailOutlined />}
            />
            <Tag color="gold" style={{ marginTop: 8 }}>
              Needs follow-up
            </Tag>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Receipt Not Issued"
              value={receiptNotIssued}
              prefix={<ClockCircleOutlined />}
            />
            <Tag color="red" style={{ marginTop: 8 }}>
              Priority queue
            </Tag>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="Payment Pending" value={pendingPaymentAmount} prefix="₹" precision={2} />
            <Tag color="blue" style={{ marginTop: 8 }}>
              of ₹{totalPaymentAmount.toLocaleString()} total amount
            </Tag>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Actions</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button icon={<SendOutlined />} type="primary" disabled={pendingAcknowledgements === 0} onClick={() => navigate("/pending-ack")}>
            Send Pending Acknowledgements
          </Button>
          <Button icon={<FileDoneOutlined />} disabled={receiptNotIssued === 0} onClick={() => navigate("/pending-receipts")}>
            Issue Remaining Receipts ({receiptNotIssued})
          </Button>
          <Button type="link">Follow-up Queue: {followupCount}</Button>
        </div>
      </Card>
    </div>
  );
}
