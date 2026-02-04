/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Allicon from "../../../assets/Stackedimg.png";
import SearchBar from "../SearchBar";
import Pagination from "../Pagination";
import GenericFilterModal from "../GenericFilterModal";
import { receiptFilterConfig } from "../filterConfigs";
import { useUser } from "../../../context/UserContext";
import {
  receiptService,
  type ReceiptWithProperty,
} from "../../../services/receiptService";
import { logger } from "../../../utils/logger";
import Loader from "../../Loader";
import DashboardReceiptDetails from "./DashboardReceiptDetails";

const MetricCard = ({
  bg,
  ring,
  dot,
  title,
  value,
}: {
  bg: string;
  ring: string;
  dot: string;
  title: string;
  value: string | number | null;
}) => (
  <div className="bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg p-3 md:p-5 flex flex-col gap-2 md:gap-3 w-full">
    <div className="flex items-center gap-2">
      <div
        className={`w-[20px] h-[20px] md:w-[30px] md:h-[30px] rounded-full border-[3px] md:border-[4.5px] ${ring} ${bg} relative`}
      >
        <span
          className={`absolute inset-[4px] md:inset-[6px] rounded-full ${dot}`}
        ></span>
      </div>
      <p className="text-[10px] md:text-sm font-medium text-[#101828]">
        {title}
      </p>
    </div>
    <p className="text-lg md:text-2xl leading-7 md:leading-9 font-medium text-[#101828]">
      {value ?? "0"}
    </p>
  </div>
);

const DashboardReceipts = ({
  onGoToProperties,
}: {
  onGoToProperties?: () => void;
}) => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>(
    {},
  );
  const [receipts, setReceipts] = useState<ReceiptWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const itemsPerPage = 10;

  // 1. Fetch Real Data
  useEffect(() => {
    const fetchReceipts = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await receiptService.getRealtorReceipts(user.id);
        setReceipts(data);
      } catch (error) {
        logger.error("Failed to fetch receipts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [user?.id]);

  // 2. Map UI Status to Database Casing
  const statusMap: Record<string, string> = {
    Approved: "approved",
    Pending: "pending",
    Rejected: "rejected",
    "Under review": "under_review",
  };

  // 3. Filtering Logic
  const filteredReceipts = receipts.filter((receipt) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      receipt.client_name?.toLowerCase().includes(query) ||
      receipt.property?.title?.toLowerCase().includes(query);

    const dbStatus = statusMap[activeFilter];
    const matchesStatus = activeFilter === "All" || receipt.status === dbStatus;

    if (!matchesSearch || !matchesStatus) return false;

    const clientName = String(appliedFilters["Client Name"] ?? "").trim();
    if (clientName) {
      const clientQuery = clientName.toLowerCase();
      const matchesClient = receipt.client_name
        ?.toLowerCase()
        .includes(clientQuery);
      if (!matchesClient) return false;
    }

    const amountRange = appliedFilters["Amount Range (₦)"];
    if (Array.isArray(amountRange) && amountRange.length === 2) {
      const min = typeof amountRange[0] === "number" ? amountRange[0] : null;
      const max = typeof amountRange[1] === "number" ? amountRange[1] : null;
      const amount = Number(receipt.amount_paid ?? 0);
      if (typeof min === "number" && Number.isFinite(min) && amount < min)
        return false;
      if (typeof max === "number" && Number.isFinite(max) && amount > max)
        return false;
    }

    const dateRange = appliedFilters["Date Range"];
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const startRaw = String(dateRange[0] ?? "").trim();
      const endRaw = String(dateRange[1] ?? "").trim();
      if (startRaw || endRaw) {
        const createdAt = new Date(receipt.created_at);
        if (Number.isNaN(createdAt.getTime())) return false;
        if (startRaw) {
          const start = new Date(startRaw);
          if (!Number.isNaN(start.getTime())) {
            start.setHours(0, 0, 0, 0);
            if (createdAt < start) return false;
          }
        }
        if (endRaw) {
          const end = new Date(endRaw);
          if (!Number.isNaN(end.getTime())) {
            end.setHours(23, 59, 59, 999);
            if (createdAt > end) return false;
          }
        }
      }
    }

    return true;
  });

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatCurrency = (amount: number | null) => {
    return `₦${(amount ?? 0).toLocaleString()}`;
  };

  const formatStatus = (status: string) => {
    // 1. Replace underscore with space: "under_review" -> "under review"
    const spacedStatus = status.replace(/_/g, " ");

    // 2. Capitalize first letter: "under review" -> "Under review"
    return spacedStatus.charAt(0).toUpperCase() + spacedStatus.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Using Intl.DateTimeFormat to get the abbreviated month (e.g., Dec)
    const day = date.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      date,
    );
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-[#E9F9EF] text-[#22C55E]";
      case "pending":
        return "bg-[#F5F5F5] text-[#6B7280]";
      case "under_review":
        return "bg-[#FFF7E6] text-[#F59E0B]";
      case "rejected":
        return "bg-[#FDECEC] text-[#EF4444]";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="px-3 py-3 md:px-6 md:py-6 space-y-4 md:space-y-6">
      {/* 4. Restore Metric Cards with Real Database Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-4">
        <MetricCard
          bg="bg-[#CFB0E5]"
          ring="border-[#F0E6F7]"
          dot="bg-[#6500AC]"
          title="Total uploaded"
          value={receipts.length}
        />
        <MetricCard
          bg="bg-[#BAEDCD]"
          ring="border-[#E9F9EF]"
          dot="bg-[#22C55E]"
          title="Total Approved"
          value={receipts.filter((r) => r.status === "approved").length}
        />
        <MetricCard
          bg="bg-[#FAC5C5]"
          ring="border-[#FDECEC]"
          dot="bg-[#EF4444]"
          title="Total Rejected"
          value={receipts.filter((r) => r.status === "rejected").length}
        />
        <MetricCard
          bg="bg-[#D1D3D8]"
          ring="border-[#F0F1F2]"
          dot="bg-[#6B7280]"
          title="Total pending"
          value={receipts.filter((r) => r.status === "pending").length}
        />
        <MetricCard
          bg="bg-[#FEF3C7]"
          ring="border-[#FFF7E6]"
          dot="bg-[#F59E0B]"
          title="Under review"
          value={receipts.filter((r) => r.status === "under_review").length}
        />
      </div>

      <div className="bg-white border border-[#EAECF0] rounded-lg shadow-sm">
        {/* Restore Original Header Layout */}
        <div className="px-3 py-3 md:px-6 md:py-5 border-b border-[#EAECF0] flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <p className="text-base md:text-[18px] font-medium text-[#101828]">
              Receipts
            </p>
            <p className="text-xs md:text-sm text-[#667085]">
              Keep track of your Receipts in this table
            </p>
          </div>
        </div>

        {/* Restore Filter Tabs */}
        <div className="px-3 py-3 md:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible -mx-3 px-3 md:-mx-4 md:px-4 pb-2">
            {["All", "Approved", "Rejected", "Pending", "Under review"].map(
              (label) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-[10px] border text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === label
                      ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                      : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA]"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <div className="w-full lg:w-[350px]">
            <SearchBar
              className="w-full"
              onSearch={setSearchQuery}
              onFilterClick={() => setIsFilterOpen(true)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <Loader text="Loading your receipts..." />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="px-4 py-8 md:px-6 md:py-10 flex flex-col items-center justify-center gap-3 md:gap-5">
            <img src={Allicon} alt="Empty" className="w-16 md:w-[185px]" />
            <p className="text-xs md:text-sm font-medium text-[#6B7280] text-center">
              You haven’t uploaded any Receipts yet!
            </p>
            <button
              onClick={onGoToProperties}
              className="px-4 py-1.5 md:px-5 md:py-3 rounded-lg bg-[#6500AC] text-white text-xs md:text-sm font-medium shadow-sm"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table - Using Real DB Columns */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[#667085] text-xs border-b border-[#EAECF0] bg-[#FAFAFA]">
                  <tr>
                    <th className="px-6 py-3">Property Name</th>
                    <th className="px-6 py-3">Client name</th>
                    <th className="px-6 py-3">Amount paid</th>
                    <th className="px-6 py-3">Date Uploaded</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReceipts.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-[#0A1B39]">
                        {r.property?.title}
                      </td>
                      <td className="px-6 py-3">{r.client_name}</td>
                      <td className="px-6 py-3">
                        {formatCurrency(r.amount_paid)}
                      </td>
                      <td className="px-6 py-3">{formatDate(r.created_at)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                            r.status,
                          )}`}
                        >
                          {formatStatus(r.status)}
                        </span>
                      </td>
                      <td
                        onClick={() => setSelectedReceipt(r)}
                        className="px-6 py-3 text-[#6500AC] font-medium cursor-pointer hover:underline"
                      >
                        View details
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Restored */}
            <div className="md:hidden px-3 pb-3 space-y-3">
              {paginatedReceipts.map((r) => (
                <div
                  key={r.id}
                  className="border border-[#E9EAEB] rounded-lg p-2 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="font-semibold text-xs md:text-sm text-[#0A1B39] truncate pr-2">
                      {r.property?.title}
                    </p>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyles(
                        r.status,
                      )}`}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </div>
                  <div className="text-[10px] md:text-xs text-[#667085] space-y-0.5">
                    <p>Client: {r.client_name}</p>
                    <p>Amount: {formatCurrency(r.amount_paid)}</p>
                    <p>Date: {formatDate(r.created_at)}</p>{" "}
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(r)}
                    className="w-full mt-2 py-1 border border-[#EAECF0] rounded-lg text-[10px] md:text-xs font-medium text-[#344054] hover:bg-gray-50 transition-colors"
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <Pagination
          totalItems={filteredReceipts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
      {/* Modal for Details - Ensure this handles the new data shape */}
      {selectedReceipt && (
        <DashboardReceiptDetails
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receipt={{
            ...selectedReceipt,
            propertyName: selectedReceipt.property?.title,
            clientName: selectedReceipt.client_name,
            amount: formatCurrency(selectedReceipt.amount_paid),
            date: new Date(selectedReceipt.created_at).toLocaleDateString(),
          }}
        />
      )}

      <GenericFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        config={{
          ...receiptFilterConfig,
          onApply: (filters) => {
            setAppliedFilters(filters);
            setCurrentPage(1);

            const selectedStatus = String(filters["Status"] ?? "all");
            if (selectedStatus === "all") {
              setActiveFilter("All");
              return;
            }

            const labelByStatus: Record<string, string> = {
              approved: "Approved",
              pending: "Pending",
              rejected: "Rejected",
              under_review: "Under review",
            };
            setActiveFilter(labelByStatus[selectedStatus] ?? "All");
          },
          onReset: () => {
            setAppliedFilters({});
            setActiveFilter("All");
            setCurrentPage(1);
          },
        }}
      />
    </div>
  );
};

export default DashboardReceipts;
