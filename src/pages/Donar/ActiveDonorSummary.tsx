import { Row, Col } from "antd";
import Card from "../../components/common/Card";
import { donorSummaryMock } from "./mockDonorInsights";

export default function ActiveDonorSummary() {
  const { totalActive, newDonors, repeatDonors } = donorSummaryMock;

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Card>
          <h4>Total Active Donors</h4>
          <h2>{totalActive}</h2>
        </Card>
      </Col>

      <Col span={8}>
        <Card>
          <h4>New Donors</h4>
          <h2>{newDonors}</h2>
        </Card>
      </Col>

      <Col span={8}>
        <Card>
          <h4>Repeat Donors</h4>
          <h2>{repeatDonors}</h2>
        </Card>
      </Col>
    </Row>
  );
}
