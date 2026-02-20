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

  // ---------------- SAVE DONATION ----------------
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

  // ---------------- OPEN RECEIPT MODAL ----------------
  const handleOpenReceipt = () => {
    setShowSuccessModal(false);
    setShowReceiptModal(true);
  };

  // ---------------- UPLOAD RECEIPT ----------------
  const handleReceiptConfirm = async (receiptHtml: string) => {
    if (!savedDonation) return;

    try {
      const blob = new Blob([receiptHtml], { type: "text/html" });
      const uploadData = new FormData();
      uploadData.append("file", blob, "receipt.html");
      uploadData.append("category", "RECEIPT");

      await baseApi().post(
        `/donationsfiles/${savedDonation.id}/files`,
        uploadData
      );

      alert("Receipt saved successfully.");

    } catch (error) {
      console.error(error);
      alert("Failed to upload receipt");
    }
  };

  return (
    <div className="add-donation-wrapper">
      <h2>Add New Donation</h2>

      <DonationForm
        onSubmit={handleSubmit}
        isSubmitting={isAddingDonation}
      />

      {isAddingDonation && <p>Saving donation...</p>}

      {/* RECEIPT MODAL */}
      {showReceiptModal && (
        <ReceiptModal
          visible={showReceiptModal}
          donorName={savedFormData?.donorName}
          amount={savedFormData?.amount}
          date={savedFormData?.date}
          paymentMode={savedFormData?.paymentMode}
          donationId={savedDonation?.id}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="donation-modal-overlay">
          <div className="donation-modal">
            <h3>✅ Donation Created Successfully</h3>
            <p>What would you like to do next?</p>

            <div className="donation-modal-actions">

              <button
                className="donation-btn donation-btn-primary"
                onClick={() => window.location.reload()}
              >
                Add New Donation
              </button>

              <button
                className="donation-btn donation-btn-secondary"
                onClick={handleOpenReceipt}
              >
                Share Receipt
              </button>

              <button
                className="donation-btn donation-btn-secondary"
                onClick={() => navigate("/donations")}
              >
                Go Back to Donation List
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
