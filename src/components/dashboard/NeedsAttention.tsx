import Card from "../common/Card";
import { useNavigate } from "react-router-dom";

type NeedsAttentionProps = {
  pendingReceipts: number;
  pending80G: number;
};

export default function NeedsAttention({
  pendingReceipts,
  pending80G,
}: NeedsAttentionProps) {
  const navigate = useNavigate();

  const alerts = [
    {
      label: "Donations pending receipt generation",
      count: pendingReceipts,
      type: "error",
      route: "/pending-receipts",
    },
    {
      label: "80G certificates pending",
      count: pending80G,
      type: "error",
      route: "/pending-80g",
    },
    {
      label: "Event reconciliation pending",
      count: 1,
      type: "info",
    },
    {
      label: "Corporate utilisation report due (Coming Soon)",
      count: 1,
      type: "warning",
    },
    
  ];

  return (
    <Card title="Needs Attention">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`alert ${a.type}`}
          onClick={() => a.route && navigate(a.route)}
          style={{
            cursor: a.route ? "pointer" : "default",
          }}
        >
          <span>{a.label}</span>
          <strong>{a.count}</strong>
        </div>
      ))}
    </Card>
  );
}
