export interface StaffDonationDashboard {
  staffId: number;
  staffName: string;

  totalDonations: number;

  dailyDonations: Record<string, number>;
  monthlyDonations: Record<string, number>;

  pendingAcknowledgements: number;
  nonIssueCount: number; // For 80G certificates, payment not received, etc.

  receiptIssued: number;
  receiptNotIssued: number;
}
