import { mockRealtors } from "../Admin dashboard realtors components/AdminRealtorsData";

export interface Transaction {
    id: string;
    realtorId: string;
    realtorName: string;
    type: "Commission" | "Withdrawal";
    amount: string;
    date: string;
    status: "Paid" | "Pending" | "Rejected";
    // Additional fields for withdrawal details
    bankName?: string;
    accountNumber?: string;
    accountBalance?: string;
}

// Generate mock transactions
export const mockTransactions: Transaction[] = [
    {
        id: "#1234",
        realtorId: "#1234",
        realtorName: "Iretiola Okunade",
        type: "Commission",
        amount: "₦100,000",
        date: "May 13th, 2025",
        status: "Paid",
    },
    {
        id: "#1235",
        realtorId: "#1235",
        realtorName: "Izuokumo Aganaba",
        type: "Withdrawal",
        amount: "₦100,000",
        date: "May 13th, 2025",
        status: "Paid",
        bankName: "United bank for Africa",
        accountNumber: "1234567890",
        accountBalance: "₦150,000,000",
    },
    {
        id: "#1236",
        realtorId: "#1236",
        realtorName: "Seyi Olabode",
        type: "Withdrawal",
        amount: "₦100,000",
        date: "May 13th, 2025",
        status: "Rejected",
        bankName: "United bank for Africa",
        accountNumber: "1234567890",
        accountBalance: "₦150,000,000",
    },
    {
        id: "#1237",
        realtorId: "#1237",
        realtorName: "Kuroebi Timipre",
        type: "Withdrawal",
        amount: "₦100,000",
        date: "May 13th, 2025",
        status: "Pending",
        bankName: "United bank for Africa",
        accountNumber: "1234567890",
        accountBalance: "₦150,000,000",
    },
    {
        id: "#1238",
        realtorId: "#1238",
        realtorName: "Tonbara Ziworitin",
        type: "Withdrawal",
        amount: "₦100,000",
        date: "May 13th, 2025",
        status: "Pending",
        bankName: "United bank for Africa",
        accountNumber: "1234567890",
        accountBalance: "₦150,000,000",
    },
    // Generate more transactions
    ...Array.from({ length: 95 }, (_, i) => {
        const realtorIndex = i % mockRealtors.length;
        const realtor = mockRealtors[realtorIndex];
        const types: ("Commission" | "Withdrawal")[] = ["Commission", "Withdrawal"];
        const statuses: ("Paid" | "Pending" | "Rejected")[] = [
            "Paid",
            "Pending",
            "Rejected",
        ];
        const amounts = ["₦100,000", "₦150,000", "₦200,000", "₦250,000", "₦300,000"];
        const dates = [
            "May 13th, 2025",
            "May 14th, 2025",
            "May 15th, 2025",
            "May 16th, 2025",
            "May 17th, 2025",
        ];

        const type = types[i % types.length];
        const status = statuses[i % statuses.length];
        const amount = amounts[i % amounts.length];
        const date = dates[i % dates.length];

        return {
            id: `#${1239 + i}`,
            realtorId: realtor.id,
            realtorName: realtor.name,
            type,
            amount,
            date,
            status,
            ...(type === "Withdrawal" && {
                bankName: "United bank for Africa",
                accountNumber: "1234567890",
                accountBalance: "₦150,000,000",
            }),
        };
    }),
];

