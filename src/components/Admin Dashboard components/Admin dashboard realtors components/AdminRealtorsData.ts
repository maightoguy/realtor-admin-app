import ProfilePic1 from "../../../assets/Profile 1.jpg";
import ProfilePic2 from "../../../assets/Profile 2.jpg";
import ProfilePic3 from "../../../assets/Profile 3.jpg";
import ProfilePic4 from "../../../assets/Profile 4.jpg";
import ProfilePic5 from "../../../assets/Profile 5.jpg";
import type { SalesStatistics } from "../Admin dashboard properties components/adminDashboardPropertiesData";

export interface Realtor {
    id: string;
    name: string;
    email: string;
    avatar: string;
    propertySold: number;
    amountSold: string;
    dateJoined: string;
    status: "Active" | "Inactive";
    // Additional fields for details view
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: "Male" | "Female" | "Other";
    kycStatus?: "Uploaded" | "Pending" | "Rejected";
    kycDocument?: string;
    salesStatistics?: SalesStatistics;
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

// Helper function to generate sales statistics
const generateSalesStatistics = (seed: number): SalesStatistics => {
    const base = seed * 100000;
    return {
        jan: base + Math.floor(Math.random() * 2000000),
        feb: base + Math.floor(Math.random() * 3000000),
        mar: base + Math.floor(Math.random() * 2500000),
        apr: base + Math.floor(Math.random() * 2000000),
        may: base + Math.floor(Math.random() * 3500000),
        jun: base + Math.floor(Math.random() * 2800000),
        jul: base + Math.floor(Math.random() * 3200000),
        aug: base + Math.floor(Math.random() * 4000000),
        sep: base + Math.floor(Math.random() * 3000000),
        oct: base + Math.floor(Math.random() * 2000000),
        nov: base + Math.floor(Math.random() * 3500000),
        dec: base + Math.floor(Math.random() * 2500000),
    };
};

// Helper function to split name into first and last name
const splitName = (name: string): { firstName: string; lastName: string } => {
    const parts = name.split(" ");
    return {
        firstName: parts[0] || name,
        lastName: parts.slice(1).join(" ") || "",
    };
};

// Generate mock realtors data
export const mockRealtors: Realtor[] = [
    {
        id: "#1234",
        name: "Ummi Idris",
        email: "Veriplot@mail.com",
        avatar: ProfilePic1,
        propertySold: 4,
        amountSold: "₦400,000,000",
        dateJoined: "May 13th, 2025",
        status: "Active",
        firstName: "Ummi",
        lastName: "Idris",
        phone: "0901234567",
        gender: "Male",
        kycStatus: "Uploaded",
        kycDocument: "NIN",
        salesStatistics: {
            jan: 2000000,
            feb: 3500000,
            mar: 1800000,
            apr: 4200000,
            may: 5500000,
            jun: 3800000,
            jul: 6800000,
            aug: 7500000,
            sep: 6200000,
            oct: 4500000,
            nov: 8000000,
            dec: 5000000,
        },
    },
    {
        id: "#1235",
        name: "Izuokumo Aganaba",
        email: "izuokumo@untitledui.com",
        avatar: ProfilePic2,
        propertySold: 100,
        amountSold: "₦100,000,000",
        dateJoined: "May 13th, 2025",
        status: "Active",
        firstName: "Izuokumo",
        lastName: "Aganaba",
        phone: "0812345678",
        gender: "Male",
        kycStatus: "Uploaded",
        kycDocument: "NIN",
        salesStatistics: generateSalesStatistics(1),
    },
    {
        id: "#1236",
        name: "Seyi Olabode",
        email: "seyi@untitledui.com",
        avatar: ProfilePic3,
        propertySold: 100,
        amountSold: "₦100,000,000",
        dateJoined: "May 13th, 2025",
        status: "Inactive",
        firstName: "Seyi",
        lastName: "Olabode",
        phone: "0801234567",
        gender: "Female",
        kycStatus: "Pending",
        kycDocument: "NIN",
        salesStatistics: generateSalesStatistics(2),
    },
    {
        id: "#1237",
        name: "Kuroebi Timipre",
        email: "kuroebi@untitledui.com",
        avatar: ProfilePic4,
        propertySold: 100,
        amountSold: "₦100,000,000",
        dateJoined: "May 13th, 2025",
        status: "Inactive",
        firstName: "Kuroebi",
        lastName: "Timipre",
        phone: "0701234567",
        gender: "Male",
        kycStatus: "Rejected",
        kycDocument: "NIN",
        salesStatistics: generateSalesStatistics(3),
    },
    {
        id: "#1238",
        name: "Tonbara Ziworitin",
        email: "tonbara@untitledui.com",
        avatar: ProfilePic5,
        propertySold: 100,
        amountSold: "₦100,000,000",
        dateJoined: "May 13th, 2025",
        status: "Active",
        firstName: "Tonbara",
        lastName: "Ziworitin",
        phone: "0911234567",
        gender: "Female",
        kycStatus: "Uploaded",
        kycDocument: "NIN",
        salesStatistics: generateSalesStatistics(4),
    },
    // Generate more realtors to have a substantial dataset
    ...Array.from({ length: 95 }, (_, i) => {
        const nameIndex = (i + 5) % realtorNames.length;
        const avatarIndex = (i + 5) % avatars.length;
        const dateIndex = (i + 5) % dates.length;
        const amountIndex = (i + 5) % amounts.length;
        const propertyIndex = (i + 5) % propertySoldCounts.length;
        const statusIndex = Math.floor(Math.random() * statuses.length);
        const name = realtorNames[nameIndex];
        const { firstName, lastName } = splitName(name);
        const genders: ("Male" | "Female" | "Other")[] = ["Male", "Female", "Other"];
        const kycStatuses: ("Uploaded" | "Pending" | "Rejected")[] = ["Uploaded", "Pending", "Rejected"];
        const gender = genders[i % genders.length];
        const kycStatus = kycStatuses[i % kycStatuses.length];

        return {
            id: `#${1239 + i}`,
            name,
            email: `${name.toLowerCase().replace(/\s+/g, ".")}@untitledui.com`,
            avatar: avatars[avatarIndex],
            propertySold: propertySoldCounts[propertyIndex],
            amountSold: amounts[amountIndex],
            dateJoined: dates[dateIndex],
            status: statuses[statusIndex],
            firstName,
            lastName,
            phone: `0${800 + (i % 200)}${String(i).padStart(7, "0")}`,
            gender,
            kycStatus,
            kycDocument: "NIN",
            salesStatistics: generateSalesStatistics(i + 5),
        };
    }),
];

