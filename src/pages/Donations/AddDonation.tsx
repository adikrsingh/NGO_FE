import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DonationForm from "../../components/donation/DonationForm";
import { DonationService } from "../../api/donationApi";
import "../../styles/addDonation.css";

/** Category allocation model */
interface CategoryAllocation {
  category: string;
  amount: number;
}

export default function AddDonation() {
  const navigate = useNavigate();
  const { addDonation } = DonationService();

  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (formData: {
    donorId: number;
    amount: number;
    purpose: string;
    paymentMode: string;
    transactionId: string;
    date: string;
    categories: CategoryAllocation[];
  }) => {
    setIsAddingDonation(true);

    try {
      await addDonation({
        donorId: formData.donorId,
        staffId: 2, // TODO: replace with logged-in staff ID
        amount: formData.amount,
        purpose: formData.purpose,
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId,
        date: formData.date,
        categories: formData.categories, 
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("Failed to add donation");
    } finally {
      setIsAddingDonation(false);
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
