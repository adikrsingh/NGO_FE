import { useEffect, useState } from "react";
import { DonationService } from "../api/donationApi";
import ReceiptModal from "../components/donation/ReceiptModal";
import "../styles/pendingReceipts.css";

type Donation = {
  id: number;
  donor: {
    name: string;
  };
  amount: number;
  donationDate: string;
  donationSource?: string;
  status?: string;
  receiptSent?: boolean;
  ackSent?: boolean;
};

export default function PendingReceipts() {
  const { getPendingReceiptDonations, sendAcknowledgement } =DonationService();

  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] =
    useState<Donation | null>(null);
  const [showReceiptModal, setShowReceiptModal] =
    useState(false);
  const [openActionId, setOpenActionId] =
    useState<number | null>(null);

  // ---------------- Fetch Data ----------------
  const fetchData = () => {
    setLoading(true);
    getPendingReceiptDonations()
      .then(setData)
      .catch((err) =>
        console.error(
          "Failed to fetch pending receipts",
          err
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- Progress Counter ----------------
  const getProgressText = (d: Donation) => {
    const receipt = d.receiptSent ? 1 : 0;
    const ack = d.ackSent ? 1 : 0;
    return `${receipt + ack}/2`;
  };

  // ---------------- Handlers ----------------
  const handleCloseModal = () => {
    setShowReceiptModal(false);
    setSelectedDonation(null);
    fetchData();
  };

  const handleSendReceipt = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowReceiptModal(true);
    setOpenActionId(null);
  };

  const handleSendAck = async (id: number) => {
    try {
      await sendAcknowledgement(id);
      fetchData();
      setOpenActionId(null);
    } catch (error) {
      console.error(
        "Failed to send acknowledgement",
        error
      );
    }
  };

  return (
    <div className="pending-container">
      <h2 className="page-title">
        Donations Pending Receipt
      </h2>

      {loading && <p>Loading pending receipts...</p>}

      {!loading && data.length === 0 && (
        <div className="empty-box">
          🎉 No pending receipts
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
                <th>LOA</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((donation) => {
                const progress =
                  getProgressText(donation);
                const isHalf =
                  donation.ackSent === true;

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
                      {donation.ackSent
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
                            {!donation.receiptSent && (
                              <button
                                className="btn-modern primary"
                                onClick={() =>
                                  handleSendReceipt(
                                    donation
                                  )
                                }
                              >
                                📄 Send Receipt
                              </button>
                            )}

                            {!donation.ackSent && (
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
                            )}

                            {donation.ackSent && (
                              <div className="sent-label">
                                ✅
                                Acknowledgement
                                Sent
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

      {/* -------- Receipt Modal -------- */}
      {showReceiptModal &&
        selectedDonation && (
          <ReceiptModal
            visible={showReceiptModal}
            donationId={
              selectedDonation.id
            }
            onClose={handleCloseModal}
          />
        )}
    </div>
  );
}
