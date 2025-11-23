export interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    status: "Sent" | "Failed";
    userType?: string; // e.g., "Realtors", "Developers", "All Users"
    selectedUsers?: string[]; // Array of selected user names
}

export const mockNotifications: Notification[] = [
    {
        id: "#1",
        title: "Promo on Land",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 13th, 2025",
        status: "Sent",
    },
    {
        id: "#2",
        title: "30% off",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 13th, 2025",
        status: "Sent",
    },
    {
        id: "#3",
        title: "Christmas Bonaza",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 13th, 2025",
        status: "Failed",
    },
    {
        id: "#4",
        title: "Another title",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 13th, 2025",
        status: "Failed",
    },
    {
        id: "#5",
        title: "Another title",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 13th, 2025",
        status: "Sent",
    },
    {
        id: "#6",
        title: "New Property Listing",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 14th, 2025",
        status: "Sent",
    },
    {
        id: "#7",
        title: "Weekly Newsletter",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 14th, 2025",
        status: "Failed",
    },
    {
        id: "#8",
        title: "Special Offer",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 15th, 2025",
        status: "Sent",
    },
    {
        id: "#9",
        title: "System Update",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 15th, 2025",
        status: "Failed",
    },
    {
        id: "#10",
        title: "Welcome Message",
        message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget.",
        date: "May 16th, 2025",
        status: "Sent",
    },
];

