import { useNavigate } from "react-router-dom";
import Card from "../common/Card";

export default function UserContext() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "STAFF";
  const staffId = localStorage.getItem("staffId") || "2";
  const isStaff = role === "STAFF";

  return (
    <Card title="Your Context">
      <p><strong>Arun Mehta</strong></p>
      <p className="muted">{isStaff ? `Fundraising Staff · ID ${staffId}` : "Tenant Admin"}</p>

      <hr />

      <p className="section-title">Quick Links</p>

      <p className="task-link" onClick={() => navigate("/disputedTransaction")}>
        {isStaff ? "View my commission" : "Review disputed transactions"}
      </p>
      <p className="task-link" onClick={() => navigate("/actions")}>Open actions board</p>
      <p className="task-link" onClick={() => navigate(isStaff ? "/my-claims" : "/reconcile")}>
        {isStaff ? "My claims status" : "Reconciliation queue"}
      </p>
      <p className="task-link" onClick={() => navigate("/pending-receipts")}>Pending receipts</p>
    </Card>
  );
}
