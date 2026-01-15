import { useState, useMemo, useEffect } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import RealtorDetailsSection from "../Admin dashboard realtors components/RealtorDetailsSection";
import Loader from "../../Loader";
import type { User } from "../../../services/types";
import { referralService, userService } from "../../../services/apiService";

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
}

const AdminDashboardReferrals = ({
  onNavigateToProperties,
  onNavigateToReceipts,
  onNavigateToTransactions,
  onNavigateToReferrals,
}: AdminDashboardReferralsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRealtor, setSelectedRealtor] = useState<User | null>(null);
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
    if (!searchQuery.trim()) return filteredByTab;

    const query = searchQuery.toLowerCase();
    return filteredByTab.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.referralCode.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
    );
  }, [searchQuery, filteredByTab]);

  const totalItems = filteredReferrals.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReferrals = filteredReferrals.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewAgent = (referralId: string) => {
    const row = rows.find((r) => r.id === referralId) ?? null;
    if (row) setSelectedRealtor(row.recruiter);
  };

  const handleToggleRealtorId = (realtorId: string) => {
    setExpandedRealtorId((prev) => (prev === realtorId ? null : realtorId));
  };

  const handleBackFromDetails = () => {
    setSelectedRealtor(null);
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
          onNavigateToProperties={onNavigateToProperties}
          onNavigateToReceipts={onNavigateToReceipts}
          onNavigateToTransactions={onNavigateToTransactions}
          onNavigateToReferrals={onNavigateToReferrals}
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
        <div className="flex gap-4 border-b border-[#F0F1F2]">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "all"
                ? "text-[#6500AC] border-[#6500AC]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            All Referrals
          </button>
          <button
            onClick={() => setActiveTab("top")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
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
      <div className="mb-6 flex flex-row sm:flex-row gap-4 items-start sm:items-center justify-between">
        <p className="text-sm text-gray-600">
          {activeTab === "all" ? "All Referrals" : "Top Referrals"}
        </p>
        <div className="flex flex-row gap-3">
          <AdminSearchBar
            onSearch={handleSearch}
            onFilterClick={() => console.log("Filter clicked")}
            className="flex-1 sm:flex-initial"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden mb-6">
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
