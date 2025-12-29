import { useEffect, useMemo, useState } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import RealtorsIcon from "../../icons/RealtorsIcon";
import RealtorDetailsSection from "./RealtorDetailsSection";
import Loader from "../../Loader";
import type { User } from "../../../services/types";
import { receiptService, userService } from "../../../services/apiService";
import DefaultProfilePic from "../../../assets/Default Profile pic.png";

// MetricCard component (matching AdminDashboardReceipts pattern)
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

type AdminRealtorRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  propertySold: number;
  amountSold: string;
  dateJoined: string;
  status: "Active" | "Inactive";
  user: User;
  receiptCounts: {
    approved: number;
    rejected: number;
    pending: number;
    under_review: number;
  };
};

const StatusBadge = ({ status }: { status: AdminRealtorRow["status"] }) => {
  const statusConfig = {
    Active: { color: "#22C55E", bgColor: "#D1FAE5", label: "Active" },
    Inactive: { color: "#EF4444", bgColor: "#FEE2E2", label: "Inactive" },
  };

  const config = statusConfig[status] || statusConfig.Active;

  return (
    <span
      className="flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-md"
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      ></span>
      {config.label}
    </span>
  );
};

const AdminDashboardRealtors = () => {
  const [activeFilter, setActiveFilter] = useState<
    "All Realtors" | "Top realtors" | "Approved receipts" | "Rejected receipts"
  >("All Realtors");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [realtors, setRealtors] = useState<AdminRealtorRow[]>([]);
  const [selectedRealtor, setSelectedRealtor] = useState<User | null>(null);
  const [totalRealtorsCount, setTotalRealtorsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRealtorId, setExpandedRealtorId] = useState<string | null>(
    null
  );
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

    Promise.all([
      userService.getAll({ role: "realtor", limit: 500 }),
      receiptService.getAll({ limit: 500 }),
      userService.countByRole("realtor"),
    ])
      .then(([users, receipts, total]) => {
        if (cancelled) return;
        setTotalRealtorsCount(total);

        const receiptCountsByRealtor = new Map<
          string,
          AdminRealtorRow["receiptCounts"]
        >();
        const approvedAmountByRealtor = new Map<string, number>();

        for (const r of receipts) {
          const realtorId = r.realtor_id ?? null;
          if (!realtorId) continue;
          const current = receiptCountsByRealtor.get(realtorId) ?? {
            approved: 0,
            rejected: 0,
            pending: 0,
            under_review: 0,
          };
          current[r.status] += 1;
          receiptCountsByRealtor.set(realtorId, current);

          if (r.status === "approved") {
            const prev = approvedAmountByRealtor.get(realtorId) ?? 0;
            approvedAmountByRealtor.set(
              realtorId,
              prev +
                (Number.isFinite(Number(r.amount_paid))
                  ? Number(r.amount_paid)
                  : 0)
            );
          }
        }

        const rows: AdminRealtorRow[] = users.map((u) => {
          const counts = receiptCountsByRealtor.get(u.id) ?? {
            approved: 0,
            rejected: 0,
            pending: 0,
            under_review: 0,
          };
          const approvedAmount = approvedAmountByRealtor.get(u.id) ?? 0;
          const name =
            `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "-";
          const avatar = u.avatar_url || DefaultProfilePic;
          const status: AdminRealtorRow["status"] =
            u.kyc_status === "approved" ? "Active" : "Inactive";

          return {
            id: u.id,
            name,
            email: u.email ?? "-",
            avatar,
            propertySold: counts.approved,
            amountSold: formatNaira(approvedAmount),
            dateJoined: formatDate(u.created_at),
            status,
            user: u,
            receiptCounts: counts,
          };
        });

        setRealtors(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setRealtors([]);
          setTotalRealtorsCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate metrics from all realtors
  const metrics = useMemo(() => {
    return {
      totalRealtors: (totalRealtorsCount || realtors.length).toLocaleString(),
      activeRealtors: realtors.filter((r) => r.status === "Active").length,
      inactiveRealtors: realtors.filter((r) => r.status === "Inactive").length,
    };
  }, [realtors, totalRealtorsCount]);

  // Filter realtors based on active filter and search query
  const filteredRealtors = useMemo(() => {
    let filtered = [...realtors];

    // Apply status filter
    if (activeFilter === "Top realtors") {
      // Sort by property sold descending and take top realtors
      filtered = [...filtered]
        .sort((a, b) => b.propertySold - a.propertySold)
        .slice(0, 50); // Top 50 realtors
    } else if (activeFilter === "Approved receipts") {
      filtered = filtered.filter((r) => r.receiptCounts.approved > 0);
    } else if (activeFilter === "Rejected receipts") {
      filtered = filtered.filter((r) => r.receiptCounts.rejected > 0);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.name.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeFilter, searchQuery, realtors]);

  // Pagination
  const totalItems = filteredRealtors.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRealtors = filteredRealtors.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  const handleFilterChange = (
    filter:
      | "All Realtors"
      | "Top realtors"
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

  const handleViewDetails = (realtorId: string) => {
    const realtor = realtors.find((r) => r.id === realtorId);
    if (realtor) {
      setSelectedRealtor(realtor.user);
    }
  };

  const handleToggleRealtorId = (realtorId: string) => {
    setExpandedRealtorId((prev) => (prev === realtorId ? null : realtorId));
  };

  const handleBackFromDetails = () => {
    setSelectedRealtor(null);
  };

  const handleViewBankDetails = () => {
    const bankDetails = selectedRealtor?.bank_details ?? null;
    if (!bankDetails || bankDetails.length === 0) {
      window.alert("No bank details found for this realtor.");
      return;
    }
    window.alert(JSON.stringify(bankDetails, null, 2));
  };

  const handleRemoveRealtor = () => {
    console.log("Remove realtor:", selectedRealtor?.id);
    setSelectedRealtor(null);
  };

  const handleViewPropertyDetails = (propertyId: string) => {
    console.log("View property details:", propertyId);
  };

  const handleViewReceiptDetails = (receiptId: string) => {
    // TODO: Implement view receipt details
    console.log("View receipt details:", receiptId);
  };

  const handleRealtorUpdated = (updated: User) => {
    setSelectedRealtor(updated);
    setRealtors((prev) =>
      prev.map((row) => {
        if (row.id !== updated.id) return row;
        const name =
          `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim() ||
          "-";
        const status: AdminRealtorRow["status"] =
          updated.kyc_status === "approved" ? "Active" : "Inactive";
        return {
          ...row,
          name,
          email: updated.email ?? "-",
          avatar: updated.avatar_url || row.avatar,
          dateJoined: formatDate(updated.created_at),
          status,
          user: updated,
        };
      })
    );
  };

  if (selectedRealtor) {
    return (
      <div className="p-6 bg-[#FCFCFC]">
        <RealtorDetailsSection
          realtor={selectedRealtor}
          onBack={handleBackFromDetails}
          onViewBankDetails={handleViewBankDetails}
          onRemoveRealtor={handleRemoveRealtor}
          onViewPropertyDetails={handleViewPropertyDetails}
          onViewReceiptDetails={handleViewReceiptDetails}
          onRealtorUpdated={handleRealtorUpdated}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Realtors"
          value={metrics.totalRealtors}
          icon={<RealtorsIcon color="#6500AC" className="w-5 h-5" />}
          iconBgColor="#F0E6F7"
          iconStrokeColor="#F0E6F7"
          valueTextColor="#101828"
        />
        <MetricCard
          title="Active Realtors"
          value={metrics.activeRealtors}
          icon={<RealtorsIcon color="#22C55E" className="w-5 h-5" />}
          iconBgColor="#D1FAE5"
          iconStrokeColor="#D1FAE5"
          valueTextColor="#101828"
        />
        <MetricCard
          title="Inactive Realtors"
          value={metrics.inactiveRealtors}
          icon={<RealtorsIcon color="#EF4444" className="w-5 h-5" />}
          iconBgColor="#FEE2E2"
          iconStrokeColor="#FEE2E2"
          valueTextColor="#101828"
        />
      </div>

      {/* Filter Tabs and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange("All Realtors")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "All Realtors"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            All Realtors
          </button>
          <button
            onClick={() => handleFilterChange("Top realtors")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "Top realtors"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            Top realtors
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

      {isLoading ? (
        <Loader text="Loading realtors..." />
      ) : (
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-[#F0F1F2]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-56">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-80">
                    Realtor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Property sold
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                    Amount sold
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-44">
                    Date Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F1F2]">
                {currentRealtors.length > 0 ? (
                  currentRealtors.map((realtor) => (
                    <tr
                      key={realtor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 w-56">
                        <p
                          role="button"
                          tabIndex={0}
                          onClick={() => handleToggleRealtorId(realtor.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleToggleRealtorId(realtor.id);
                            }
                          }}
                          className={`block w-full cursor-pointer select-text ${
                            expandedRealtorId === realtor.id
                              ? "break-all whitespace-normal"
                              : "truncate whitespace-nowrap"
                          }`}
                          title={realtor.id}
                        >
                          {realtor.id}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={realtor.avatar}
                            alt={realtor.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900">
                              {realtor.name}
                            </span>
                            <span className="text-sm text-gray-500 break-words">
                              {realtor.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {realtor.propertySold}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {realtor.amountSold}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {realtor.dateJoined}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={realtor.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(realtor.id)}
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
                      No realtors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <AdminPagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AdminDashboardRealtors;
