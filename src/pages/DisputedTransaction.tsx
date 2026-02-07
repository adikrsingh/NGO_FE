import { Button, Space } from "antd";

type DisputedDonation = {
  id: number;
  donorName: string;
  amount: number;
  description: string;
  claimedBy: string;
};

const mockData: DisputedDonation[] = [
  {
    id: 1,
    donorName: "Ramesh Gupta",
    amount: 5000,
    claimedBy: "Staff - Anjali",
    description: "Donation Received through online payment link",
  },
  {
    id: 2,
    donorName: "Sunita Sharma",
    amount: 10000,
    claimedBy: "Staff - Rahul",
    description: "Donation Received through online payment link",
  },
];

export default function DisputedTransaction() {
  const handleSettleDispute = (id: number) => {
    console.log("Settling dispute for transaction:", id);
    // backend call later
  };

  const handleRejectDispute = (id: number) => {
    console.log("Rejecting dispute for transaction:", id);
    // backend call later
  };

  return (
    <div>
      <h2>Disputed Transactions</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>Donor Name</th>
            <th>Amount</th>
            <th>Claimed By</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {mockData.map((item) => (
            <tr key={item.id}>
              <td>{item.donorName}</td>
              <td>₹{item.amount}</td>
              <td>{item.claimedBy}</td>
              <td>{item.description}</td>
              <td>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => handleSettleDispute(item.id)}
                  >
                    Settle
                  </Button>

                  <Button
                    danger
                    onClick={() => handleRejectDispute(item.id)}
                  >
                    Reject
                  </Button>
                </Space>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
