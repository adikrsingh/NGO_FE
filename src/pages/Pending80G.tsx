import { useEffect, useState } from "react";
import { DonationService } from "../api/donationApi";

type Certificate80G = {
  id: number;
  donor: {
    name: string;
  };
  amount: number;
  donationDate: string;
};

export default function Pending80G() {
  const { getPending80GDonations } = DonationService();

  const [data, setData] = useState<Certificate80G[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPending80GDonations()
      .then(setData)
      .catch((err) =>
        console.error("Failed to fetch pending 80G donations", err)
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSend80G = (id: number) => {
    console.log("Send 80G certificate for donation id:", id);
    // backend call later
  };

  return (
    <div>
      <h2>80G Certificates Pending</h2>

      {loading && <p>Loading pending certificates...</p>}

      {!loading && data.length === 0 && (
        <p>No pending 80G certificates 🎉</p>
      )}

      {!loading && data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Amount</th>
              <th>Donation Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.donor.name}</td>
                <td>₹{item.amount.toLocaleString()}</td>
                <td>{item.donationDate}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => handleSend80G(item.id)}
                  >
                    Send 80G Certificate
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
