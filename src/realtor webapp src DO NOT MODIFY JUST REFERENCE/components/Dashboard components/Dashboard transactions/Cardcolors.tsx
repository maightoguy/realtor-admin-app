const DARK_TEXT_COLOR = "#101828"; // Dark text color for light backgrounds
const LIGHT_TEXT_COLOR = "#FFFFFF"; // Light text color for dark backgrounds

export const CardColors = {
  // Primary/Purple Theme (Available Balance - Dark Background)
  Purple: {
    bg: "bg-[#6500AC]",
    iconBg: "#CFB0E5",
    iconStroke: "#F0E6F7",
    iconFg: "#6500AC",
    buttonText: "#6500AC",
    valueTextColor: LIGHT_TEXT_COLOR, // Text is white on a purple background
  },
  // Green Theme (Total Earnings - Light Background)
  Green: {
    bg: "bg-white",
    iconBg: "#D1FADF",
    iconStroke: "#E6F9F0",
    iconFg: "#039855",
    valueTextColor: DARK_TEXT_COLOR, // Text is dark on a white background
  },
  // Blue Theme (Total Withdrawals - Light Background)
  Blue: {
    bg: "bg-white",
    iconBg: "#C6E7FF",
    iconStroke: "#E5F5FF",
    iconFg: "#2E90FA",
    valueTextColor: DARK_TEXT_COLOR, // Text is dark on a white background
  },
  // Yellow Theme (Total Pending - Light Background)
  Yellow: {
    bg: "bg-white",
    iconBg: "#FEF0C7",
    iconStroke: "#FFFBEB",
    iconFg: "#F79009",
    valueTextColor: DARK_TEXT_COLOR, // Text is dark on a white background
  },

  // Gray Theme (Total Failed - Light Background)
  Gray: {
    bg: "bg-white",
    iconBg: "#E4E7EC", // Light slate background
    iconStroke: "#F2F4F7", // Very light stroke
    iconFg: "#475467", // Darker slate icon color
    valueTextColor: DARK_TEXT_COLOR, // Text is dark on a white background
  },
};
