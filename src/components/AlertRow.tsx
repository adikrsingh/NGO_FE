import "../styles/alerts.css";

function AlertRow({ text, count }) {
  return (
    <div className="alert-row">
      <span>{text}</span>
      <strong>{count}</strong>
    </div>
  );
}

export default AlertRow;
