export interface DonorType {
  id?: number;
  tenantId: number | null;
  name: string;
  email: string;
  phone: string;
  pan: string;
  panVerified: boolean | null;
  status: string | null;
}
