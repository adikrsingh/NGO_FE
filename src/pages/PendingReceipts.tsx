import { useEffect, useState } from "react";
import { DonationService } from  "../api/donationApi";

type Donation = {
  id: number;
  donor: {
    name: string;
  };
  amount: number;
  donationDate: string;
};

export default function PendingReceipts() {
  const { getPendingReceiptDonations } = DonationService();

  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPendingReceiptDonations()
      .then(setData)
      .catch((err) =>
        console.error("Failed to fetch pending receipts", err)
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSendReceipt = (donationId: number) => {
    console.log("Send receipt for donation id:", donationId);
    // backend call later
  };

  return (
    <div>
      <h2>Donations Pending Receipt Generation</h2>

      {loading && <p>Loading pending receipts...</p>}

      {!loading && data.length === 0 && (
        <p>No pending receipts 🎉</p>
      )}

      {!loading && data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((donation) => (
              <tr key={donation.id}>
                <td>{donation.donor.name}</td>
                <td>₹{donation.amount.toLocaleString()}</td>
                <td>{donation.donationDate}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => handleSendReceipt(donation.id)}
                  >
                    Send Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
