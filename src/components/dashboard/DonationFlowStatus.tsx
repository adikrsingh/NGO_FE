import { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import { DonationService } from "../../api/donationApi";

type FlowRow = {
  label: string;
  value: number;
  color: string;
};

export default function DonationFlowStatus() {
  const [rows, setRows] = useState<FlowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const { getDonationFlowStats } = DonationService();

  useEffect(() => {
    getDonationFlowStats()
      .then((res) => {
        setRows([
          { label: "Logged", value: Number(res.totalDonations || 0), color: "#2563eb" },
          { label: "Paid", value: Number(res.paidDonations || 0), color: "#0f766e" },
          { label: "Receipt Sent", value: Number(res.receiptSent || 0), color: "#dc2626" },
        ]);
      })
      .catch((err) => console.error("Failed to fetch donation flow stats", err))
      .finally(() => setLoading(false));
  }, []);

  const base = rows[0]?.value || 0;
  const completion = useMemo(() => {
    if (!base || !rows[2]) {
      return 0;
    }
    return Math.round((rows[2].value / base) * 1000) / 10;
  }, [base, rows]);

  return (
    <Card title="Donation Pipeline">
      {loading ? (
        <p>Loading donation flow...</p>
      ) : (
        <div className="flow-pipeline-card">
          <div className="flow-pipeline-top">
            <span className="flow-pipeline-subtitle">DONATION PIPELINE</span>
            <span className="flow-pipeline-pill">{completion}% completion</span>
          </div>

          {rows.map((item, idx) => {
            const width = base > 0 ? `${Math.max(6, (item.value / base) * 100)}%` : "0%";
            const drop = idx === 0 ? 0 : Math.max(0, rows[idx - 1].value - item.value);

            return (
              <div key={item.label} className="flow-pipeline-row">
                <div className="flow-pipeline-label-wrap">
                  <span className="flow-pipeline-label">{item.label}</span>
                  <span className="flow-pipeline-value">{item.value}</span>
                  {idx > 0 && <span className="flow-pipeline-drop">-{drop}</span>}
                </div>
                <div className="flow-pipeline-track">
                  <div
                    className="flow-pipeline-fill"
                    style={{ width, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
