import { DonorType } from "../Donar/types";

export enum DonationStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface DonationType {
  id?: number;
  tenantId: number | null;
  donor: DonorType;
  staffId: number;
  donationCategoryId: number | null;
  donationSourceId: number | null;
  donationCampaignId: number | null;
  amount: number;
  purpose: string;
  status: DonationStatus;
  ackSent: boolean | null;
  form80Sent: boolean | null;
  receiptSent: boolean | null;
  thanksgivingSent: boolean | null;
  donationDate: string | null;
}
