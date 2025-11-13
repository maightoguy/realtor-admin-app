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
