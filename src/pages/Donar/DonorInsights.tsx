import { Row, Col, Divider, Button, Tag } from "antd";
import Card from "../../components/common/Card";
import { donorInsightsMock } from "./mockDonorInsights";

export default function DonorInsights() {
  const {
    avgDonation,
    repeatRate,
    momGrowth,
    topDonor,
    topDonors,
  } = donorInsightsMock;

  return (
    <div style={{ marginBottom: 24 }}>
      <Card title="Donor Insights">
        {/* Top metrics row */}
        <Row gutter={24} align="middle">
          <Col span={4}>
            <div style={{ fontSize: 12, color: "#888" }}>
              Avg. Donation Value
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              ₹{avgDonation.toLocaleString()}
            </div>
          </Col>

          <Col span={4}>
            <div style={{ fontSize: 12, color: "#888" }}>
              Repeat Rate
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {repeatRate}%
            </div>
          </Col>

          <Col span={4}>
            <div style={{ fontSize: 12, color: "#888" }}>
              MoM Growth
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              +{momGrowth}%
            </div>
          </Col>

          <Col span={6}>
            <div style={{ fontSize: 12, color: "#888" }}>
              Top Donor
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {topDonor} <Tag color="blue">#1</Tag>
            </div>
          </Col>

          <Col span={6} style={{ textAlign: "right" }}>
            <Button type="default">Send Certificate</Button>
          </Col>
        </Row>

        <Divider />

        {/* Top 10 donors */}
        <div style={{ fontWeight: 600, marginBottom: 12 }}>
          Top 10 Donors by Value
        </div>

        <Row gutter={[16, 8]}>
          {topDonors.map((donor, index) => (
            <Col span={12} key={index}>
              <span style={{ color: "#555" }}>
                {index + 1}. {donor.name}
              </span>
              <span style={{ float: "right", fontWeight: 500 }}>
                {donor.amount}
              </span>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
