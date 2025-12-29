import DefaultProfilePic from "../../../assets/Default Profile pic.png";

// Metrics data
export const metricsData = {
    totalRealtors: "1,000,000",
    totalProperties: "100,000",
    pendingReceipts: "50",
    commissionPaid: "₦500M",
    totalSale: "₦500M",
};

// Top realtors data
export const topRealtorsData = [
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: DefaultProfilePic },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: DefaultProfilePic },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: DefaultProfilePic },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: DefaultProfilePic },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: DefaultProfilePic },
];

// Commission data matching Figma: Jan~₦4M, Feb~₦9M, Mar~₦6M, Apr~₦3M, May~₦5M, Jun~₦2M, Jul~₦4M, Aug~₦7M, Sep~₦5M, Oct~₦3M, Nov~₦9M, Dec~₦5M
// Scaled to 0-10 range where 10 = ₦10M
export const commissionData = [4, 9, 6, 3, 5, 2, 4, 7, 5, 3, 9, 5];

// Realtors data for chart
export const realtorsData = [2, 3, 4, 5, 4, 6, 5, 7, 4, 3, 5, 4];

// Recent receipts data
export const recentReceiptsData = [
    {
        receiptId: "#12345",
        property: "Parkview estate",
        realtorName: "Iretiola Okunade",
        realtorAvatar: DefaultProfilePic,
        clientName: "Simisola Okunade",
        dateUploaded: "May 13th, 2025",
        status: "Pending" as const,
    },
    {
        receiptId: "#12345",
        property: "City of David Estate",
        realtorName: "Izuokumo Aganaba",
        realtorAvatar: DefaultProfilePic,
        clientName: "Binaebi Oyintare",
        dateUploaded: "May 13th, 2025",
        status: "Pending" as const,
    },
    {
        receiptId: "#12345",
        property: "Oluwole Estate",
        realtorName: "Seyi Olabode",
        realtorAvatar: DefaultProfilePic,
        clientName: "Safiya Usman",
        dateUploaded: "May 13th, 2025",
        status: "Pending" as const,
    },
    {
        receiptId: "#12345",
        property: "Lagos Estate",
        realtorName: "Kuroebi Timipre",
        realtorAvatar: DefaultProfilePic,
        clientName: "Chinyere Nwankwo",
        dateUploaded: "May 13th, 2025",
        status: "Pending" as const,
    },
    {
        receiptId: "#12345",
        property: "Iyana iba Estate",
        realtorName: "Tonbara Ziworitin",
        realtorAvatar: DefaultProfilePic,
        clientName: "Rahma Ahmad",
        dateUploaded: "May 13th, 2025",
        status: "Pending" as const,
    },
];

// Months array for chart labels
export const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

// Export profile pics for empty state
export {
  DefaultProfilePic as ProfilePic1,
  DefaultProfilePic as ProfilePic2,
  DefaultProfilePic as ProfilePic3,
  DefaultProfilePic as ProfilePic4,
  DefaultProfilePic as ProfilePic5,
};

