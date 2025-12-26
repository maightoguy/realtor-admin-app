export type Gender = "male" | "female" | "other";
export type UserRole = "realtor" | "admin";
export type KYCStatus = "pending" | "approved" | "rejected";

export interface BankAccount {
  bankName: string;
  accountNo: string;
  accountName: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender?: Gender | null;
  role: UserRole;
  referral_code: string;
  referred_by?: string | null;
  bank_details?: BankAccount[] | null;
  id_document_url?: string | null;
  kyc_status: KYCStatus;
  created_at: string;
  avatar_url?: string | null;
}

