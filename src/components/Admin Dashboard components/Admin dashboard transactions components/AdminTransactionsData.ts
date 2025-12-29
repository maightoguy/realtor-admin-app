export interface Transaction {
  id: string;
  realtorId: string;
  realtorName: string;
  type: "Commission" | "Withdrawal";
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Rejected";
  bankName?: string;
  accountNumber?: string;
  accountBalance?: string;
  rejectionReason?: string;
}

