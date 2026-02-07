import { useNavigate } from "react-router-dom";
import Card from "../common/Card";

export default function UserContext() {
  const navigate = useNavigate();

  return (
    <Card title="Your Context">
      <p><strong>Arun Mehta</strong></p>
      <p className="muted">Tenant Admin</p>

      <hr />

      <p className="section-title">Pending Tasks</p>

      <p
        className="task-link"
        onClick={() => navigate("/disputedTransaction")}
      >
        Review disputed transaction
      </p>
    </Card>
  );
}
