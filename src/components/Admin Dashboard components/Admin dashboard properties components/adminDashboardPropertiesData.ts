// Import property images
import PropertyImage1 from "../../../assets/Properties img/Image 1.jpg";
import PropertyImage2 from "../../../assets/Properties img/Image 2.jpg";
import PropertyImage3 from "../../../assets/Properties img/Image 3.jpg";
import PropertyImage4 from "../../../assets/Properties img/Image 4.jpg";
import PropertyImage5 from "../../../assets/Properties img/Image 5.jpg";
import PropertyImage6 from "../../../assets/Properties img/Image 6.jpg";
import PropertyImage7 from "../../../assets/Properties img/Image 7.jpg";
import PropertyImage8 from "../../../assets/Properties img/Image 8.jpg";

const propertyImages = [
    PropertyImage1,
    PropertyImage2,
    PropertyImage3,
    PropertyImage4,
    PropertyImage5,
    PropertyImage6,
    PropertyImage7,
    PropertyImage8,
];

// Developer interface
export interface Developer {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalProperties: number;
    dateAdded: string;
    status: "Active" | "Removed";
}

// Properties metrics data
export const propertiesMetricsData = {
    totalProperties: "100,000",
    activeProperties: "100",
    soldOutProperties: "50",
};

// Sample property data (50 items in total)
export const sampleProperties = [
    // --- Original 8 Properties (Varied Data) ---
    {
        id: 1,
        image: propertyImages[0], // PropertyImage1
        title: "Modern 4-Bedroom Duplex with BQ",
        price: 250000000,
        location: "Lekki Phase 1, Lagos",
        isSoldOut: false,
    },
    {
        id: 2,
        image: propertyImages[1], // PropertyImage2
        title: "200sqm Residential Plot",
        price: 45000000,
        location: "Ajah, Lagos",
        isSoldOut: false,
    },
    {
        id: 3,
        image: propertyImages[2], // PropertyImage3
        title: "Commercial Office Space (3 Floors)",
        price: 750000000,
        location: "Victoria Island, Lagos",
        isSoldOut: true,
    },
    {
        id: 4,
        image: propertyImages[3], // PropertyImage4
        title: "1000sqm Land in Prime Area",
        price: 320000000,
        location: "Ikoyi, Lagos",
        isSoldOut: false,
    },
    {
        id: 5,
        image: propertyImages[4], // PropertyImage5
        title: "Newly Built Detached House",
        price: 185000000,
        location: "City of David, Lagos",
        isSoldOut: true,
    },
    {
        id: 6,
        image: propertyImages[5], // PropertyImage6
        title: "Serviced Mini-Estate Unit",
        price: 98000000,
        location: "Chevron Drive, Lagos",
        isSoldOut: false,
    },
    {
        id: 7,
        image: propertyImages[6], // PropertyImage7
        title: "Warehouse Facility (High Ceiling)",
        price: 450000000,
        location: "Apapa, Lagos",
        isSoldOut: false,
    },
    {
        id: 8,
        image: propertyImages[7], // PropertyImage8
        title: "Luxury 2-Bedroom Serviced Apartment",
        price: 85000000,
        location: "Banana Island, Lagos",
        isSoldOut: true,
    },
    // --- 42 New Properties Added (ID 9 to 50) ---
    {
        id: 9,
        image: propertyImages[0], // PropertyImage1
        title: "5-Bedroom Mansion with Pool",
        price: 800000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
    {
        id: 10,
        image: propertyImages[1], // PropertyImage2
        title: "Small Plot for Quick Sale",
        price: 15000000,
        location: "Ibeju-Lekki, Lagos",
        isSoldOut: false,
    },
    {
        id: 11,
        image: propertyImages[2], // PropertyImage3
        title: "Mixed-Use Development",
        price: 920000000,
        location: "Marina, Lagos",
        isSoldOut: true,
    },
    {
        id: 12,
        image: propertyImages[3], // PropertyImage4
        title: "Dry 600sqm Land",
        price: 140000000,
        location: "Opebi, Ikeja",
        isSoldOut: false,
    },
    {
        id: 13,
        image: propertyImages[4], // PropertyImage5
        title: "3-Bedroom Townhouse",
        price: 75000000,
        location: "Yaba, Lagos",
        isSoldOut: false,
    },
    {
        id: 14,
        image: propertyImages[5], // PropertyImage6
        title: "Affordable Bungalow",
        price: 35000000,
        location: "Ikorodu, Lagos",
        isSoldOut: true,
    },
    {
        id: 15,
        image: propertyImages[6], // PropertyImage7
        title: "Prime Retail Space",
        price: 550000000,
        location: "Surulere, Lagos",
        isSoldOut: false,
    },
    {
        id: 16,
        image: propertyImages[7], // PropertyImage8
        title: "Penthouse Apartment",
        price: 150000000,
        location: "Ikoyi, Lagos",
        isSoldOut: false,
    },
    {
        id: 17,
        image: propertyImages[0], // PropertyImage1
        title: "Massive Unfinished Structure",
        price: 400000000,
        location: "Lekki Phase 1, Lagos",
        isSoldOut: true,
    },
    {
        id: 18,
        image: propertyImages[1], // PropertyImage2
        title: "Residential Land near Beach",
        price: 55000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
    {
        id: 19,
        image: propertyImages[2], // PropertyImage3
        title: "Hotel Building for Sale",
        price: 1200000000,
        location: "Victoria Island, Lagos",
        isSoldOut: false,
    },
    {
        id: 20,
        image: propertyImages[3], // PropertyImage4
        title: "2 Plots Side-by-Side",
        price: 280000000,
        location: "City of David, Lagos",
        isSoldOut: true,
    },
    {
        id: 21,
        image: propertyImages[4], // PropertyImage5
        title: "Semi-Detached Duplex",
        price: 130000000,
        location: "Ajah, Lagos",
        isSoldOut: false,
    },
    {
        id: 22,
        image: propertyImages[5], // PropertyImage6
        title: "Gated Estate House",
        price: 110000000,
        location: "Omole Phase 2, Lagos",
        isSoldOut: true,
    },
    {
        id: 23,
        image: propertyImages[6], // PropertyImage7
        title: "Small Office Space",
        price: 65000000,
        location: "VI Extension, Lagos",
        isSoldOut: false,
    },
    {
        id: 24,
        image: propertyImages[7], // PropertyImage8
        title: "Studio Apartment",
        price: 25000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
    {
        id: 25,
        image: propertyImages[0], // PropertyImage1
        title: "Renovated Old Building",
        price: 160000000,
        location: "Surulere, Lagos",
        isSoldOut: false,
    },
    {
        id: 26,
        image: propertyImages[1], // PropertyImage2
        title: "Land with C of O",
        price: 90000000,
        location: "Osborne Foreshore, Lagos",
        isSoldOut: true,
    },
    {
        id: 27,
        image: propertyImages[2], // PropertyImage3
        title: "School Building",
        price: 380000000,
        location: "Ikeja GRA, Lagos",
        isSoldOut: false,
    },
    {
        id: 28,
        image: propertyImages[3], // PropertyImage4
        title: "Land facing Express",
        price: 520000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
    {
        id: 29,
        image: propertyImages[4], // PropertyImage5
        title: "Terrace House (4 units)",
        price: 220000000,
        location: "Lekki Phase 2, Lagos",
        isSoldOut: true,
    },
    {
        id: 30,
        image: propertyImages[5], // PropertyImage6
        title: "New Estate Development",
        price: 80000000,
        location: "Mowe/Ofada, Ogun State",
        isSoldOut: false,
    },
    {
        id: 31,
        image: propertyImages[6], // PropertyImage7
        title: "Event Center Facility",
        price: 600000000,
        location: "Magodo, Lagos",
        isSoldOut: true,
    },
    {
        id: 32,
        image: propertyImages[7], // PropertyImage8
        title: "Executive Loft Apartment",
        price: 95000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
    {
        id: 33,
        image: propertyImages[0], // PropertyImage1
        title: "Waterfront Property",
        price: 650000000,
        location: "Ikoyi, Lagos",
        isSoldOut: false,
    },
    {
        id: 34,
        image: propertyImages[1], // PropertyImage2
        title: "Fenced and Gated Land",
        price: 70000000,
        location: "City of David, Lagos",
        isSoldOut: true,
    },
    {
        id: 35,
        image: propertyImages[2], // PropertyImage3
        title: "Shopping Complex",
        price: 980000000,
        location: "Oshodi, Lagos",
        isSoldOut: false,
    },
    {
        id: 36,
        image: propertyImages[3], // PropertyImage4
        title: "Distressed Land Sale",
        price: 115000000,
        location: "Gbagada, Lagos",
        isSoldOut: false,
    },
    {
        id: 37,
        image: propertyImages[4], // PropertyImage5
        title: "Luxury 5-Bed Semi-Detached",
        price: 350000000,
        location: "City of David, Lagos",
        isSoldOut: true,
    },
    {
        id: 38,
        image: propertyImages[5], // PropertyImage6
        title: "Estate Plot with Infrastructure",
        price: 60000000,
        location: "Epe, Lagos",
        isSoldOut: false,
    },
    {
        id: 39,
        image: propertyImages[6], // PropertyImage7
        title: "Industrial Land",
        price: 700000000,
        location: "Badagry Expressway, Lagos",
        isSoldOut: false,
    },
    {
        id: 40,
        image: propertyImages[7], // PropertyImage8
        title: "High-Rise Apartment",
        price: 190000000,
        location: "Banana Island, Lagos",
        isSoldOut: true,
    },
    {
        id: 41,
        image: propertyImages[0], // PropertyImage1
        title: "Massive Development Project",
        price: 2000000000,
        location: "Ikoyi, Lagos",
        isSoldOut: false,
    },
    {
        id: 42,
        image: propertyImages[1], // PropertyImage2
        title: "Cheap Plot with Global C of O",
        price: 22000000,
        location: "City of David, Lagos",
        isSoldOut: true,
    },
    {
        id: 43,
        image: propertyImages[2], // PropertyImage3
        title: "Bank Repossessed Property",
        price: 480000000,
        location: "Apapa, Lagos",
        isSoldOut: false,
    },
    {
        id: 44,
        image: propertyImages[3], // PropertyImage4
        title: "Land in a Serene Neighborhood",
        price: 180000000,
        location: "Maryland, Lagos",
        isSoldOut: false,
    },
    {
        id: 45,
        image: propertyImages[4], // PropertyImage5
        title: "Compact 2-Bedroom Flat",
        price: 45000000,
        location: "City of David, Lagos",
        isSoldOut: true,
    },
    {
        id: 46,
        image: propertyImages[5], // PropertyImage6
        title: "Newly Launched Estate Plots",
        price: 50000000,
        location: "Awoyaya, Lagos",
        isSoldOut: false,
    },
    {
        id: 47,
        image: propertyImages[6], // PropertyImage7
        title: "Retail and Office Complex",
        price: 850000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
    {
        id: 48,
        image: propertyImages[7], // PropertyImage8
        title: "Furnished Luxury Apartment",
        price: 120000000,
        location: "Victoria Island, Lagos",
        isSoldOut: true,
    },
    {
        id: 49,
        image: propertyImages[0], // PropertyImage1
        title: "Commercial Duplex for Lease/Sale",
        price: 380000000,
        location: "Ikeja, Lagos",
        isSoldOut: false,
    },
    {
        id: 50,
        image: propertyImages[1], // PropertyImage2
        title: "Corner Piece Residential Land",
        price: 105000000,
        location: "City of David, Lagos",
        isSoldOut: false,
    },
];

// Sample developer data
export const sampleDevelopers: Developer[] = [
    {
        id: 1,
        name: "Iretiola Okunade",
        email: "auroraq@icloud.com",
        phone: "08178148026",
        totalProperties: 5,
        dateAdded: "2025-05-13",
        status: "Active",
    },
    {
        id: 2,
        name: "Izuokumo Aganaba",
        email: "yorubademon@zoho.com",
        phone: "09175040037",
        totalProperties: 16,
        dateAdded: "2025-05-13",
        status: "Removed",
    },
    {
        id: 3,
        name: "Seyi Olabode",
        email: "ebonyisalt@yahoo.com",
        phone: "08187848583",
        totalProperties: 1,
        dateAdded: "2025-05-13",
        status: "Active",
    },
    {
        id: 4,
        name: "Kuroebi Timipre",
        email: "jamesw@hotmail.com",
        phone: "07000589109",
        totalProperties: 10,
        dateAdded: "2025-05-13",
        status: "Removed",
    },
    {
        id: 5,
        name: "Tonbara Ziworitin",
        email: "oyoamala@gmail.com",
        phone: "08131345069",
        totalProperties: 25,
        dateAdded: "2025-05-13",
        status: "Active",
    },
    // --- 45 New Developer Entries Added (ID 6 to 50) ---
    {
        id: 6,
        name: "Aisha Mohammed",
        email: "aisha.m@zmail.com",
        phone: "09054321098",
        totalProperties: 12,
        dateAdded: "2025-05-14",
        status: "Active",
    },
    {
        id: 7,
        name: "Chinedu Okafor",
        email: "chineduo@mycorp.com",
        phone: "08011223344",
        totalProperties: 30,
        dateAdded: "2025-05-14",
        status: "Active",
    },
    {
        id: 8,
        name: "Temitope Adebayo",
        email: "topetope@webmail.com",
        phone: "07022446688",
        totalProperties: 8,
        dateAdded: "2025-05-15",
        status: "Active",
    },
    {
        id: 9,
        name: "Fidelis Udo",
        email: "fidelisu@mailhost.net",
        phone: "08145678901",
        totalProperties: 45,
        dateAdded: "2025-05-15",
        status: "Removed",
    },
    {
        id: 10,
        name: "Zainab Tanimu",
        email: "z.tanimu@live.com",
        phone: "09187654321",
        totalProperties: 2,
        dateAdded: "2025-05-16",
        status: "Active",
    },
    {
        id: 11,
        name: "Obinna Nwachukwu",
        email: "obinna.n@workmail.org",
        phone: "08033557799",
        totalProperties: 18,
        dateAdded: "2025-05-16",
        status: "Active",
    },
    {
        id: 12,
        name: "Funmilayo Alabi",
        email: "funmilayo.a@devs.com",
        phone: "07088990011",
        totalProperties: 7,
        dateAdded: "2025-05-17",
        status: "Active",
    },
    {
        id: 13,
        name: "Sadiq Hassan",
        email: "sadiqh@inbox.co",
        phone: "08155667788",
        totalProperties: 60,
        dateAdded: "2025-05-17",
        status: "Active",
    },
    {
        id: 14,
        name: "Gloria Etim",
        email: "gloria.e@cloud.net",
        phone: "09099887766",
        totalProperties: 3,
        dateAdded: "2025-05-18",
        status: "Removed",
    },
    {
        id: 15,
        name: "David Igwe",
        email: "david.i@techmail.biz",
        phone: "08044770033",
        totalProperties: 22,
        dateAdded: "2025-05-18",
        status: "Active",
    },
    {
        id: 16,
        name: "Halima Bello",
        email: "halimab@corp.com",
        phone: "07077665544",
        totalProperties: 14,
        dateAdded: "2025-05-19",
        status: "Active",
    },
    {
        id: 17,
        name: "Victor Olayinka",
        email: "victor.o@fastmail.io",
        phone: "08199001122",
        totalProperties: 9,
        dateAdded: "2025-05-19",
        status: "Active",
    },
    {
        id: 18,
        name: "Ngozi Ezenwa",
        email: "ngozi.e@company.ng",
        phone: "09111223344",
        totalProperties: 35,
        dateAdded: "2025-05-20",
        status: "Active",
    },
    {
        id: 19,
        name: "Tariq Abubakar",
        email: "tariq.a@proton.me",
        phone: "08066554433",
        totalProperties: 6,
        dateAdded: "2025-05-20",
        status: "Removed",
    },
    {
        id: 20,
        name: "Kunle Adewale",
        email: "kunle.a@yahoo.co.uk",
        phone: "07033221100",
        totalProperties: 50,
        dateAdded: "2025-05-21",
        status: "Active",
    },
    {
        id: 21,
        name: "Imoh Peters",
        email: "imohpeters@zohomail.com",
        phone: "08121213131",
        totalProperties: 11,
        dateAdded: "2025-05-21",
        status: "Active",
    },
    {
        id: 22,
        name: "Blessing Eze",
        email: "blessing.e@outlook.com",
        phone: "09067678989",
        totalProperties: 17,
        dateAdded: "2025-05-22",
        status: "Active",
    },
    {
        id: 23,
        name: "Emeka Nwankwo",
        email: "emekan@inbox.com",
        phone: "07010102020",
        totalProperties: 4,
        dateAdded: "2025-05-22",
        status: "Active",
    },
    {
        id: 24,
        name: "Hadiza Musa",
        email: "hadiza.m@devmail.org",
        phone: "08080809090",
        totalProperties: 28,
        dateAdded: "2025-05-23",
        status: "Removed",
    },
    {
        id: 25,
        name: "Jide Balogun",
        email: "jide.b@mailhoster.net",
        phone: "09151516161",
        totalProperties: 19,
        dateAdded: "2025-05-23",
        status: "Active",
    },
    {
        id: 26,
        name: "Kemi Dada",
        email: "kemidada@workco.com",
        phone: "08162627272",
        totalProperties: 13,
        dateAdded: "2025-05-24",
        status: "Active",
    },
    {
        id: 27,
        name: "Ladi Yakubu",
        email: "ladi.y@mailprovider.io",
        phone: "07043435454",
        totalProperties: 55,
        dateAdded: "2025-05-24",
        status: "Active",
    },
    {
        id: 28,
        name: "Musa Audu",
        email: "musaa@techfirm.biz",
        phone: "08097978787",
        totalProperties: 21,
        dateAdded: "2025-05-25",
        status: "Removed",
    },
    {
        id: 29,
        name: "Nnenna Okoro",
        email: "nnenna.o@mycompany.ng",
        phone: "09028283838",
        totalProperties: 15,
        dateAdded: "2025-05-25",
        status: "Active",
    },
    {
        id: 30,
        name: "Peter Nwosu",
        email: "petern@inboxmail.com",
        phone: "08119190909",
        totalProperties: 40,
        dateAdded: "2025-05-26",
        status: "Active",
    },
    {
        id: 31,
        name: "Rukayat Sani",
        email: "rukayat.s@livemail.com",
        phone: "07050506060",
        totalProperties: 20,
        dateAdded: "2025-05-26",
        status: "Active",
    },
    {
        id: 32,
        name: "Tunde Williams",
        email: "tunde.w@cloudcorp.net",
        phone: "08071712727",
        totalProperties: 5,
        dateAdded: "2025-05-27",
        status: "Active",
    },
    {
        id: 33,
        name: "Uchechukwu Bello",
        email: "uche.b@myemail.org",
        phone: "09134345454",
        totalProperties: 33,
        dateAdded: "2025-05-27",
        status: "Removed",
    },
    {
        id: 34,
        name: "Vera Ibeh",
        email: "vera.i@webhost.biz",
        phone: "08185856868",
        totalProperties: 2,
        dateAdded: "2025-05-28",
        status: "Active",
    },
    {
        id: 35,
        name: "Wale Adekunle",
        email: "wale.a@mailservice.io",
        phone: "07069697979",
        totalProperties: 27,
        dateAdded: "2025-05-28",
        status: "Active",
    },
    {
        id: 36,
        name: "Yusuf Kazeem",
        email: "yusuf.k@corpmail.com",
        phone: "08053534545",
        totalProperties: 1,
        dateAdded: "2025-05-29",
        status: "Active",
    },
    {
        id: 37,
        name: "Zoe Nwoke",
        email: "zoe.n@tech.ng",
        phone: "09041415151",
        totalProperties: 70,
        dateAdded: "2025-05-29",
        status: "Active",
    },
    {
        id: 38,
        name: "Adeola Alao",
        email: "adeola.a@freemail.com",
        phone: "08107078080",
        totalProperties: 10,
        dateAdded: "2025-05-30",
        status: "Removed",
    },
    {
        id: 39,
        name: "Bamidele Sadiq",
        email: "bamidele.s@zmail.net",
        phone: "07086867676",
        totalProperties: 3,
        dateAdded: "2025-05-30",
        status: "Active",
    },
    {
        id: 40,
        name: "Chioma Ike",
        email: "chioma.i@hostmail.biz",
        phone: "08025256565",
        totalProperties: 16,
        dateAdded: "2025-05-31",
        status: "Active",
    },
    {
        id: 41,
        name: "Daniel Audu",
        email: "daniel.a@mywork.org",
        phone: "09163634646",
        totalProperties: 29,
        dateAdded: "2025-05-31",
        status: "Active",
    },
    {
        id: 42,
        name: "Efe James",
        email: "efe.j@mailco.io",
        phone: "08174745757",
        totalProperties: 8,
        dateAdded: "2025-06-01",
        status: "Removed",
    },
    {
        id: 43,
        name: "Gbenga Falade",
        email: "gbenga.f@cloudhost.com",
        phone: "07095956969",
        totalProperties: 48,
        dateAdded: "2025-06-01",
        status: "Active",
    },
    {
        id: 44,
        name: "Ijeoma Okeke",
        email: "ijeoma.o@mail.net",
        phone: "08002023030",
        totalProperties: 14,
        dateAdded: "2025-06-02",
        status: "Active",
    },
    {
        id: 45,
        name: "Kabir Liman",
        email: "kabir.l@corp.ng",
        phone: "09014145151",
        totalProperties: 12,
        dateAdded: "2025-06-02",
        status: "Active",
    },
    {
        id: 46,
        name: "Lola Agbaje",
        email: "lola.a@mytechmail.com",
        phone: "08146467676",
        totalProperties: 37,
        dateAdded: "2025-06-03",
        status: "Active",
    },
    {
        id: 47,
        name: "Matthew Osagie",
        email: "matt.o@webmail.org",
        phone: "07079798989",
        totalProperties: 9,
        dateAdded: "2025-06-03",
        status: "Removed",
    },
    {
        id: 48,
        name: "Nneka Obi",
        email: "nneka.o@mailhost.biz",
        phone: "08031312121",
        totalProperties: 25,
        dateAdded: "2025-06-04",
        status: "Active",
    },
    {
        id: 49,
        name: "Oluwole Davies",
        email: "oluwole.d@private.io",
        phone: "09122223333",
        totalProperties: 4,
        dateAdded: "2025-06-04",
        status: "Active",
    },
    {
        id: 50,
        name: "Pelumi Coker",
        email: "pelumi.c@inbox.net",
        phone: "08155556666",
        totalProperties: 19,
        dateAdded: "2025-06-05",
        status: "Active",
    },
];