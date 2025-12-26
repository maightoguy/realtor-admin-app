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
import UploadReceiptModal from "../Dashboard Property component/UploadReceiptModal";

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
  <div className="bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg p-5 flex flex-col gap-3 w-full">
    <div className="flex items-center gap-2">
      <div
        className={`w-[30px] h-[30px] rounded-full border-[4.5px] ${ring} ${bg} relative`}
      >
        <span className={`absolute inset-[6px] rounded-full ${dot}`}></span>
      </div>
      <p className="text-sm font-medium text-[#101828]">{title}</p>
    </div>
    <p className="text-2xl leading-9 font-medium text-[#101828]">
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
    {}
  );
  const [receipts, setReceipts] = useState<ReceiptWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isUploadReceiptOpen, setIsUploadReceiptOpen] = useState(false);

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
      const min = Number(amountRange[0]);
      const max = Number(amountRange[1]);
      const amount = Number(receipt.amount_paid ?? 0);
      if (Number.isFinite(min) && amount < min) return false;
      if (Number.isFinite(max) && amount > max) return false;
    }

    const dateRange = appliedFilters["Date Range"];
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const minDaysAgo = Number(dateRange[0]);
      const maxDaysAgo = Number(dateRange[1]);
      if (Number.isFinite(minDaysAgo) && Number.isFinite(maxDaysAgo)) {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - maxDaysAgo);
        const end = new Date(now);
        end.setDate(now.getDate() - minDaysAgo);
        const createdAt = new Date(receipt.created_at);
        if (createdAt < start || createdAt > end) return false;
      }
    }

    return true;
  });

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
      date
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
    <div className="px-6 py-6 space-y-6">
      {/* 4. Restore Metric Cards with Real Database Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
        <div className="px-6 py-5 border-b border-[#EAECF0] flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <p className="text-[18px] font-medium text-[#101828]">Receipts</p>
            <p className="text-sm text-[#667085]">
              Keep track of your Receipts in this table
            </p>
          </div>
          <button
            onClick={() => setIsUploadReceiptOpen(true)}
            className="bg-[#5E17EB] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#4A14C7] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 0.82664C16 0.649829 15.9298 0.48026 15.8047 0.355235C15.6797 0.230211 15.5101 0.159973 15.3333 0.159973H7.05333C6.14667 0.159973 5.72 1.00664 5.72 1.80664C5.7256 4.76986 5.52959 7.73003 5.13333 10.6666C5.12714 10.705 5.10776 10.7399 5.07856 10.7655C5.04935 10.791 5.01213 10.8056 4.97333 10.8066H2.97333C1.64 10.8066 1.49333 12.1866 1.41333 13.0066C1.33333 14.32 1.15333 14.5 0.666667 14.5C0.489856 14.5 0.320286 14.5702 0.195262 14.6952C0.0702379 14.8203 0 14.9898 0 15.1666C0 15.3434 0.0702379 15.513 0.195262 15.638C0.320286 15.7631 0.489856 15.8333 0.666667 15.8333H8.33333C9.92 15.8333 10.1467 14.26 10.28 13.3266C10.3933 12.54 10.48 12.1666 10.6667 12.1666H10.94C10.9752 12.1662 11.0097 12.1769 11.0384 12.1973C11.0672 12.2177 11.0887 12.2466 11.1 12.28C11.14 12.4066 11.18 12.58 11.2067 12.7066C11.34 13.3333 11.58 14.5 13 14.5C15.7133 14.5 16 6.80664 16 3.51331V0.82664ZM8.04 8.99997C7.90739 8.99997 7.78021 8.94729 7.68645 8.85353C7.59268 8.75976 7.54 8.63258 7.54 8.49997C7.54 8.36736 7.59268 8.24019 7.68645 8.14642C7.78021 8.05265 7.90739 7.99997 8.04 7.99997H12.04C12.1726 7.99997 12.2998 8.05265 12.3936 8.14642C12.4873 8.24019 12.54 8.36736 12.54 8.49997C12.54 8.63258 12.4873 8.75976 12.3936 8.85353C12.2998 8.94729 12.1726 8.99997 12.04 8.99997H8.04ZM7.87333 3.16664C7.87333 3.03403 7.92601 2.90685 8.01978 2.81309C8.11355 2.71932 8.24073 2.66664 8.37333 2.66664H9.70667C9.83928 2.66664 9.96645 2.71932 10.0602 2.81309C10.154 2.90685 10.2067 3.03403 10.2067 3.16664C10.2067 3.29925 10.154 3.42642 10.0602 3.52019C9.96645 3.61396 9.83928 3.66664 9.70667 3.66664H8.37333C8.24073 3.66664 8.11355 3.61396 8.01978 3.52019C7.92601 3.42642 7.87333 3.29925 7.87333 3.16664ZM12.3733 6.33331H8.54C8.40739 6.33331 8.28022 6.28063 8.18645 6.18686C8.09268 6.09309 8.04 5.96591 8.04 5.83331C8.04 5.7007 8.09268 5.57352 8.18645 5.47975C8.28022 5.38598 8.40739 5.33331 8.54 5.33331H12.3733C12.5059 5.33331 12.6331 5.38598 12.7269 5.47975C12.8207 5.57352 12.8733 5.7007 12.8733 5.83331C12.8733 5.96591 12.8207 6.09309 12.7269 6.18686C12.6331 6.28063 12.5059 6.33331 12.3733 6.33331ZM8.95333 13.1333C8.78667 14.3133 8.65333 14.5 8.32667 14.5H2.74C2.71439 14.4986 2.68933 14.492 2.66639 14.4805C2.64345 14.4691 2.62312 14.453 2.60667 14.4333C2.59693 14.4113 2.5919 14.3874 2.5919 14.3633C2.5919 14.3392 2.59693 14.3154 2.60667 14.2933C2.69782 13.9234 2.75803 13.5465 2.78667 13.1666C2.79352 12.8275 2.8566 12.4918 2.97333 12.1733H8.97333C8.99847 12.1736 9.02322 12.1795 9.04574 12.1907C9.06825 12.2019 9.08794 12.2181 9.10333 12.2379C9.11872 12.2578 9.12941 12.2809 9.13461 12.3055C9.1398 12.3301 9.13937 12.3556 9.13333 12.38C9.02667 12.6666 8.98667 12.9 8.95333 13.1333Z"
                fill="white"
              />
            </svg>
            Upload Receipt
          </button>
        </div>

        {/* Restore Filter Tabs */}
        <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible -mx-4 px-4 pb-2">
            {["All", "Approved", "Rejected", "Pending", "Under review"].map(
              (label) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`px-4 py-2 rounded-[10px] border text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === label
                      ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                      : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA]"
                  }`}
                >
                  {label}
                </button>
              )
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
          <div className="px-6 py-10 flex flex-col items-center justify-center gap-5">
            <img src={Allicon} alt="Empty" className="w-[185px]" />
            <p className="text-sm font-medium text-[#6B7280]">
              You haven’t uploaded any Receipts yet!
            </p>
            <button
              onClick={onGoToProperties}
              className="px-5 py-3 rounded-lg bg-[#6500AC] text-white text-sm font-medium"
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
                <tbody>
                  {paginatedReceipts.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#EAECF0] hover:bg-gray-50"
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
                            r.status
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
            <div className="md:hidden px-6 pb-4 space-y-4">
              {paginatedReceipts.map((r) => (
                <div
                  key={r.id}
                  className="border border-[#E9EAEB] rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-[#0A1B39]">
                      {r.property?.title}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                        r.status
                      )}`}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </div>
                  <div className="text-sm text-[#667085] space-y-1">
                    <p>Client: {r.client_name}</p>
                    <p>Amount: {formatCurrency(r.amount_paid)}</p>
                    <p>Date: {formatDate(r.created_at)}</p>{" "}
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(r)}
                    className="mt-3 text-[#6500AC] font-medium text-sm hover:underline"
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

      <UploadReceiptModal
        isOpen={isUploadReceiptOpen}
        onClose={() => setIsUploadReceiptOpen(false)}
      />
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
