export interface Transaction {
  id: string;
  realtorId: string;
  realtorName: string;
  type: "Commission" | "Withdrawal";
  amount: string;
  date: string;
  status: "Paid" | "Approved" | "Pending" | "Rejected";
  dbStatus: "pending" | "approved" | "paid" | "rejected";
  bankName?: string;
  accountNumber?: string;
  accountBalance?: string;
  rejectionReason?: string;
}
