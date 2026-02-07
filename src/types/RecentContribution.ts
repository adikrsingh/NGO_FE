export interface RecentContribution {
  source: string;           // CASH / UPI / BANK
  donorName: string;
  receipt: "Pending" | "Sent";
  status: "CREATED" | "COMPLETED";
  amount: number;
  donationDate: string;     // YYYY-MM-DD
  form80Sent: "Pending" | "Sent";
  staffName: string | null;
}
