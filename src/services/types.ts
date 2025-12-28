export type Gender = "male" | "female" | "other";
export type UserRole = "realtor" | "admin";
export type KYCStatus = "pending" | "approved" | "rejected";
export type PropertyType = "land" | "housing";
export type PropertyStatus = "available" | "sold" | "pending";
export type ReceiptStatus = "pending" | "approved" | "rejected" | "under_review";
export type CommissionStatus = "pending" | "approved" | "paid" | "rejected";
export type DeveloperStatus = "Active" | "Removed" | "active" | "removed";

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

export interface Developer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalProperties: number;
  dateAdded: string;
  status: DeveloperStatus;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: PropertyType;
  description?: string | null;
  status: PropertyStatus;
  images?: string[] | null;
  developer_id?: string | null;
  payment_plan?: Record<string, unknown> | null;
  contract_docs?: string[] | null;
  category?: string | null;
  commission_percent?: number | null;
  land_size_sqm?: number | null;
  security?: string | null;
  accessibility?: string | null;
  topography?: string | null;
  created_at: string;
}

export interface Receipt {
  id: string;
  realtor_id?: string | null;
  client_name: string;
  property_id?: string | null;
  amount: number;
  receipt_file_url?: string | null;
  status: ReceiptStatus;
  created_at: string;
}

export interface Commission {
  id: string;
  amount: number;
  status: CommissionStatus;
  realtor_id: string;
  receipt_id?: string | null;
  created_at: string;
}
