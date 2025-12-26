// Database Types based on Supabase schema

export type Gender = 'male' | 'female' | 'other';
export type UserRole = 'realtor' | 'admin';
export type KYCStatus = 'pending' | 'approved' | 'rejected';
export type PropertyType = 'land' | 'housing';
export type PropertyStatus = 'available' | 'sold' | 'pending';
export type ReceiptStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'rejected';

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

export interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    type: PropertyType;
    description?: string | null;
    status: PropertyStatus;
    images?: string[] | null;
    payment_plan?: Record<string, unknown> | null;
    contract_docs?: string[] | null;
    created_at: string;
}

export interface Receipt {
    id: string;
    realtor_id?: string | null;
    client_name: string;
    property_id?: string | null;
    amount: number;
    receipt_file_url: string;
    status: ReceiptStatus;
    created_at: string;
}

export interface Favorite {
    id: string;
    user_id: string;
    property_id: string;
    created_at: string;
    // Optional: Include property details if joined
    property?: Property;
}

export type UserInsert = Omit<User, 'created_at'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;

export type PropertyInsert = Omit<Property, 'id' | 'created_at'>;
export type PropertyUpdate = Partial<Omit<Property, 'id' | 'created_at'>>;

export type ReceiptInsert = Omit<Receipt, 'id' | 'created_at'>;
export type ReceiptUpdate = Partial<Omit<Receipt, 'id' | 'created_at'>>;

export interface Commission {
    id: string;
    amount: number;
    status: CommissionStatus;
    realtor_id: string;
    receipt_id?: string | null;
    created_at: string;
}

export type CommissionInsert = Omit<Commission, 'id' | 'created_at'>;
export type CommissionUpdate = Partial<Omit<Commission, 'id' | 'created_at' | 'realtor_id'>>;

export interface Referral {
    id: string;
    upline_id: string;
    downline_id: string;
    level: number;
    commission_earned: number;
    created_at: string;
    // Joined fields
    downline?: User;
}

export type ReferralInsert = Omit<Referral, 'id' | 'created_at'>;
export type ReferralUpdate = Partial<Omit<Referral, 'id' | 'created_at'>>;

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title?: string | null;
    message?: string | null;
    seen: boolean;
    metadata?: Record<string, unknown> | null;
    created_at: string;
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at' | 'user_id'>>;
