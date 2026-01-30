import { useState, useMemo, useEffect } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import RealtorDetailsSection from "../Admin dashboard realtors components/RealtorDetailsSection";
import Loader from "../../Loader";
import type { User } from "../../../services/types";
import { referralService, userService } from "../../../services/apiService";
import AdminSearchFilterModal from "../../AdminSearchFilterModal";

type TabType = "all" | "top";

const formatIdMiddle = (value: string, start = 6, end = 4) => {
  if (!value) return value;
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
};

type ReferralRow = {
  id: string;
  name: string;
  referralCode: string;
  dateJoined: string;
  recruitsCount: number;
  totalReferralCommission: string;
  recruiter: User;
};

interface AdminDashboardReferralsProps {
  onNavigateToProperties?: () => void;
  onNavigateToReceipts?: () => void;
  onNavigateToTransactions?: () => void;
  onNavigateToReferrals?: () => void;
  onNavigateToPropertyDetails?: (propertyId: string) => void;
}

const AdminDashboardReferrals = ({
  onNavigateToProperties,
  onNavigateToReceipts,
  onNavigateToTransactions,
  onNavigateToReferrals,
  onNavigateToPropertyDetails,
}: AdminDashboardReferralsProps) => {
  void onNavigateToProperties;
  void onNavigateToReceipts;
  void onNavigateToTransactions;
  void onNavigateToReferrals;
  void onNavigateToPropertyDetails;
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRealtor, setSelectedRealtor] = useState<User | null>(null);
  const [realtorStack, setRealtorStack] = useState<User[]>([]);
  const [expandedRealtorId, setExpandedRealtorId] = useState<string | null>(
    null,
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {},
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

    referralService
      .getReferralStats()
      .then((stats) => {
        if (cancelled) return;
        const mapped: ReferralRow[] = stats.map((s) => {
          const name =
            `${s.realtor.first_name ?? ""} ${
              s.realtor.last_name ?? ""
            }`.trim() || "-";
          return {
            id: s.realtor.id,
            name,
            referralCode: s.realtor.referral_code || "-",
            dateJoined: formatDate(s.realtor.created_at),
            recruitsCount: s.recruitsCount,
            totalReferralCommission: formatNaira(s.recruitsCommissionTotal),
            recruiter: s.realtor,
          };
        });
        setRows(mapped);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredByTab = useMemo(() => {
    if (activeTab === "top") {
      return [...rows].sort((a, b) => b.recruitsCount - a.recruitsCount);
    }
    return rows;
  }, [activeTab, rows]);

  const filteredReferrals = useMemo(() => {
    let filtered = filteredByTab;

    const toDayStart = (value: string) => new Date(`${value}T00:00:00`);
    const toDayEnd = (value: string) => new Date(`${value}T23:59:59.999`);

    // Apply modal filters
    const valueRange = activeFilters["Value Range (₦)"] as
      | Array<number | null>
      | undefined;
    if (Array.isArray(valueRange) && valueRange.length === 2) {
      const min = typeof valueRange[0] === "number" ? valueRange[0] : null;
      const max = typeof valueRange[1] === "number" ? valueRange[1] : null;
      filtered = filtered.filter((r) => {
        const amount =
          parseFloat(r.totalReferralCommission.replace(/[₦,]/g, "")) || 0;
        if (min !== null && amount < min) return false;
        if (max !== null && amount > max) return false;
        return true;
      });
    }

    const name = activeFilters["Name"] as string | undefined;
    if (name && name.trim()) {
      const query = name.trim().toLowerCase();
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(query));
    }

    const dateRange = activeFilters["Date Range"];
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const from = typeof dateRange[0] === "string" ? dateRange[0].trim() : "";
      const to = typeof dateRange[1] === "string" ? dateRange[1].trim() : "";
      if (from) {
        const fromDate = toDayStart(from);
        filtered = filtered.filter(
          (r) => new Date(r.recruiter.created_at) >= fromDate,
        );
      }
      if (to) {
        const toDate = toDayEnd(to);
        filtered = filtered.filter(
          (r) => new Date(r.recruiter.created_at) <= toDate,
        );
      }
    }

    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.referralCode.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query),
    );
  }, [searchQuery, filteredByTab, activeFilters]);

  const totalItems = filteredReferrals.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReferrals = filteredReferrals.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = (filters: Record<string, unknown>) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewAgent = (referralId: string) => {
    const row = rows.find((r) => r.id === referralId) ?? null;
    if (row) {
      setSelectedRealtor(row.recruiter);
      setRealtorStack([row.recruiter]);
    }
  };

  const handleToggleRealtorId = (realtorId: string) => {
    setExpandedRealtorId((prev) => (prev === realtorId ? null : realtorId));
  };

  const handleBackFromDetails = () => {
    if (realtorStack.length > 1) {
      const newStack = realtorStack.slice(0, -1);
      setRealtorStack(newStack);
      setSelectedRealtor(newStack[newStack.length - 1]);
    } else {
      setRealtorStack([]);
      setSelectedRealtor(null);
    }
  };

  const handleRemoveRealtor = async (realtorId: string) => {
    await userService.removeAsAdmin(realtorId);
    setRows((prev) => prev.filter((r) => r.id !== realtorId));
    setSelectedRealtor(null);
  };

  if (selectedRealtor) {
    return (
      <div className="p-6 bg-[#FCFCFC]">
        <RealtorDetailsSection
          realtor={selectedRealtor}
          onBack={handleBackFromDetails}
          onRemoveRealtor={handleRemoveRealtor}
          onViewRealtor={(realtor) => {
            setRealtorStack((prev) => [...prev, realtor]);
            setSelectedRealtor(realtor);
          }}
          onNavigateToPropertyDetails={onNavigateToPropertyDetails}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Referrals</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#F0F1F2] overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 min-h-[44px] text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "all"
                ? "text-[#6500AC] border-[#6500AC]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            All Referrals
          </button>
          <button
            onClick={() => setActiveTab("top")}
            className={`px-4 py-2 min-h-[44px] text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "top"
                ? "text-[#6500AC] border-[#6500AC]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Top Referrals
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {activeTab === "all" ? "All Referrals" : "Top Referrals"}
        </p>
        <div className="flex w-full sm:w-auto">
          <AdminSearchBar
            onSearch={handleSearch}
            onFilterClick={handleFilterClick}
            className="flex-1 sm:flex-initial"
            placeholder="Search"
          />
        </div>
      </div>

      <AdminSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        initialFilters={activeFilters}
        config={{
          title: "Filter Referrals",
          description: "Filter referrals by value, date range, and name",
          showPrice: false,
          showPropertyType: false,
          showLocation: false,
          showNumberRange: true,
          numberRangeLabel: "Value Range (₦)",
          numberRangeKey: "Value Range (₦)",
          numberRangeMin: 1,
          numberRangeMax: 1_000_000,
          showText: true,
          textLabel: "Name",
          textPlaceholder: "Search by name",
          textKey: "Name",
          showDateRange: true,
          dateRangeLabel: "Date Range",
          dateRangeKey: "Date Range",
        }}
      />

      {/* Referrals Table */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="hidden md:block overflow-x-auto admin-table-scroll">
          <table className="admin-table">
            <thead className="bg-gray-50 border-b border-[#F0F1F2]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Referral code
                </th>
                {activeTab === "all" ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount Referred
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total referral commission
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount Referred
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total commission earned
                    </th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F2]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={activeTab === "all" ? 7 : 6}
                    className="px-6 py-12"
                  >
                    <div className="flex justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : currentReferrals.length > 0 ? (
                currentReferrals.map((referral, index) => (
                  <tr
                    key={`${referral.id}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 w-56">
                      <p
                        role="button"
                        tabIndex={0}
                        onClick={() => handleToggleRealtorId(referral.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleToggleRealtorId(referral.id);
                          }
                        }}
                        className={`block w-full cursor-pointer select-text ${
                          expandedRealtorId === referral.id
                            ? "break-all whitespace-normal"
                            : "truncate whitespace-nowrap"
                        }`}
                        title={referral.id}
                      >
                        {expandedRealtorId === referral.id
                          ? referral.id
                          : formatIdMiddle(referral.id)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {referral.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {referral.referralCode}
                    </td>
                    {activeTab === "all" ? (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.dateJoined}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {referral.recruitsCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {referral.totalReferralCommission}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.recruitsCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.totalReferralCommission}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewAgent(referral.id)}
                        className="text-sm text-[#6500AC] font-semibold hover:underline whitespace-nowrap"
                      >
                        View agent
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeTab === "all" ? 7 : 6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No referrals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden px-3 pb-3 space-y-3">
          {isLoading ? (
            <div className="px-2 py-6 text-center text-xs text-gray-500">
              Loading...
            </div>
          ) : currentReferrals.length > 0 ? (
            currentReferrals.map((referral) => (
              <div
                key={referral.id}
                className="border border-[#E9EAEB] rounded-lg p-3 bg-white shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0A1B39] truncate">
                      {referral.name}
                    </p>
                    <p className="text-[10px] text-[#667085] truncate">
                      ID: {formatIdMiddle(referral.id)}
                    </p>
                    <p className="text-[10px] text-[#667085] truncate">
                      Referral code: {referral.referralCode}
                    </p>
                  </div>
                  <div className="shrink-0 text-[10px] text-[#667085] whitespace-nowrap">
                    {activeTab === "all" ? referral.dateJoined : "Top"}
                  </div>
                </div>
                <div className="text-[10px] text-[#667085] space-y-1">
                  <p>Amount referred: {referral.recruitsCount}</p>
                  <p>Total commission: {referral.totalReferralCommission}</p>
                </div>
                <button
                  onClick={() => handleViewAgent(referral.id)}
                  className="w-full mt-2 py-2 min-h-[44px] border border-[#EAECF0] rounded-lg text-[10px] font-medium text-[#344054] hover:bg-gray-50 transition-colors"
                >
                  View agent
                </button>
              </div>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-xs text-gray-500">
              No referrals found
            </div>
          )}
        </div>
      </div>

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

export default AdminDashboardReferrals;
