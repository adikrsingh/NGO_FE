import { useEffect, useState } from "react";
import { DonationService } from "../api/donationApi";
import ReceiptModal from "../components/donation/ReceiptModal";
import "../styles/pendingReceipts.css";

type Donation = {
  id: number;
  donor: {
    id: number;
    name: string;
  };
  amount: number;
  donationDate: string;
  donationSource?: string;
  status?: string;
  receiptSent?: boolean;
  ackSent?: boolean;
};

export default function PendingAcknowledgements() {
  const {
    getPendingAcknowledgements,
    sendAcknowledgement,
  } = DonationService();

  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [openActionId, setOpenActionId] =
    useState<number | null>(null);

  const [selectedDonation, setSelectedDonation] =
    useState<Donation | null>(null);

  const [showReceiptModal, setShowReceiptModal] =
    useState(false);

  const fetchData = () => {
    setLoading(true);
    getPendingAcknowledgements()
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProgressText = (d: Donation) => {
    const receipt = d.receiptSent ? 1 : 0;
    const ack = d.ackSent ? 1 : 0;
    return `${receipt + ack}/2`;
  };

  const handleSendAck = async (id: number) => {
    try {
      await sendAcknowledgement(id);
      fetchData();
      setOpenActionId(null);
    } catch (error) {
      console.error("Failed to send ack", error);
    }
  };

  const handleOpenReceiptModal = (
    donation: Donation
  ) => {
    setSelectedDonation(donation);
    setShowReceiptModal(true);
    setOpenActionId(null);
  };

  const handleCloseModal = () => {
    setShowReceiptModal(false);
    setSelectedDonation(null);

    // Receipt marking already handled inside modal logic
    fetchData();
  };

  return (
    <div className="pending-container">
      <h2 className="page-title">
        Acknowledgement Pending Donations
      </h2>

      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && (
        <div className="empty-box">
          🎉 No pending acknowledgements
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Progress</th>
              </tr>
            </thead>

            <tbody>
              {data.map((donation) => {
                const progress =
                  getProgressText(donation);
                const isHalf =
                  donation.receiptSent === true;

                return (
                  <tr key={donation.id}>
                    <td>
                      {donation.donor?.name}
                    </td>

                    <td>
                      ₹
                      {donation.amount.toLocaleString()}
                    </td>

                    <td>
                      {donation.donationDate}
                    </td>

                    <td>
                      {donation.donationSource ||
                        "Cash"}
                    </td>

                    <td>
                      <span className="status-badge">
                        {donation.status ||
                          "Completed"}
                      </span>
                    </td>

                    <td>
                      {donation.receiptSent
                        ? "✅ Sent"
                        : "❌ Not Sent"}
                    </td>

                    <td className="action-cell">
                      <div className="progress-wrapper">
                        <span
                          className={`progress-badge ${
                            isHalf
                              ? "half"
                              : "zero"
                          }`}
                          onClick={() =>
                            setOpenActionId(
                              openActionId ===
                                donation.id
                                ? null
                                : donation.id
                            )
                          }
                        >
                          {progress}
                        </span>

                        {openActionId ===
                          donation.id && (
                          <div className="action-dropdown">
                            {/* ACK - Always pending on this page */}
                            <button
                              className="btn-modern secondary"
                              onClick={() =>
                                handleSendAck(
                                  donation.id
                                )
                              }
                            >
                              📨 Send Acknowledgement
                            </button>

                            {/* RECEIPT */}
                            {!donation.receiptSent && (
                              <button
                                className="btn-modern primary"
                                onClick={() =>
                                  handleOpenReceiptModal(
                                    donation
                                  )
                                }
                              >
                                📄 Send Receipt
                              </button>
                            )}

                            {donation.receiptSent && (
                              <div className="sent-label">
                                ✅ Receipt Sent
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal &&
        selectedDonation && (
          <ReceiptModal
            visible={showReceiptModal}
            donorName={
              selectedDonation.donor?.name || "Donor"
            }
            amount={
              selectedDonation.amount
            }
            date={
              selectedDonation.donationDate
            }
            paymentMode={
              selectedDonation.donationSource ||
              "Cash"
            }
            donationId={
              selectedDonation.id
            }
            onClose={handleCloseModal}
          />
        )}
    </div>
  );
}
