import { ArrowLeft } from "lucide-react";
import type { Developer } from "../../../services/types";
import type { SalesStatistics } from "./adminDashboardPropertiesData";

interface DeveloperDetailsSectionProps {
  developer: Developer & { salesStatistics?: SalesStatistics };
  onBack: () => void;
  onEdit?: (developerId: string) => void;
  onRemove?: (developerId: string) => void;
}

const DeveloperDetailsSection = ({
  developer,
  onBack,
  onEdit,
  onRemove,
}: DeveloperDetailsSectionProps) => {
  const months = [
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

  const currentMonthIndex = new Date().getMonth();

  // Get sales statistics data
  const salesStats: SalesStatistics = developer.salesStatistics || {
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
  };

  // Convert sales statistics to array for chart
  const chartData = [
    salesStats.jan,
    salesStats.feb,
    salesStats.mar,
    salesStats.apr,
    salesStats.may,
    salesStats.jun,
    salesStats.jul,
    salesStats.aug,
    salesStats.sep,
    salesStats.oct,
    salesStats.nov,
    salesStats.dec,
  ];

  const maxValue = Math.max(...chartData, 1);

  // Calculate Y-axis labels based on max value
  const getYAxisLabels = () => {
    if (maxValue === 0) return ["₦0", "₦0", "₦0", "₦0"];

    // Round max value to nearest million or appropriate scale
    let scale = 1000000; // Start with millions
    let roundedMax = Math.ceil(maxValue / scale) * scale;

    // If max is less than 1M, use thousands
    if (maxValue < 1000000) {
      scale = 1000;
      roundedMax = Math.ceil(maxValue / scale) * scale;
      return [
        `₦${(roundedMax / 1000).toFixed(0)}K`,
        `₦${((roundedMax * 0.75) / 1000).toFixed(0)}K`,
        `₦${((roundedMax * 0.5) / 1000).toFixed(0)}K`,
        `₦${((roundedMax * 0.25) / 1000).toFixed(0)}K`,
        "₦0",
      ];
    }

    // Use millions
    const maxM = roundedMax / 1000000;
    return [
      `₦${maxM.toFixed(0)}M`,
      `₦${(maxM * 0.75).toFixed(0)}M`,
      `₦${(maxM * 0.5).toFixed(0)}M`,
      `₦${(maxM * 0.25).toFixed(0)}M`,
      "₦0",
    ];
  };

  const yAxisLabels = getYAxisLabels();
  // Calculate chart max value based on the scale used
  const chartMaxValue =
    maxValue === 0
      ? 1
      : maxValue < 1000000
      ? Math.ceil(maxValue / 1000) * 1000
      : Math.ceil(maxValue / 1000000) * 1000000;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mb-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#F0F1F2] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          Properties/Developer Details
        </h2>
      </div>

      {/* Developer Info and Sales Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Developer Info Card */}
        <div className="flex flex-col bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 gap-6">
          <div className="flex flex-row justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Developer info
            </h3>

            {/* Status */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`w-2 h-2 rounded-full ${
                  developer.status === "Active"
                    ? "bg-[#22C55E]"
                    : "bg-[#EF4444]"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {developer.status}
              </span>
            </div>
          </div>

          {/* Developer Name and Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#F0E6F7] flex items-center justify-center text-[#857c7c] ring-2 ring-gray-200 ring-offset-2 ring-offset-white">
              {getInitials(developer.name)}
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {developer.name}
            </p>
          </div>

          {/* Contact Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Contact
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900">{developer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm text-gray-900">{developer.phone}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onEdit?.(developer.id)}
              className="flex-1 px-4 py-2 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit details
            </button>
            <button
              onClick={() => onRemove?.(developer.id)}
              className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors"
            >
              Remove developer
            </button>
          </div>
        </div>

        {/* Sales Statistics Card */}
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Sales Statistics
          </h3>

          {/* Chart */}
          <div className="relative h-64">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500 pr-3 w-12">
              {yAxisLabels.map((label, index) => (
                <span key={`y-label-${index}`}>{label}</span>
              ))}
            </div>

            {/* Chart container with grid lines */}
            <div className="ml-12 pr-4 relative h-full">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-12">
                <div className="w-full h-px bg-gray-200"></div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              {/* Bars and labels container */}
              <div className="relative">
                {/* Bars container */}
                <div className="relative h-48 flex items-end justify-between gap-1.5 mb-2">
                  {chartData.map((value, index) => {
                    const height = (value / chartMaxValue) * 100;
                    const isCurrentMonth = index === currentMonthIndex;
                    return (
                      <div
                        key={`bar-${index}`}
                        className="flex-1 flex flex-col items-center h-full justify-end relative"
                      >
                        {/* Highlight background for current month */}
                        {isCurrentMonth && (
                          <div className="absolute -inset-x-1 -top-2 -bottom-8 bg-gray-100 rounded-lg"></div>
                        )}
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all relative z-10 ${
                            isCurrentMonth ? "bg-green-500" : "bg-[#6500AC]"
                          }`}
                          style={{
                            height: `${height}%`,
                            minHeight: height > 0 ? "4px" : "0",
                          }}
                        />
                        {/* Vertical line from bar to month label */}
                        <div
                          className="absolute w-px bg-gray-200 z-0"
                          style={{
                            bottom: "-20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            height: "20px",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Month labels */}
                <div className="flex justify-between gap-1.5 mt-2">
                  {months.map((month, index) => (
                    <div
                      key={`label-${index}`}
                      className="flex-1 text-center text-xs text-gray-500"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetailsSection;
