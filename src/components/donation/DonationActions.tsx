import Button from "../common/Button";

interface DonationActionsProps { isSubmitting: boolean; handleSubmit: () => void; onCancel: () => void}

export default function DonationActions({ isSubmitting, handleSubmit, onCancel }: DonationActionsProps) {
  return (
    <div className="donation-footer">
      <div className="footer-left">
        <a href="/dashboard" className="back-link">
          ← Back to Dashboard
        </a>
      </div>

      <div className="footer-right">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save Donation</Button>
      </div>
    </div>
  );
}
