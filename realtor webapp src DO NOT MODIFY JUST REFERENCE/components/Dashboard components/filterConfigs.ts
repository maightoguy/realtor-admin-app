import type { FilterConfig } from "./GenericFilterModal";
import { logger } from "../../utils/logger";

// Property Filter Configuration
export const propertyFilterConfig: FilterConfig = {
    title: "Filter",
    description: "Set the Preference for the type of Property you want to see",
    sections: [
        {
            title: "Property Type",
            type: "dropdown",
            collapsible: true,
            options: [
                { label: "Any", value: "any", type: "radio" },
                { label: "Land for Rent", value: "land-rent", type: "radio" },
                { label: "Land for Sale", value: "land-sale", type: "radio" },
                { label: "House for Rent", value: "house-rent", type: "radio" },
                { label: "House for Sale", value: "house-sale", type: "radio" },
                { label: "Apartment for Rent", value: "apartment-rent", type: "radio" },
                { label: "Apartment for Sale", value: "apartment-sale", type: "radio" },
                { label: "Industrial Land", value: "industrial-land", type: "radio" },
                { label: "Commercial Land", value: "commercial-land", type: "radio" },
                { label: "Residential Plot", value: "residential-plot", type: "radio" },
                { label: "Office Space", value: "office-space", type: "radio" },
                { label: "Warehouse", value: "warehouse", type: "radio" },
            ],
        },
        {
            title: "Location",
            type: "select",
            options: [
                { label: "Ikeja, Lagos", value: "Ikeja, Lagos", type: "radio" },
                { label: "Lekki, Lagos", value: "Lekki, Lagos", type: "radio" },
                { label: "Ikorodu, Lagos", value: "Ikorodu, Lagos", type: "radio" },
                { label: "Apapa, Lagos", value: "Apapa, Lagos", type: "radio" },
                { label: "Yaba, Lagos", value: "Yaba, Lagos", type: "radio" },
                { label: "Garki, FCT Abuja", value: "Garki, FCT Abuja", type: "radio" },
                { label: "Wuse, FCT Abuja", value: "Wuse, FCT Abuja", type: "radio" },
                { label: "Maitama, FCT Abuja", value: "Maitama, FCT Abuja", type: "radio" },
                { label: "Port Harcourt, Rivers", value: "Port Harcourt, Rivers", type: "radio" },
                { label: "Ibadan, Oyo", value: "Ibadan, Oyo", type: "radio" },
            ],
        },
        {
            title: "Price (₦)",
            type: "range",
            min: 100_000,
            max: 100_000_000,
            step: 100000,
            formatValue: (val: number) => `₦${Math.round(val).toLocaleString()}`,
        },
        {
            title: "Sort",
            type: "select",
            placeholder: "Select option",
            options: [
                { label: "Recommended", value: "recommended", type: "radio" },
                { label: "Price: Low to High", value: "price-asc", type: "radio" },
                { label: "Price: High to Low", value: "price-desc", type: "radio" },
                { label: "Title: A to Z", value: "title-asc", type: "radio" },
                { label: "Title: Z to A", value: "title-desc", type: "radio" },
            ],
        },
    ],
    onApply: (filters) => {
        logger.info("Property filters applied:", filters);
        // Handle property filter logic here
    },
    onReset: () => {
        logger.info("Property filters reset");
        // Handle property filter reset here
    },
};

// Receipt Filter Configuration
export const receiptFilterConfig: FilterConfig = {
    title: "Filter Receipts",
    description: "Set filters to find specific receipts",
    sections: [
        {
            title: "Status",
            type: "dropdown",
            collapsible: true,
            options: [
                { label: "All", value: "all", type: "radio" },
                { label: "Approved", value: "approved", type: "radio" },
                { label: "Pending", value: "pending", type: "radio" },
                { label: "Rejected", value: "rejected", type: "radio" },
                { label: "Under review", value: "under_review", type: "radio" },
            ],
        },
        {
            title: "Date Range",
            type: "range",
            min: 0, // Days ago
            max: 365, // Days ago
            step: 1,
            formatValue: (val: number) => {
                const date = new Date();
                date.setDate(date.getDate() - val);
                return date.toLocaleDateString();
            },
        },
        {
            title: "Amount Range (₦)",
            type: "range",
            min: 0,
            max: 1_000_000,
            step: 1000,
            formatValue: (val: number) => `₦${val.toLocaleString()}`,
        },
        {
            title: "Client Name",
            type: "text",
            placeholder: "Search by client name",
        },
    ],
    onApply: (filters) => {
        logger.info("Receipt filters applied:", filters);
        // Handle receipt filter logic here
    },
    onReset: () => {
        logger.info("Receipt filters reset");
        // Handle receipt filter reset here
    },
};

// Transaction Filter Configuration
export const transactionFilterConfig: FilterConfig = {
    title: "Filter Transactions",
    description: "Filter your transactions by various criteria",
    sections: [
        {
            title: "Transaction Type",
            type: "select",
            options: [
                { label: "All", value: "all", type: "radio" },
                { label: "Commission", value: "Commission", type: "radio" },
                { label: "Referral", value: "Referral", type: "radio" },
                { label: "Withdrawal", value: "Withdrawal", type: "radio" }
            ]
        },
        {
            title: "Status",
            type: "select",
            options: [
                { label: "All", value: "all", type: "radio" },
                { label: "Paid", value: "Paid", type: "radio" },
                { label: "Approved", value: "Approved", type: "radio" },
                { label: "Pending", value: "Pending", type: "radio" },
                { label: "Failed", value: "Failed", type: "radio" }
            ]
        },
        {
            title: "Amount Range",
            type: "range",
            min: 0,
            max: 1000000,
            step: 1000,
            formatValue: (value) => `₦${value.toLocaleString()}`
        }
    ],
    onApply: (filters) => {
        logger.info("Transaction filters applied:", filters);
        // Handle transaction filter logic here
    },
    onReset: () => {
        logger.info("Transaction filters reset");
        // Handle transaction filter reset here
    }
};

