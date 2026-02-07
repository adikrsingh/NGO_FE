import { useEffect, useState } from "react";
import Card from "../common/Card";
import { DonationService } from "../../api/donationApi";

type FlowItem = {
  label: string;
  value: number;
};

export default function DonationFlowStatus() {
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { getDonationFlowStats } = DonationService();

  useEffect(() => {
    getDonationFlowStats()
      .then((res) => {
        setFlows([
          { label: "Donations Logged", value: res.totalDonations },
          { label: "Paid", value: res.paidDonations },
          { label: "Receipt Sent", value: res.receiptSent },
          { label: "Certificate Issued", value: res.certificateIssued },
        ]);
      })
      .catch((err) =>
        console.error("Failed to fetch donation flow stats", err)
      )
      .finally(() => setLoading(false));
  }, []);

  const conversionRate =
    flows.length > 0 && flows[0].value > 0
      ? ((flows[3].value / flows[0].value) * 100).toFixed(1)
      : "0";

  return (
    <Card title="Donation Flow Status">
      {loading ? (
        <p>Loading donation flow...</p>
      ) : (
        <>
          <div className="flow-container">
            {flows.map((f, i) => (
              <div key={i} className="flow-row">
                <span className="flow-label">{f.label}</span>
                <span className="flow-value">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="flow-footer">
            <span>Conversion Rate</span>
            <strong>{conversionRate}%</strong>
          </div>
        </>
      )}
    </Card>
  );
}
