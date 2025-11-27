import { useState } from "react";
import { ChevronRight } from "lucide-react";
import AdminPagination from "../../AdminPagination.tsx";
import RealtorsIcon from "../../icons/RealtorsIcon.tsx";
import IslandIcon from "../../icons/IslandIcon.tsx";
import ReceiptsIcon from "../../icons/ReceiptsIcon.tsx";
import TransactionsIcon from "../../icons/TransactionsIcon.tsx";
import {
  metricsData,
  topRealtorsData,
  commissionData,
  realtorsData,
  recentReceiptsData,
  months,
  ProfilePic1,
} from "./adminDashboardOverviewData";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconStrokeColor: string;
  iconFgColor: string;
  valueTextColor: string;
  isEmpty?: boolean;
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconStrokeColor,
  valueTextColor,
  isEmpty,
}: MetricCardProps) => (
  <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-5 flex flex-col gap-4 w-full transition duration-300 hover:shadow-lg">
    {/* Top Row - Icon and Title */}
    <div className="flex items-center gap-3">
      {/* SVG Icon Wrapper */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="30" height="30" rx="15" fill={iconBgColor} />
        <rect
          x="3"
          y="3"
          width="30"
          height="30"
          rx="15"
          stroke={iconStrokeColor}
          strokeWidth="4.5"
        />
        <foreignObject x="3" y="3" width="30" height="30" rx="15">
          <div className="w-full h-full flex items-center justify-center">
            {icon}
          </div>
        </foreignObject>
      </svg>

      <p
        className="text-sm font-medium truncate"
        style={{ color: valueTextColor }}
      >
        {title}
      </p>
    </div>

    {/* Value Row */}
    <div
      className="flex flex-col gap-3 min-w-0"
      style={{ color: valueTextColor }}
    >
      <p
        className="text-[24px] leading-9 font-medium break-words max-w-full"
        style={{ color: valueTextColor }}
      >
        {isEmpty ? "-" : value}
      </p>
    </div>
  </div>
);

interface TopRealtorItemProps {
  name: string;
  value: string;
  avatar: string;
  isEmpty?: boolean;
}

const TopRealtorItem = ({
  name,
  value,
  avatar,
  isEmpty,
}: TopRealtorItemProps) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <span className="text-sm font-medium text-gray-700">
        {isEmpty ? "---" : name}
      </span>
    </div>
    <span className="text-sm font-semibold text-gray-900">
      {isEmpty ? "₦0" : value.startsWith("₦") ? value : `₦${value}`}
    </span>
  </div>
);

interface ReceiptRowProps {
  receiptId: string;
  property: string;
  realtorName: string;
  realtorAvatar: string;
  clientName: string;
  dateUploaded: string;
  status: "Pending" | "Approved" | "Rejected";
}

const ReceiptRow = ({
  receiptId,
  property,
  realtorName,
  realtorAvatar,
  clientName,
  dateUploaded,
  status,
}: ReceiptRowProps) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 text-sm font-medium text-gray-900">{receiptId}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{property}</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <img
            src={realtorAvatar}
            alt={realtorName}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm text-gray-700">{realtorName}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-sm text-gray-700">{clientName}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{dateUploaded}</td>
    <td className="px-4 py-3">
      <span className="flex items-center gap-1 text-sm text-gray-600">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        {status}
      </span>
    </td>
    <td className="px-4 py-3">
      <button className="text-sm text-[#6500AC] font-medium hover:underline">
        View details
      </button>
    </td>
  </tr>
);

const AdminDashboardOverview = () => {
  const [chartView, setChartView] = useState<"Commission" | "Realtors">(
    "Commission"
  );
  //const [currentPage, setCurrentPage] = useState(1);
  const [showAllReceipts, setShowAllReceipts] = useState(false);

  // Empty state - no data available
  // TODO: This will be replaced with API call
  const hasData = true;

  const chartData = chartView === "Commission" ? commissionData : realtorsData;
  const maxValue = Math.max(...chartData, 1);

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Total Realtors"
          value={hasData ? metricsData.totalRealtors : "-"}
          icon={<RealtorsIcon color="#6500AC" className="w-5 h-5" />}
          iconBgColor="#F0E6F7"
          iconStrokeColor="#F0E6F7"
          iconFgColor="#6500AC"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Total Properties"
          value={hasData ? metricsData.totalProperties : "-"}
          icon={<IslandIcon color="#22C55E" className="w-5 h-5" />}
          iconBgColor="#E9F9EF"
          iconStrokeColor="#E9F9EF"
          iconFgColor="#22C55E"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Pending Receipts"
          value={hasData ? metricsData.pendingReceipts : "-"}
          icon={<ReceiptsIcon color="#EF4444" className="w-5 h-5" />}
          iconBgColor="#FAC5C5"
          iconStrokeColor="#FAC5C5"
          iconFgColor="#EF4444"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Commission paid"
          value={hasData ? metricsData.commissionPaid : "-"}
          icon={<TransactionsIcon color="#6B7280" className="w-5 h-5" />}
          iconBgColor="#F0F1F2"
          iconStrokeColor="#F0E6F7"
          iconFgColor="#6B7280"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Total sale"
          value={hasData ? metricsData.totalSale : "-"}
          icon={<TransactionsIcon color="#DD900D" className="w-5 h-5" />}
          iconBgColor="#F4DDB4"
          iconStrokeColor="#F4DDB4"
          iconFgColor="#DD900D"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
      </div>

      {/* Charts and Top Realtors Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-6">
        {/* Commission Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Commission Statistics
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView("Commission")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartView === "Commission"
                    ? "bg-[#6500AC] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Commission
              </button>
              <button
                onClick={() => setChartView("Realtors")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartView === "Realtors"
                    ? "bg-[#6500AC] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Realtors
              </button>
            </div>
          </div>

          {hasData ? (
            <div className="relative h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500 pr-3 w-12">
                <span>₦10M</span>
                <span>₦5M</span>
                <span>₦1M</span>
                <span>₦0</span>
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
                      const height = (value / maxValue) * 100;
                      const isCurrentMonth = months[index] === "Aug";
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
                              height: "20px",
                              left: "50%",
                              transform: "translateX(-50%)",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Month labels */}
                  <div className="flex items-center justify-between gap-1.5 mt-2">
                    {months.map((month, index) => {
                      const isCurrentMonth = month === "Aug";
                      return (
                        <div
                          key={`label-${index}`}
                          className="flex-1 flex justify-center relative"
                        >
                          {/* Extend highlight to label area for current month */}
                          {isCurrentMonth && (
                            <div className="absolute -top-8 -bottom-0 -left-1 -right-1 bg-gray-100 rounded-b-lg"></div>
                          )}
                          <span
                            className={`text-xs relative z-10 ${
                              isCurrentMonth
                                ? "text-gray-900 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-sm">No commission data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Realtors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Realtors
          </h3>
          {hasData ? (
            <div>
              {topRealtorsData.map((realtor, index) => (
                <TopRealtorItem
                  key={index}
                  name={realtor.name}
                  value={realtor.value}
                  avatar={realtor.avatar}
                  isEmpty={false}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <TopRealtorItem
                  key={i}
                  name="---"
                  value="₦0"
                  avatar={ProfilePic1}
                  isEmpty={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Receipts Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Receipt
          </h3>
          <button
            onClick={() => setShowAllReceipts(!showAllReceipts)}
            className="text-sm text-[#6500AC] font-medium hover:underline flex items-center gap-1"
          >
            {showAllReceipts ? "Show less" : "View all"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {hasData ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Receipt ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Realtor name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Uploaded
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllReceipts
                    ? recentReceiptsData
                    : recentReceiptsData.slice(0, 2)
                  ).map((receipt, index) => (
                    <ReceiptRow key={index} {...receipt} />
                  ))}
                </tbody>
              </table>
            </div>
            {showAllReceipts && (
              <div className="p-4 border-t border-gray-200">
                <AdminPagination
                  totalItems={100}
                  itemsPerPage={10}
                  //onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              No recent receipts available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
