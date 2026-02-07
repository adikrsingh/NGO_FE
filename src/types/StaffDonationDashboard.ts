export interface StaffDonationDashboard {
  staffId: number;
  staffName: string;

  totalDonations: number;

  dailyDonations: Record<string, number>;
  monthlyDonations: Record<string, number>;

  issueCount: number;     // 80G issued
  nonIssueCount: number;  // 80G pending

  receiptIssued: number;
  receiptNotIssued: number;
}
