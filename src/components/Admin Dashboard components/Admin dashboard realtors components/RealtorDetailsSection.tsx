import { ArrowLeft, Link2 } from "lucide-react";
import type { Realtor } from "./AdminRealtorsData";
import type { SalesStatistics } from "../Admin dashboard properties components/adminDashboardPropertiesData";
import AdminPropertyCard from "../Admin dashboard properties components/AdminPropertyCard";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { months } from "../Admin dashboard overview components/adminDashboardOverviewData";
import {
  mockReceipts,
  type Receipt,
} from "../Admin dashboard receipts components/AdminReceiptsData";
import TransactionsIcon from "../../icons/TransactionsIcon";
import {
  mockTransactions,
  type Transaction,
} from "../Admin dashboard transactions components/AdminTransactionsData";
import {
  mockReferrals,
  referralCode as defaultReferralCode,
  referralLink as defaultReferralLink,
} from "../Admin dashboard referrals components/refferalData";
import ReferralsIcon from "../../icons/ReferralsIcon";

const parseCurrencyValue = (amount: string) =>
  parseFloat(amount.replace(/[₦,]/g, "")) || 0;

const formatCurrencyValue = (value: number) =>
  `₦${Math.max(value, 0).toLocaleString("en-NG")}`;

const normalizeReferralLink = (link: string) => {
  if (!link) return "https://referral.veriplot.com";
  if (link.startsWith("https://") || link.startsWith("http://")) return link;
  if (link.startsWith("htt://")) {
    return `https://${link.replace("htt://", "")}`;
  }
  return `https://${link.replace(/^\/+/, "")}`;
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  iconStrokeColor: string;
  textColor?: string;
  variant?: "default" | "primary";
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconStrokeColor,
  textColor = "#101828",
  variant = "default",
}: MetricCardProps) => {
  const isPrimary = variant === "primary";
  const containerClasses = isPrimary
    ? "rounded-2xl p-5 flex flex-col gap-4 w-full bg-[#6500AC] text-white shadow-lg border border-transparent"
    : "bg-white border border-[#F0F1F2] rounded-2xl shadow-sm p-5 flex flex-col gap-4 w-full transition duration-300 hover:shadow-lg";

  const finalTextColor = isPrimary ? "#FFFFFF" : textColor;
  const finalIconBgColor = isPrimary ? "rgba(255,255,255,0.15)" : iconBgColor;
  const finalIconStrokeColor = isPrimary
    ? "rgba(255,255,255,0.35)"
    : iconStrokeColor;

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-3">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="30"
            height="30"
            rx="15"
            fill={finalIconBgColor}
          />
          <rect
            x="3"
            y="3"
            width="30"
            height="30"
            rx="15"
            stroke={finalIconStrokeColor}
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
          style={{
            color: isPrimary ? "rgba(255,255,255,0.85)" : finalTextColor,
          }}
        >
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-3 min-w-0">
        <p
          className="text-[24px] leading-9 font-semibold wrap-break-word max-w-full"
          style={{ color: finalTextColor }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const TransactionStatusBadge = ({
  status,
}: {
  status: Transaction["status"];
}) => {
  const statusConfig = {
    Paid: { color: "#22C55E", bgColor: "#D1FAE5", label: "Paid" },
    Pending: { color: "#F59E0B", bgColor: "#FEF3C7", label: "Pending" },
    Rejected: { color: "#EF4444", bgColor: "#FEE2E2", label: "Failed" },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className="flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-md"
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      ></span>
      {config.label}
    </span>
  );
};

interface RealtorDetailsSectionProps {
  realtor: Realtor;
  properties: Array<{
    id: number;
    image: string;
    title: string;
    price: number | string;
    location: string;
    isSoldOut: boolean;
    description?: string;
  }>;
  onBack: () => void;
  onViewBankDetails?: () => void;
  onRemoveRealtor?: () => void;
  onViewPropertyDetails?: (propertyId: number) => void;
  onViewReceiptDetails?: (receiptId: string) => void;
}

const RealtorDetailsSection = ({
  realtor,
  properties,
  onBack,
  onViewBankDetails,
  onRemoveRealtor,
  onViewPropertyDetails,
  onViewReceiptDetails,
}: RealtorDetailsSectionProps) => {
  const [activeTab, setActiveTab] = useState<
    "Properties sold" | "Receipts" | "Transactions" | "Referrals"
  >("Properties sold");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptsPage, setReceiptsPage] = useState(1);
  const receiptsPerPage = 8;
  const [transactionFilter, setTransactionFilter] = useState<
    "All" | "Commission" | "Withdrawals"
  >("All");
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsPerPage = 8;
  const [referralsPage, setReferralsPage] = useState(1);
  const referralsPerPage = 8;
  const [copyStatus, setCopyStatus] = useState<"code" | "link" | null>(null);

  // Get sales statistics data
  const salesStats: SalesStatistics = realtor.salesStatistics || {
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
    if (maxValue === 0) return ["₦0", "₦0", "₦0", "₦0", "₦0"];

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
  /* const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }; */

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;

    const query = searchQuery.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  // Get receipts for this realtor
  const realtorReceipts = useMemo(() => {
    // Filter receipts by realtorId or realtorName
    return mockReceipts.filter(
      (receipt) =>
        receipt.realtorId === realtor.id ||
        receipt.realtorName === realtor.name ||
        // Fallback: use a deterministic assignment based on realtor ID
        (() => {
          const realtorIdNum = parseInt(realtor.id.replace("#", "")) || 0;
          const receiptIdNum = parseInt(receipt.id.replace("#", "")) || 0;
          // Assign receipts to realtors deterministically
          return receiptIdNum % 100 === realtorIdNum % 100;
        })()
    );
  }, [realtor]);

  // Filter receipts based on search query
  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return realtorReceipts;

    const query = searchQuery.toLowerCase();
    return realtorReceipts.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.propertyName.toLowerCase().includes(query) ||
        r.clientName.toLowerCase().includes(query) ||
        r.amount.toLowerCase().includes(query)
    );
  }, [realtorReceipts, searchQuery]);

  // Pagination for receipts
  const receiptsTotalItems = filteredReceipts.length;
  const receiptsStartIndex = (receiptsPage - 1) * receiptsPerPage;
  const receiptsEndIndex = receiptsStartIndex + receiptsPerPage;
  const currentReceipts = filteredReceipts.slice(
    receiptsStartIndex,
    receiptsEndIndex
  );

  // Get transactions for this realtor
  const realtorTransactions = useMemo(() => {
    return mockTransactions.filter(
      (transaction) =>
        transaction.realtorId === realtor.id ||
        transaction.realtorName === realtor.name ||
        (() => {
          const realtorIdNum = parseInt(realtor.id.replace("#", "")) || 0;
          const transactionIdNum =
            parseInt(transaction.id.replace("#", "")) || 0;
          return transactionIdNum % 100 === realtorIdNum % 100;
        })()
    );
  }, [realtor]);

  const transactionMetrics = useMemo(() => {
    if (!realtorTransactions.length) {
      return {
        availableBalance: "₦0",
        totalEarnings: "₦0",
        totalWithdrawals: "₦0",
        totalPending: "₦0",
      };
    }

    let commissionTotal = 0;
    let withdrawalTotal = 0;
    let pendingTotal = 0;
    let paidWithdrawalTotal = 0;

    realtorTransactions.forEach((transaction) => {
      const amountValue = parseCurrencyValue(transaction.amount);
      if (transaction.type === "Commission") {
        commissionTotal += amountValue;
      } else {
        withdrawalTotal += amountValue;
        if (transaction.status === "Pending") {
          pendingTotal += amountValue;
        }
        if (transaction.status === "Paid") {
          paidWithdrawalTotal += amountValue;
        }
      }
    });

    const availableBalance = commissionTotal - paidWithdrawalTotal;

    return {
      availableBalance: formatCurrencyValue(availableBalance),
      totalEarnings: formatCurrencyValue(commissionTotal),
      totalWithdrawals: formatCurrencyValue(withdrawalTotal),
      totalPending: formatCurrencyValue(pendingTotal),
    };
  }, [realtorTransactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...realtorTransactions];

    if (transactionFilter === "Commission") {
      filtered = filtered.filter(
        (transaction) => transaction.type === "Commission"
      );
    } else if (transactionFilter === "Withdrawals") {
      filtered = filtered.filter(
        (transaction) => transaction.type === "Withdrawal"
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(query) ||
          transaction.amount.toLowerCase().includes(query) ||
          transaction.status.toLowerCase().includes(query) ||
          transaction.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [realtorTransactions, transactionFilter, searchQuery]);

  const transactionsTotalItems = filteredTransactions.length;
  const transactionsStartIndex = (transactionsPage - 1) * transactionsPerPage;
  const transactionsEndIndex = transactionsStartIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    transactionsStartIndex,
    transactionsEndIndex
  );

  useEffect(() => {
    setTransactionsPage(1);
  }, [transactionFilter, searchQuery, realtor.id]);

  const realtorReferrals = useMemo(() => {
    const primaryMatches = mockReferrals.filter(
      (referral) =>
        referral.referredBy === realtor.name ||
        referral.id === realtor.id ||
        (realtor.firstName &&
          referral.name.toLowerCase().includes(realtor.firstName.toLowerCase()))
    );

    if (primaryMatches.length) {
      return primaryMatches;
    }

    const realtorIdNum = parseInt(realtor.id.replace("#", "")) || 0;
    return mockReferrals.filter((referral, index) => {
      const referralIdNum = parseInt(referral.id.replace("#", "")) || index + 1;
      return referralIdNum % 5 === realtorIdNum % 5;
    });
  }, [realtor]);

  const filteredReferrals = useMemo(() => {
    if (!searchQuery.trim()) return realtorReferrals;

    const query = searchQuery.toLowerCase();
    return realtorReferrals.filter(
      (referral) =>
        referral.id.toLowerCase().includes(query) ||
        referral.name.toLowerCase().includes(query) ||
        referral.dateJoined.toLowerCase().includes(query) ||
        referral.totalReferralCommission.toLowerCase().includes(query)
    );
  }, [realtorReferrals, searchQuery]);

  const referralsTotalItems = filteredReferrals.length;
  const referralsStartIndex = (referralsPage - 1) * referralsPerPage;
  const referralsEndIndex = referralsStartIndex + referralsPerPage;
  const currentReferrals = filteredReferrals.slice(
    referralsStartIndex,
    referralsEndIndex
  );

  useEffect(() => {
    setReferralsPage(1);
  }, [searchQuery, realtor.id, activeTab]);

  const referralMetrics = useMemo(() => {
    const totalCommissionValue = realtorReferrals.reduce((sum, referral) => {
      return sum + parseCurrencyValue(referral.totalReferralCommission);
    }, 0);

    return {
      count: realtorReferrals.length,
      totalCommission: formatCurrencyValue(totalCommissionValue),
    };
  }, [realtorReferrals]);

  const realtorReferralCode = useMemo(() => {
    const idSuffix = realtor.id.replace("#", "") || "0000";
    const baseCode = defaultReferralCode || "AGTREF";
    return `${baseCode}-${idSuffix}`;
  }, [realtor]);

  const realtorReferralLink = useMemo(() => {
    const normalizedBase = normalizeReferralLink(defaultReferralLink);
    const slug = realtor.name
      ? realtor.name.toLowerCase().replace(/\s+/g, "-")
      : `agent-${realtor.id.replace("#", "")}`;
    const separator = normalizedBase.includes("?") ? "&" : "?";
    return `${normalizedBase}${separator}agent=${slug}`;
  }, [realtor]);

  const referralLinkDisplay =
    defaultReferralLink?.replace(/^htt:\/\//, "http://") ||
    "http://referral/code.com";

  const handleCopyValue = (value: string, type: "code" | "link") => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(() => setCopyStatus(type))
        .catch(() => setCopyStatus(type));
    } else {
      setCopyStatus(type);
    }
  };

  useEffect(() => {
    if (!copyStatus) return;
    const timer = setTimeout(() => setCopyStatus(null), 1500);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  // Status badge component for receipts
  const StatusBadge = ({ status }: { status: Receipt["status"] }) => {
    const statusConfig = {
      Approved: { color: "#22C55E", bgColor: "#D1FAE5", label: "Approved" },
      Pending: { color: "#6B7280", bgColor: "#F3F4F6", label: "Pending" },
      Rejected: { color: "#EF4444", bgColor: "#FEE2E2", label: "Rejected" },
      "Under review": {
        color: "#6500AC",
        bgColor: "#F0E6F7",
        label: "Under review",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span
        className="flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-md"
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.color }}
        ></span>
        {config.label}
      </span>
    );
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
          Realtors/Realtors detail
        </h2>
      </div>

      {/* Realtor Info and Sales Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Info Card */}
        <div className="flex flex-col bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 gap-6">
          <div className="flex flex-row justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">Basic info</h3>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  realtor.status === "Active" ? "bg-[#22C55E]" : "bg-[#EF4444]"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {realtor.status}
              </span>
            </div>
          </div>

          {/* Realtor Name and Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={realtor.avatar}
              alt={realtor.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 ring-offset-2 ring-offset-white"
            />
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {realtor.name}
              </p>
              <p className="text-sm text-gray-600">{realtor.email}</p>
            </div>
          </div>

          {/* Detailed Info Section */}
          <div className="space-y-3">
            {realtor.firstName && (
              <div>
                <p className="text-xs text-gray-500 mb-1">First name</p>
                <p className="text-sm text-gray-900">{realtor.firstName}</p>
              </div>
            )}
            {realtor.lastName && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Last name</p>
                <p className="text-sm text-gray-900">{realtor.lastName}</p>
              </div>
            )}
            {realtor.phone && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone number</p>
                <p className="text-sm text-gray-900">{realtor.phone}</p>
              </div>
            )}
            {realtor.gender && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="text-sm text-gray-900">{realtor.gender}</p>
              </div>
            )}
          </div>

          {/* KYC Verification Section */}
          {realtor.kycStatus && (
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Document uploaded: {realtor.kycDocument || "NIN"}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    realtor.kycStatus === "Uploaded"
                      ? "bg-[#22C55E]"
                      : realtor.kycStatus === "Pending"
                      ? "bg-[#F59E0B]"
                      : "bg-[#EF4444]"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {realtor.kycStatus}
                </span>
                {realtor.kycStatus === "Uploaded" && (
                  <button className="text-sm text-[#6500AC] font-semibold hover:underline ml-2">
                    View
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onViewBankDetails}
              className="flex-1 px-4 py-2 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Bank details
            </button>
            <button
              onClick={onRemoveRealtor}
              className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors"
            >
              Remove Realtor
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

      {/* Properties Sold Section */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(
            [
              "Properties sold",
              "Receipts",
              "Transactions",
              "Referrals",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery(""); // Reset search when switching tabs
                setReceiptsPage(1); // Reset pagination when switching tabs
                setTransactionsPage(1);
                setTransactionFilter("All");
              }}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                  : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        {(activeTab === "Properties sold" || activeTab === "Receipts") && (
          <div className="mb-6 flex items-center gap-3">
            <AdminSearchBar
              key={activeTab}
              onSearch={(query) => {
                setSearchQuery(query);
                if (activeTab === "Receipts") {
                  setReceiptsPage(1);
                }
              }}
              onFilterClick={() => console.log("Filter clicked")}
              className="flex-1"
              placeholder="Search"
            />
          </div>
        )}

        {/* Properties Grid */}
        {activeTab === "Properties sold" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <AdminPropertyCard
                  key={property.id}
                  image={property.image}
                  title={property.title}
                  price={property.price}
                  location={property.location}
                  isSoldOut={property.isSoldOut}
                  description={property.description}
                  onViewDetails={() => onViewPropertyDetails?.(property.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {searchQuery
                  ? "No properties found matching your search"
                  : "No properties sold by this realtor"}
              </div>
            )}
          </div>
        )}

        {/* Receipts Table */}
        {activeTab === "Receipts" && (
          <>
            <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#F0F1F2]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Client name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount paid
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date Uploaded
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F2]">
                    {currentReceipts.length > 0 ? (
                      currentReceipts.map((receipt) => (
                        <tr
                          key={receipt.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {receipt.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {receipt.clientName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {receipt.propertyName}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {receipt.amount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {receipt.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={receipt.status} />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => onViewReceiptDetails?.(receipt.id)}
                              className="text-sm text-[#6500AC] font-semibold hover:underline whitespace-nowrap"
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          {searchQuery
                            ? "No receipts found matching your search"
                            : "No receipts found for this realtor"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination for Receipts */}
            {receiptsTotalItems > 0 && (
              <div className="mt-6">
                <AdminPagination
                  totalItems={receiptsTotalItems}
                  itemsPerPage={receiptsPerPage}
                  currentPage={receiptsPage}
                  onPageChange={setReceiptsPage}
                />
              </div>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === "Transactions" && (
          <div className="space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Available Balance"
                value={transactionMetrics.availableBalance}
                icon={<TransactionsIcon color="#FFFFFF" className="w-5 h-5" />}
                iconBgColor="#6B7280"
                iconStrokeColor="#CFB0E5"
                textColor="#FFFFFF"
                variant="primary"
              />
              <MetricCard
                title="Total Earnings"
                value={transactionMetrics.totalEarnings}
                icon={<TransactionsIcon color="#6500AC" className="w-5 h-5" />}
                iconBgColor="#F0E6F7"
                iconStrokeColor="#CFB0E5"
              />
              <MetricCard
                title="Total Withdrawals"
                value={transactionMetrics.totalWithdrawals}
                icon={<TransactionsIcon color="#6B7280" className="w-5 h-5" />}
                iconBgColor="#F3F4F6"
                iconStrokeColor="#E5E7EB"
              />
              <MetricCard
                title="Total Pending"
                value={transactionMetrics.totalPending}
                icon={<TransactionsIcon color="#F59E0B" className="w-5 h-5" />}
                iconBgColor="#FEF3C7"
                iconStrokeColor="#FDE68A"
              />
            </div>

            {/* Filter + search */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 flex-wrap">
                {(["All", "Commission", "Withdrawals"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setTransactionFilter(filter)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                        transactionFilter === filter
                          ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                          : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
                      }`}
                    >
                      {filter === "All" ? "All transactions" : filter}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <AdminSearchBar
                  key="transactions-search"
                  onSearch={(query) => {
                    setSearchQuery(query);
                    setTransactionsPage(1);
                  }}
                  onFilterClick={() => console.log("Filter clicked")}
                  className="flex-1 lg:flex-initial"
                  placeholder="Search transactions"
                />
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#F0F1F2] bg-white">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.75 3.375H7.5V7.125H3.75V3.375ZM10.5 3.375H14.25V7.125H10.5V3.375ZM3.75 10.125H7.5V13.875H3.75V10.125ZM10.5 10.125H14.25V13.875H10.5V10.125Z"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#F0F1F2] bg-white">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.75 4.5H14.25M3.75 9H14.25M3.75 13.5H14.25"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#F0F1F2]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F2]">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {transaction.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {transaction.type === "Commission"
                              ? "Commission Payment"
                              : "Withdrawal"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {transaction.amount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TransactionStatusBadge
                              status={transaction.status}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                console.log(
                                  "View transaction details",
                                  transaction.id
                                )
                              }
                              className="text-sm text-[#6500AC] font-semibold hover:underline whitespace-nowrap"
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          {searchQuery
                            ? "No transactions match your search"
                            : "No transactions found for this realtor"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {transactionsTotalItems > 0 && (
              <AdminPagination
                totalItems={transactionsTotalItems}
                itemsPerPage={transactionsPerPage}
                currentPage={transactionsPage}
                onPageChange={setTransactionsPage}
              />
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "Referrals" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
              <div className="bg-[#6500AC] text-white rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-white/80">
                    Realtors referral code
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-3xl font-semibold tracking-wide">
                    {realtorReferralCode}
                  </p>
                  <button
                    onClick={() => handleCopyValue(realtorReferralCode, "code")}
                    className="px-4 py-2 bg-white text-[#5E17EB] rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    {copyStatus === "code" ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-white/80">or</span>
                  <div className="flex flex-1 items-center gap-3 flex-wrap min-w-0">
                    <a
                      href={realtorReferralLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[200px] px-4 py-2 border border-white/30 rounded-2xl bg-white/5 text-sm text-white font-medium break-all hover:bg-white/10 transition-colors"
                    >
                      {referralLinkDisplay}
                    </a>
                    <button
                      onClick={() =>
                        handleCopyValue(realtorReferralLink, "link")
                      }
                      className="px-4 py-2 bg-white text-[#5E17EB] rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors"
                    >
                      {copyStatus === "link" ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#F0F1F2] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F4F0FE] border border-[#E0D1FB] flex items-center justify-center">
                    <ReferralsIcon color="#6500AC" className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Referrals
                  </p>
                </div>
                <p className="text-4xl font-semibold text-gray-900">
                  {referralMetrics.count}
                </p>
                <p className="text-sm text-gray-500">
                  Commission earned{" "}
                  <span className="font-semibold text-gray-900">
                    {referralMetrics.totalCommission}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Showing {currentReferrals.length} of {referralMetrics.count}{" "}
                referrals
              </p>
              <AdminSearchBar
                key="referrals-search"
                onSearch={(query) => {
                  setSearchQuery(query);
                  setReferralsPage(1);
                }}
                onFilterClick={() => console.log("Filter clicked")}
                className="flex-1 md:flex-initial"
                placeholder="Search referrals"
              />
            </div>

            <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#F0F1F2]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total commission earned
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F2]">
                    {currentReferrals.length > 0 ? (
                      currentReferrals.map((referral) => (
                        <tr
                          key={referral.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {referral.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {referral.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {referral.dateJoined}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {referral.totalCommissionEarned ||
                              referral.totalReferralCommission}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="text-sm text-[#5E17EB] font-semibold hover:underline whitespace-nowrap"
                              onClick={() =>
                                console.log(
                                  "View referral details",
                                  referral.id
                                )
                              }
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          {searchQuery
                            ? "No referrals match your search"
                            : "No referrals found for this realtor"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {referralsTotalItems > 0 && (
              <AdminPagination
                totalItems={referralsTotalItems}
                itemsPerPage={referralsPerPage}
                currentPage={referralsPage}
                onPageChange={setReferralsPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtorDetailsSection;
