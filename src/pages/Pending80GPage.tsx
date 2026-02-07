    import { useEffect, useState } from "react";
    import { Card, Alert, Button, Space, Statistic, Divider } from "antd";
    import {
    FileTextOutlined,
    ClockCircleOutlined,
    SendOutlined,
    } from "@ant-design/icons";

    import Pending80G from "./Pending80G";



    import { DonationService } from "../api/donationApi";
    import { Pending80GSummary } from "../types/Pending80GSummary";

    export default function Pending80GPage() {
    const [summary, setSummary] = useState<Pending80GSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const { getPending80GSummary } = DonationService();
    useEffect(() => {
        setLoading(true);
        getPending80GSummary()
        .then(setSummary)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1>80G Certificates – Action Center</h1>

        {/* ===== Summary Section ===== */}
        <Card loading={loading} style={{ marginBottom: 24 }}>
            <Space size="large">
            <Statistic
                title="Pending Certificates"
                value={summary?.pendingCount ?? "—"}
                prefix={<FileTextOutlined />}
            />

            <Statistic
                title="Overdue (> 7 days)"
                value={summary?.overdueCount ?? "—"}
                valueStyle={{ color: "#cf1322" }}
                prefix={<ClockCircleOutlined />}
            />

            <Statistic
                title="Pending This Month"
                value={summary?.pendingCount ?? "—"}
                suffix="(current)"
            />
            </Space>
        </Card>

        {/* ===== Attention / Insight Box ===== */}
        {summary && summary.overdueCount > 0 && (
            <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
            message="Attention Required"
            description={
                <>
                {summary.overdueCount} donation(s) have been pending for more
                than <strong>7 days</strong>.  
                Please issue 80G certificates to avoid compliance delays.
                </>
            }
            />
        )}

        {/* ===== Quick Actions ===== */}
        <Card style={{ marginBottom: 24 }}>
            <Space>
            <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={!summary || summary.pendingCount === 0}
            >
                Send All Eligible 80G
            </Button>

            <Button>
                View Issued Certificates
            </Button>

            <Button type="link">
                What is an 80G Certificate?
            </Button>
            </Space>
        </Card>

        <Divider />

        {/* ===== Existing Pending80G Component ===== */}
        <Pending80G />
        </div>
    );
    }
