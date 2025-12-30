import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import AdminPagination from "../../AdminPagination.tsx";
import RealtorsIcon from "../../icons/RealtorsIcon.tsx";
import IslandIcon from "../../icons/IslandIcon.tsx";
import ReceiptsIcon from "../../icons/ReceiptsIcon.tsx";
import TransactionsIcon from "../../icons/TransactionsIcon.tsx";
import { months } from "./adminDashboardOverviewData";
import DefaultProfilePic from "../../../assets/Default Profile pic.png";
import { overviewService, receiptService } from "../../../services/apiService";
import Loader from "../../Loader";
import AdminReceiptsDetailsModal from "../Admin dashboard receipts components/AdminReceiptsDetailsModal";
import type { ReceiptStatus } from "../../../services/types";

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
        className="text-[24px] leading-9 font-medium wrap-break-word max-w-full"
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
  id: string;
  receiptId: string;
  property: string;
  realtorName: string;
  realtorAvatar: string;
  clientName: string;
  dateUploaded: string;
  status: "Pending" | "Approved" | "Rejected";
  onViewDetails?: (receiptId: string) => void;
}

const ReceiptRow = ({
  id,
  receiptId,
  property,
  realtorName,
  realtorAvatar,
  clientName,
  dateUploaded,
  status,
  onViewDetails,
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
      <button
        type="button"
        onClick={() => onViewDetails?.(id)}
        className="text-sm text-[#6500AC] font-medium hover:underline"
      >
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
  const [snapshot, setSnapshot] = useState<Awaited<
    ReturnType<typeof overviewService.getOverviewSnapshot>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    id: string;
    realtorName: string;
    clientName: string;
    propertyName: string;
    amountPaid: number;
    receiptUrls: string[];
    status: ReceiptStatus;
    createdAt: string;
    rejectionReason: string | null;
  } | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    overviewService
      .getOverviewSnapshot()
      .then((data) => {
        if (cancelled) return;
        setSnapshot(data);
      })
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : "Failed to load overview.";
        if (!cancelled) setLoadError(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasData = !isLoading && !loadError && snapshot !== null;

  const formatNaira = (amount: number) =>
    `₦${Math.round(amount).toLocaleString()}`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    const day = d.getDate();
    const suffix =
      day % 10 === 1 && day % 100 !== 11
        ? "st"
        : day % 10 === 2 && day % 100 !== 12
        ? "nd"
        : day % 10 === 3 && day % 100 !== 13
        ? "rd"
        : "th";
    const monthName = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear();
    return `${monthName} ${day}${suffix}, ${year}`;
  };

  const chartData = useMemo(() => {
    if (!snapshot) return [];
    return chartView === "Commission"
      ? snapshot.monthlyCommission
      : snapshot.monthlyNewRealtors;
  }, [chartView, snapshot]);

  const chartDataFixed = useMemo(() => {
    if (chartData.length === 12) return chartData;
    const fixed = Array.from({ length: 12 }, (_, i) =>
      Number.isFinite(chartData[i]) ? Number(chartData[i]) : 0
    );
    return fixed;
  }, [chartData]);

  const currentMonthIndex = new Date().getUTCMonth();

  const { yAxisLabels, chartMaxValue } = useMemo(() => {
    const rawMax = Math.max(...chartDataFixed, 0);

    if (chartView === "Commission") {
      const scale =
        rawMax >= 1_000_000 ? 1_000_000 : rawMax >= 1_000 ? 1_000 : 1;
      const roundedMax = rawMax <= 0 ? 1 : Math.ceil(rawMax / scale) * scale;
      const format = (value: number) => {
        if (scale === 1_000_000) return `₦${Math.round(value / 1_000_000)}M`;
        if (scale === 1_000) return `₦${Math.round(value / 1_000)}K`;
        return `₦${Math.round(value).toLocaleString()}`;
      };
      const labels = [
        format(roundedMax),
        format(roundedMax * 0.5),
        format(roundedMax * 0.25),
        "₦0",
      ];
      return { yAxisLabels: labels, chartMaxValue: roundedMax };
    }

    const step =
      rawMax >= 1_000 ? 1_000 : rawMax >= 100 ? 100 : rawMax >= 10 ? 10 : 1;
    const roundedMax = rawMax <= 0 ? 1 : Math.ceil(rawMax / step) * step;
    const format = (value: number) => {
      if (roundedMax >= 1_000) return `${Math.round(value / 1_000)}K`;
      return `${Math.round(value)}`;
    };
    const labels = [
      format(roundedMax),
      format(roundedMax * 0.5),
      format(roundedMax * 0.25),
      "0",
    ];
    return { yAxisLabels: labels, chartMaxValue: roundedMax };
  }, [chartDataFixed, chartView]);

  const metrics = useMemo(() => {
    if (!snapshot) {
      return {
        totalRealtors: 0,
        totalProperties: 0,
        pendingReceipts: 0,
        commissionPaid: "₦0",
        totalSale: "₦0",
      };
    }
    return {
      totalRealtors: snapshot.totalRealtors,
      totalProperties: snapshot.totalProperties,
      pendingReceipts: snapshot.pendingReceipts,
      commissionPaid: formatNaira(snapshot.commissionPaid),
      totalSale: formatNaira(snapshot.totalSale),
    };
  }, [snapshot]);

  const topRealtors = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.topRealtors.map((row) => ({
      name: `${row.user.first_name} ${row.user.last_name}`.trim() || "---",
      value: formatNaira(row.total),
      avatar: row.user.avatar_url || DefaultProfilePic,
    }));
  }, [snapshot]);

  const recentReceipts = useMemo(() => {
    if (!snapshot) return [];
    const mapStatus = (status: string): "Pending" | "Approved" | "Rejected" => {
      const normalized = status.toLowerCase();
      if (normalized === "approved") return "Approved";
      if (normalized === "rejected") return "Rejected";
      return "Pending";
    };

    return snapshot.recentReceipts.map(({ receipt, realtor, property }) => ({
      id: receipt.id,
      receiptId: `#${receipt.id.slice(0, 6)}`,
      property: property?.title ?? "-",
      realtorName: realtor
        ? `${realtor.first_name} ${realtor.last_name}`.trim() || "---"
        : "---",
      realtorAvatar: realtor?.avatar_url || DefaultProfilePic,
      clientName: receipt.client_name ?? "-",
      dateUploaded: formatDate(receipt.created_at),
      status: mapStatus(receipt.status),
    }));
  }, [snapshot]);

  const handleViewReceiptDetails = (receiptId: string) => {
    if (!snapshot) return;
    const row = snapshot.recentReceipts.find((r) => r.receipt.id === receiptId) ?? null;
    if (!row) return;

    const amountPaid = Number(row.receipt.amount_paid);
    setSelectedReceipt({
      id: row.receipt.id,
      realtorName: row.realtor
        ? `${row.realtor.first_name} ${row.realtor.last_name}`.trim() || "-"
        : "-",
      clientName: row.receipt.client_name ?? "-",
      propertyName: row.property?.title ?? "-",
      amountPaid: Number.isFinite(amountPaid) ? amountPaid : 0,
      receiptUrls: Array.isArray(row.receipt.receipt_urls) ? row.receipt.receipt_urls : [],
      status: row.receipt.status,
      createdAt: row.receipt.created_at,
      rejectionReason: row.receipt.rejection_reason ?? null,
    });
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleReceiptStatusUpdate = async (
    receiptId: string,
    newStatus: ReceiptStatus,
    rejectionReason?: string
  ) => {
    await receiptService.updateStatus({
      id: receiptId,
      status: newStatus,
      rejectionReason: rejectionReason ?? null,
    });
    const refreshed = await overviewService.getOverviewSnapshot();
    setSnapshot(refreshed);
  };

  return (
    <div className="p-6 bg-[#FCFCFC]">
      <Loader isOpen={isLoading} text="Loading overview..." />
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Total Realtors"
          value={hasData ? metrics.totalRealtors : "-"}
          icon={<RealtorsIcon color="#6500AC" className="w-5 h-5" />}
          iconBgColor="#F0E6F7"
          iconStrokeColor="#F0E6F7"
          iconFgColor="#6500AC"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Total Properties"
          value={hasData ? metrics.totalProperties : "-"}
          icon={<IslandIcon color="#22C55E" className="w-5 h-5" />}
          iconBgColor="#E9F9EF"
          iconStrokeColor="#E9F9EF"
          iconFgColor="#22C55E"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Pending Receipts"
          value={hasData ? metrics.pendingReceipts : "-"}
          icon={<ReceiptsIcon color="#EF4444" className="w-5 h-5" />}
          iconBgColor="#FAC5C5"
          iconStrokeColor="#FAC5C5"
          iconFgColor="#EF4444"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Commission paid"
          value={hasData ? metrics.commissionPaid : "-"}
          icon={<TransactionsIcon color="#6B7280" className="w-5 h-5" />}
          iconBgColor="#F0F1F2"
          iconStrokeColor="#F0E6F7"
          iconFgColor="#6B7280"
          valueTextColor="#101828"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Total sale"
          value={hasData ? metrics.totalSale : "-"}
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
                {yAxisLabels.map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>

              {/* Chart container with grid lines */}
              <div className="ml-12 pr-4 relative h-full">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-12">
                  {yAxisLabels.map((label, index) => (
                    <div
                      key={`${label}-${index}`}
                      className="w-full h-px bg-gray-200"
                    ></div>
                  ))}
                </div>

                {/* Bars and labels container */}
                <div className="relative">
                  {/* Bars container */}
                  <div className="relative h-48 flex items-end justify-between gap-1.5 mb-2">
                    {chartDataFixed.map((value, index) => {
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
                      const isCurrentMonth = index === currentMonthIndex;
                      return (
                        <div
                          key={`label-${index}`}
                          className="flex-1 flex justify-center relative"
                        >
                          {/* Extend highlight to label area for current month */}
                          {isCurrentMonth && (
                            <div className="absolute -top-8 bottom-0 -left-1 -right-1 bg-gray-100 rounded-b-lg"></div>
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
              {topRealtors.length > 0 ? (
                topRealtors.map((realtor, index) => (
                  <TopRealtorItem
                    key={index}
                    name={realtor.name}
                    value={realtor.value}
                    avatar={realtor.avatar}
                    isEmpty={false}
                  />
                ))
              ) : (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TopRealtorItem
                      key={i}
                      name="---"
                      value="₦0"
                      avatar={DefaultProfilePic}
                      isEmpty={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <TopRealtorItem
                  key={i}
                  name="---"
                  value="₦0"
                  avatar={DefaultProfilePic}
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
                    ? recentReceipts
                    : recentReceipts.slice(0, 2)
                  ).map((receipt) => (
                    <ReceiptRow
                      key={receipt.id}
                      {...receipt}
                      onViewDetails={handleViewReceiptDetails}
                    />
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

      <AdminReceiptsDetailsModal
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceiptModal}
        receipt={selectedReceipt}
        onStatusUpdate={handleReceiptStatusUpdate}
      />
    </div>
  );
};

export default AdminDashboardOverview;
