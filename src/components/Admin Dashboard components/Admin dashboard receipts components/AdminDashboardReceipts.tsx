import { useState, useMemo } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import ReceiptsIcon from "../../icons/ReceiptsIcon";
import { mockReceipts, type Receipt } from "./AdminReceiptsData";
import AdminReceiptsDetailsModal from "./AdminReceiptsDetailsModal";

// MetricCard component (matching AdminDashboardProperties pattern)
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconStrokeColor: string;
  valueTextColor: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconStrokeColor,
  valueTextColor,
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
        {value}
      </p>
    </div>
  </div>
);

// Status badge component
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

const AdminDashboardReceipts = () => {
  const [activeFilter, setActiveFilter] = useState<
    | "All receipts"
    | "Pending receipts"
    | "Approved receipts"
    | "Rejected receipts"
  >("All receipts");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);
  const itemsPerPage = 8;

  // Calculate metrics from all receipts
  const metrics = useMemo(() => {
    const totalUploaded = receipts.length;
    const totalApproved = receipts.filter(
      (r) => r.status === "Approved"
    ).length;
    const totalRejected = receipts.filter(
      (r) => r.status === "Rejected"
    ).length;
    const totalPending = receipts.filter(
      (r) => r.status === "Pending" || r.status === "Under review"
    ).length;

    return {
      totalUploaded: totalUploaded.toLocaleString(),
      totalApproved,
      totalRejected,
      totalPending,
    };
  }, [receipts]);

  // Filter receipts based on active filter and search query
  const filteredReceipts = useMemo(() => {
    let filtered = [...receipts];

    // Apply status filter
    if (activeFilter === "Pending receipts") {
      filtered = filtered.filter(
        (r) => r.status === "Pending" || r.status === "Under review"
      );
    } else if (activeFilter === "Approved receipts") {
      filtered = filtered.filter((r) => r.status === "Approved");
    } else if (activeFilter === "Rejected receipts") {
      filtered = filtered.filter((r) => r.status === "Rejected");
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.propertyName.toLowerCase().includes(query) ||
          r.clientName.toLowerCase().includes(query) ||
          r.amount.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeFilter, searchQuery, receipts]);

  // Pagination
  const totalItems = filteredReceipts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  const handleFilterChange = (
    filter:
      | "All receipts"
      | "Pending receipts"
      | "Approved receipts"
      | "Rejected receipts"
  ) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (receiptId: string) => {
    const receipt = receipts.find((r) => r.id === receiptId);
    if (receipt) {
      setSelectedReceipt(receipt);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleStatusUpdate = (
    receiptId: string,
    newStatus: Receipt["status"],
    rejectionReason?: string
  ) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: newStatus } : r))
    );
    // In a real app, you would also save the rejection reason
    console.log("Status updated:", receiptId, newStatus, rejectionReason);
  };

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Receipt uploaded"
          value={metrics.totalUploaded}
          icon={<ReceiptsIcon color="#6500AC" className="w-5 h-5" />}
          iconBgColor="#F0E6F7"
          iconStrokeColor="#F0E6F7"
          valueTextColor="#101828"
        />
        <MetricCard
          title="Total Receipt approved"
          value={metrics.totalApproved}
          icon={<ReceiptsIcon color="#22C55E" className="w-5 h-5" />}
          iconBgColor="#D1FAE5"
          iconStrokeColor="#D1FAE5"
          valueTextColor="#101828"
        />
        <MetricCard
          title="Total Receipt rejected"
          value={metrics.totalRejected}
          icon={<ReceiptsIcon color="#EF4444" className="w-5 h-5" />}
          iconBgColor="#FEE2E2"
          iconStrokeColor="#FEE2E2"
          valueTextColor="#101828"
        />
        <MetricCard
          title="Total Receipt Pending"
          value={metrics.totalPending}
          icon={<ReceiptsIcon color="#6B7280" className="w-5 h-5" />}
          iconBgColor="#F3F4F6"
          iconStrokeColor="#F3F4F6"
          valueTextColor="#101828"
        />
      </div>

      {/* Filter Tabs and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange("All receipts")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "All receipts"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            All receipts
          </button>
          <button
            onClick={() => handleFilterChange("Pending receipts")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "Pending receipts"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            Pending receipts
          </button>
          <button
            onClick={() => handleFilterChange("Approved receipts")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "Approved receipts"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            Approved receipts
          </button>
          <button
            onClick={() => handleFilterChange("Rejected receipts")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "Rejected receipts"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            Rejected receipts
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AdminSearchBar
            onSearch={handleSearch}
            onFilterClick={() => console.log("Filter clicked")}
            className="flex-1 sm:flex-initial"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[#F0F1F2]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Realtor
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
                        onClick={() => handleViewDetails(receipt.id)}
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
                    No receipts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <AdminPagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Receipt Details Modal */}
      <AdminReceiptsDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        receipt={selectedReceipt}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default AdminDashboardReceipts;
