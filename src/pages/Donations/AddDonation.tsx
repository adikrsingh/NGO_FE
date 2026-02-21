import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DonationForm from "../../components/donation/DonationForm";
import ReceiptModal from "../../components/donation/ReceiptModal";
import { DonationService } from "../../api/donationApi";
import "../../styles/addDonation.css";
import { useApi } from "../../api/useApi";

interface CategoryAllocation {
  category: string;
  amount: number;
}

export default function AddDonation() {
  const navigate = useNavigate();
  const { addDonation } = DonationService();
  const { baseApi } = useApi();

  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [savedDonation, setSavedDonation] = useState<any>(null);
  const [savedFormData, setSavedFormData] = useState<any>(null);

  const handleSubmit = async (formData: {
    donorId: number;
    donorName?: string;
    amount: number;
    purpose: string;
    paymentMode: string;
    transactionId: string;
    date: string;
    categories: CategoryAllocation[];
    complianceData?: {
      is80G: boolean;
      deliveryMethod: string;
    };
  }) => {
    setIsAddingDonation(true);

    try {
      const donation = await addDonation({
        donorId: formData.donorId,
        staffId: 2,
        amount: formData.amount,
        purpose: formData.purpose,
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId,
        date: formData.date,
        receiptSent: false,
        allocations: formData.categories.map((c) => ({
          campaignName: c.category,
          allocatedAmount: c.amount,
        })),
      });

      const donationId = donation.donationId;
      setSavedDonation({ id: donationId });
      setSavedFormData(formData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("Failed to add donation");
    } finally {
      setIsAddingDonation(false);
    }
  };

  const handleOpenReceipt = () => {
    setShowSuccessModal(false);
    setShowReceiptModal(true);
  };

  const handleReceiptConfirm = async (receiptHtml: string) => {
    if (!savedDonation) return;

    try {
      const blob = new Blob([receiptHtml], { type: "text/html" });
      const uploadData = new FormData();
      uploadData.append("file", blob, "receipt.html");
      uploadData.append("category", "RECEIPT");

      await baseApi().post(`/donationsfiles/${savedDonation.id}/files`, uploadData);
      alert("Receipt saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to upload receipt");
    }
  };

  return (
    <div className="add-donation-wrapper">
      <div className="add-donation-head">
        <h2>Add New Donation</h2>
        <p>Capture donations faster with guided sections and compliant documentation.</p>
      </div>

      <DonationForm onSubmit={handleSubmit} isSubmitting={isAddingDonation} />

      {isAddingDonation && <p>Saving donation...</p>}

      {showReceiptModal && (
        <ReceiptModal
          visible={showReceiptModal}
          donationId={savedDonation?.id}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {showSuccessModal && (
        <div className="donation-modal-overlay">
          <div className="donation-modal">
            <div className="donation-modal-badge">Saved</div>
            <h3>✅ Donation Created Successfully</h3>
            <p>Your donation entry is saved. Choose the next step.</p>

            <div className="donation-modal-actions">
              <button className="donation-btn donation-btn-primary" onClick={() => window.location.reload()}>
                Add New Donation
              </button>

              <button className="donation-btn donation-btn-secondary" onClick={handleOpenReceipt}>
                Share Receipt
              </button>

              <button className="donation-btn donation-btn-secondary" onClick={() => navigate("/donations")}>
                Go Back to Donation List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
