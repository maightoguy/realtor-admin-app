import ProfilePic1 from "../../../assets/Profile 1.jpg";
import ProfilePic2 from "../../../assets/Profile 2.jpg";
import ProfilePic3 from "../../../assets/Profile 3.jpg";
import ProfilePic4 from "../../../assets/Profile 4.jpg";
import ProfilePic5 from "../../../assets/Profile 5.jpg";

export interface Realtor {
    id: string;
    name: string;
    email: string;
    avatar: string;
    propertySold: number;
    amountSold: string;
    dateJoined: string;
    status: "Active" | "Inactive";
}

// Sample realtor names
const realtorNames = [
    "Iretiola Okunade",
    "Izuokumo Aganaba",
    "Seyi Olabode",
    "Kuroebi Timipre",
    "Tonbara Ziworitin",
    "Kemi Durojaiye",
    "Tunde Alabi",
    "Ngozi Eze",
    "Aisha Bello",
    "Femi Adebayo",
    "Chika Okoro",
    "Hassan Musa",
    "Precious Eke",
    "Segun Kolawole",
    "Zara Ibrahim",
    "Ifeanyi Ude",
    "Adeola Ogunleye",
    "Bisi Adeyemi",
    "Chidi Nwosu",
    "Damilola Akinwale",
];

const avatars = [ProfilePic1, ProfilePic2, ProfilePic3, ProfilePic4, ProfilePic5];

const dates = [
    "May 13th, 2025",
    "May 14th, 2025",
    "May 15th, 2025",
    "May 16th, 2025",
    "May 17th, 2025",
    "April 10th, 2025",
    "April 15th, 2025",
    "March 20th, 2025",
    "March 25th, 2025",
    "February 18th, 2025",
];

const amounts = [
    "₦100,000",
    "₦150,000",
    "₦200,000",
    "₦250,000",
    "₦300,000",
    "₦350,000",
    "₦400,000",
    "₦450,000",
    "₦500,000",
];

const propertySoldCounts = [50, 75, 100, 125, 150, 175, 200, 225, 250];

const statuses: Realtor["status"][] = ["Active", "Inactive"];

// Generate mock realtors data
export const mockRealtors: Realtor[] = [
    {
        id: "#1234",
        name: "Iretiola Okunade",
        email: "olivia@untitledui.com",
        avatar: ProfilePic1,
        propertySold: 100,
        amountSold: "₦100,000",
        dateJoined: "May 13th, 2025",
        status: "Active",
    },
    {
        id: "#1235",
        name: "Izuokumo Aganaba",
        email: "olivia@untitledui.com",
        avatar: ProfilePic2,
        propertySold: 100,
        amountSold: "₦100,000",
        dateJoined: "May 13th, 2025",
        status: "Active",
    },
    {
        id: "#1236",
        name: "Seyi Olabode",
        email: "olivia@untitledui.com",
        avatar: ProfilePic3,
        propertySold: 100,
        amountSold: "₦100,000",
        dateJoined: "May 13th, 2025",
        status: "Inactive",
    },
    {
        id: "#1237",
        name: "Kuroebi Timipre",
        email: "olivia@untitledui.com",
        avatar: ProfilePic4,
        propertySold: 100,
        amountSold: "₦100,000",
        dateJoined: "May 13th, 2025",
        status: "Inactive",
    },
    {
        id: "#1238",
        name: "Tonbara Ziworitin",
        email: "olivia@untitledui.com",
        avatar: ProfilePic5,
        propertySold: 100,
        amountSold: "₦100,000",
        dateJoined: "May 13th, 2025",
        status: "Active",
    },
    // Generate more realtors to have a substantial dataset
    ...Array.from({ length: 95 }, (_, i) => {
        const nameIndex = (i + 5) % realtorNames.length;
        const avatarIndex = (i + 5) % avatars.length;
        const dateIndex = (i + 5) % dates.length;
        const amountIndex = (i + 5) % amounts.length;
        const propertyIndex = (i + 5) % propertySoldCounts.length;
        const statusIndex = Math.floor(Math.random() * statuses.length);

        return {
            id: `#${1239 + i}`,
            name: realtorNames[nameIndex],
            email: `${realtorNames[nameIndex].toLowerCase().replace(/\s+/g, ".")}@untitledui.com`,
            avatar: avatars[avatarIndex],
            propertySold: propertySoldCounts[propertyIndex],
            amountSold: amounts[amountIndex],
            dateJoined: dates[dateIndex],
            status: statuses[statusIndex],
        };
    }),
];

