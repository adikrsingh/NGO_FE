import "../styles/table.css";

function DonationTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Donor</th>
          <th>Amount</th>
          <th>Mode</th>
          <th>Status</th>
          <th>Staff</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>15 Jan 2024</td>
          <td>Rajesh Kumar</td>
          <td>₹25,000</td>
          <td>UPI</td>
          <td>Paid</td>
          <td>Priya Sharma</td>
        </tr>
      </tbody>
    </table>
  );
}

export default DonationTable;
