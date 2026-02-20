import Button from "../common/Button";

interface DonationActionsProps {
  isSubmitting: boolean;
  handleSubmit: () => void;
  onCancel: () => void;
  is80G: boolean;
  deliveryMethod: string;
}

export default function DonationActions({
  isSubmitting,
  handleSubmit,
  onCancel,
  is80G,
  deliveryMethod,
}: DonationActionsProps) {

  const showShare = is80G && (deliveryMethod === "BOTH" || deliveryMethod === "EMAIL");

  return (
    <div className="donation-footer">
      <div className="footer-left">
        <a href="/dashboard" className="back-link">
          ← Back to Dashboard
        </a>
      </div>

      <div className="footer-right">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="primary" onClick={handleSubmit}>
          {showShare ? "Save & Share Receipt" : "Save Donation"}
        </Button>
      </div>
    </div>
  );
}
