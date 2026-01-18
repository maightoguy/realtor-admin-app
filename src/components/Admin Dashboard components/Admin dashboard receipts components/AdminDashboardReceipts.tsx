import { useEffect, useMemo, useState } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import AdminSearchFilterModal from "../../AdminSearchFilterModal";
import ReceiptsIcon from "../../icons/ReceiptsIcon";
import AdminReceiptsDetailsModal from "./AdminReceiptsDetailsModal";
import {
  propertyService,
  receiptService,
  userService,
} from "../../../services/apiService";
import type { ReceiptStatus } from "../../../services/types";
import Loader from "../../Loader";

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
const StatusBadge = ({ status }: { status: ReceiptStatus }) => {
  const statusConfig: Record<
    ReceiptStatus,
    { color: string; bgColor: string; label: string }
  > = {
    approved: { color: "#22C55E", bgColor: "#D1FAE5", label: "Approved" },
    pending: { color: "#6B7280", bgColor: "#F3F4F6", label: "Pending" },
    rejected: { color: "#EF4444", bgColor: "#FEE2E2", label: "Rejected" },
    under_review: {
      color: "#6500AC",
      bgColor: "#F0E6F7",
      label: "Under review",
    },
  };

  const config = statusConfig[status];

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

type AdminReceipt = {
  id: string;
  realtorId: string | null;
  realtorName: string;
  clientName: string;
  propertyId: string | null;
  propertyName: string;
  propertyLocation: string;
  propertyType: string;
  amountPaid: number;
  receiptUrls: string[];
  status: ReceiptStatus;
  createdAt: string;
  rejectionReason: string | null;
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
  const [selectedReceipt, setSelectedReceipt] = useState<AdminReceipt | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState<Record<string, unknown>>({});
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 8;

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

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    receiptService
      .getAll({ limit: 500 })
      .then(async (rows) => {
        if (cancelled) return;

        const realtorIds = Array.from(
          new Set(
            rows
              .map((r) => r.realtor_id)
              .filter((id): id is string => Boolean(id)),
          ),
        );
        const propertyIds = Array.from(
          new Set(
            rows
              .map((r) => r.property_id)
              .filter((id): id is string => Boolean(id)),
          ),
        );

        const [realtors, properties] = await Promise.all([
          userService.getByIds(realtorIds),
          propertyService.getByIds(propertyIds),
        ]);

        const realtorMap = new Map(realtors.map((u) => [u.id, u]));
        const propertyMap = new Map(properties.map((p) => [p.id, p]));

        const mapped: AdminReceipt[] = rows.map((r) => {
          const realtor = r.realtor_id
            ? (realtorMap.get(r.realtor_id) ?? null)
            : null;
          const property = r.property_id
            ? (propertyMap.get(r.property_id) ?? null)
            : null;
          const amountPaid = Number(r.amount_paid);

          return {
            id: r.id,
            realtorId: r.realtor_id ?? null,
            realtorName: realtor
              ? `${realtor.first_name} ${realtor.last_name}`.trim() || "-"
              : "-",
            clientName: r.client_name ?? "-",
            propertyId: r.property_id ?? null,
            propertyName: property?.title ?? "-",
            propertyLocation: property?.location ?? "-",
            propertyType: property?.category ?? "-",
            amountPaid: Number.isFinite(amountPaid) ? amountPaid : 0,
            receiptUrls: Array.isArray(r.receipt_urls) ? r.receipt_urls : [],
            status: r.status,
            createdAt: r.created_at,
            rejectionReason: r.rejection_reason ?? null,
          };
        });

        if (!cancelled) setReceipts(mapped);
      })
      .catch(() => {
        if (!cancelled) setReceipts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate metrics from all receipts
  const metrics = useMemo(() => {
    const totalUploaded = receipts.length;
    const totalApproved = receipts.filter(
      (r) => r.status === "approved",
    ).length;
    const totalRejected = receipts.filter(
      (r) => r.status === "rejected",
    ).length;
    const totalPending = receipts.filter(
      (r) => r.status === "pending" || r.status === "under_review",
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

    const toDayStart = (value: string) => new Date(`${value}T00:00:00`);
    const toDayEnd = (value: string) => new Date(`${value}T23:59:59.999`);
    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const matchesText = (
      query: string,
      ...fields: Array<string | null | undefined>
    ) => {
      const q = normalize(query);
      if (!q) return true;
      const tokens = q.split(" ").filter(Boolean);
      const hay = normalize(fields.filter(Boolean).join(" "));
      return tokens.every((t) => hay.includes(t));
    };

    // Apply status filter
    if (activeFilter === "Pending receipts") {
      filtered = filtered.filter(
        (r) => r.status === "pending" || r.status === "under_review",
      );
    } else if (activeFilter === "Approved receipts") {
      filtered = filtered.filter((r) => r.status === "approved");
    } else if (activeFilter === "Rejected receipts") {
      filtered = filtered.filter((r) => r.status === "rejected");
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.propertyName.toLowerCase().includes(query) ||
          r.realtorName.toLowerCase().includes(query) ||
          r.clientName.toLowerCase().includes(query) ||
          formatNaira(r.amountPaid).toLowerCase().includes(query),
      );
    }

    // Apply modal filters
    const priceRange = modalFilters["Price (₦)"] as number[] | undefined;
    if (priceRange && priceRange.length === 2) {
      const [min, max] = priceRange;
      filtered = filtered.filter(
        (r) => r.amountPaid >= min && r.amountPaid <= max,
      );
    }

    const type = modalFilters["Property Type"] as string | undefined;
    if (type) {
      filtered = filtered.filter((r) => r.propertyType === type);
    }

    const clientName = modalFilters["Client Name"] as string | undefined;
    if (clientName && clientName.trim()) {
      filtered = filtered.filter((r) => matchesText(clientName, r.clientName));
    }

    const realtorName = modalFilters["Realtor Name"] as string | undefined;
    if (realtorName && realtorName.trim()) {
      filtered = filtered.filter((r) =>
        matchesText(realtorName, r.realtorName),
      );
    }

    const dateRange = modalFilters["Date Range"];
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const from = typeof dateRange[0] === "string" ? dateRange[0].trim() : "";
      const to = typeof dateRange[1] === "string" ? dateRange[1].trim() : "";
      if (from) {
        const fromDate = toDayStart(from);
        filtered = filtered.filter((r) => new Date(r.createdAt) >= fromDate);
      }
      if (to) {
        const toDate = toDayEnd(to);
        filtered = filtered.filter((r) => new Date(r.createdAt) <= toDate);
      }
    }

    return filtered;
  }, [activeFilter, searchQuery, receipts, modalFilters]);

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
      | "Rejected receipts",
  ) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = (filters: Record<string, unknown>) => {
    setModalFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setModalFilters({});
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
    newStatus: ReceiptStatus,
    rejectionReason?: string,
  ) => {
    receiptService
      .updateStatus({
        id: receiptId,
        status: newStatus,
        rejectionReason: rejectionReason ?? null,
      })
      .then((updated) => {
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === receiptId
              ? {
                  ...r,
                  status: updated.status,
                  rejectionReason: updated.rejection_reason ?? null,
                }
              : r,
          ),
        );
      })
      .catch(() => {});
  };

  return (
    <div className="p-6 bg-[#FCFCFC]">
      <Loader isOpen={isLoading} text="Loading receipts..." />
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
            onFilterClick={handleFilterClick}
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
                      {`#${receipt.id.slice(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {receipt.realtorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {receipt.propertyName}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatNaira(receipt.amountPaid)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(receipt.createdAt)}
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

      {/* Filter Modal */}
      <AdminSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        initialFilters={modalFilters}
        config={{
          title: "Filter Receipts",
          description: "Filter receipts by amount, date range, and client name",
          showPrice: true,
          showPropertyType: true,
          showLocation: false,
          textFields: [
            {
              label: "Client Name",
              placeholder: "Search by client name",
              key: "Client Name",
            },
            {
              label: "Realtor Name",
              placeholder: "Search by realtor name",
              key: "Realtor Name",
            },
          ],
          showDateRange: true,
          dateRangeLabel: "Date Range",
          dateRangeKey: "Date Range",
        }}
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
