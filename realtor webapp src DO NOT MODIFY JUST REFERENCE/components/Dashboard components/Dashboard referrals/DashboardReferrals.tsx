/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, Users, Copy } from "lucide-react";
import SearchBar from "../SearchBar";
import Pagination from "../Pagination";
import GenericFilterModal from "../GenericFilterModal";
import Plugcon from "../../../assets/Empty State.png";
import { logger } from "../../../utils/logger";
import { useUser } from "../../../context/UserContext";
import { referralService } from "../../../services/apiService";

// UI interface for the table
interface UIReferral {
  id: string;
  name: string;
  dateJoined: string;
  totalCommission: string;
  createdAt: string;
}

const ReferralCodeCard = ({ code }: { code: string }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Construct dynamic referral link
  const referralLink = `${window.location.origin}/register?ref=${code}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      logger.error("Failed to copy code:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      logger.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="bg-[#6500AC] rounded-2xl p-3 md:p-6 text-white mb-4 md:mb-8">
      <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-6">
        <div className="flex-1">
          <h3 className="text-sm md:text-lg font-medium mb-2 md:mb-4">
            Referral Link
          </h3>
          <div className="flex items-center gap-2 bg-white/10 p-1.5 md:p-3 rounded-lg border border-white/20">
            <Link className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />
            <span className="flex-1 truncate text-[10px] md:text-sm">
              {referralLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1 md:p-2 hover:bg-white/10 rounded-md transition-colors"
            >
              <Copy
                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                  copiedLink ? "text-green-400" : ""
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm md:text-lg font-medium mb-2 md:mb-4">
            Referral Code
          </h3>
          <div className="flex items-center gap-2 bg-white/10 p-1.5 md:p-3 rounded-lg border border-white/20">
            <span className="flex-1 font-mono font-bold tracking-wider truncate text-xs md:text-base">
              {code}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1 md:p-2 hover:bg-white/10 rounded-md transition-colors"
            >
              <Copy
                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                  copiedCode ? "text-green-400" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardReferrals = () => {
  const { user } = useUser();
  const [referrals, setReferrals] = useState<UIReferral[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, totalEarned: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>(
    {}
  );

  const itemsPerPage = 10;

  const parseCommissionNumber = (value: string) => {
    const digits = value.replace(/[^\d.]/g, ""); // Allow decimal point
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatCurrency = (value: number) => {
    if (!Number.isFinite(value)) return "₦0.00";
    return `₦${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [referralsData, statsData] = await Promise.all([
          referralService.getByUplineId(user.id),
          referralService.getReferralStats(user.id),
        ]);

        // Map database referrals to the UI format used in your old layout
        const mapped = referralsData.map((ref: any) => {
          const downline = Array.isArray(ref.downline)
            ? ref.downline[0]
            : ref.downline;

          // Try to get the best display name
          const firstName = downline?.first_name ?? "";
          const lastName = downline?.last_name ?? "";
          const fullName = `${firstName} ${lastName}`.trim();
          const email = downline?.email ?? "";
          const phoneNumber = downline?.phone_number ?? "";
          const fallbackId =
            typeof ref.downline_id === "string" ? ref.downline_id : "";

          const displayName =
            fullName ||
            email ||
            phoneNumber ||
            (fallbackId ? `User ${fallbackId.slice(0, 8)}` : "Unknown User");

          return {
            id: ref.id,
            name: displayName,
            dateJoined: new Date(ref.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            totalCommission: formatCurrency(ref.commission_earned || 0),
            createdAt: ref.created_at,
          };
        });

        setReferrals(mapped);
        setStats({
          totalCount: statsData.totalReferrals,
          totalEarned: statsData.totalCommission,
        });
      } catch (err) {
        logger.error("Failed to fetch referrals:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, [user?.id]);

  const filteredReferrals = (() => {
    const query = searchQuery.toLowerCase().trim();
    const dateRange = appliedFilters["Date Joined"];
    const commissionRange = appliedFilters["Commission Range (₦)"];
    const sort = String(appliedFilters["Sort"] ?? "recommended");

    const matchesDateRange = (createdAt: string) => {
      if (!Array.isArray(dateRange) || dateRange.length !== 2) return true;
      const minDaysAgo = Number(dateRange[0]);
      const maxDaysAgo = Number(dateRange[1]);
      if (!Number.isFinite(minDaysAgo) || !Number.isFinite(maxDaysAgo)) {
        return true;
      }
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - maxDaysAgo);
      const end = new Date(now);
      end.setDate(now.getDate() - minDaysAgo);
      const created = new Date(createdAt);
      if (Number.isNaN(created.getTime())) return true;
      return created >= start && created <= end;
    };

    const matchesCommissionRange = (value: string) => {
      if (!Array.isArray(commissionRange) || commissionRange.length !== 2) {
        return true;
      }
      const min = Number(commissionRange[0]);
      const max = Number(commissionRange[1]);
      const amount = parseCommissionNumber(value);
      if (Number.isFinite(min) && amount < min) return false;
      if (Number.isFinite(max) && amount > max) return false;
      return true;
    };

    const base = referrals.filter((r) => {
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (!matchesDateRange(r.createdAt)) return false;
      if (!matchesCommissionRange(r.totalCommission)) return false;
      return true;
    });

    if (sort === "recommended") return base;
    const copy = [...base];

    if (sort === "newest") {
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sort === "oldest") {
      return copy.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    if (sort === "commission-asc") {
      return copy.sort(
        (a, b) =>
          parseCommissionNumber(a.totalCommission) -
          parseCommissionNumber(b.totalCommission)
      );
    }
    if (sort === "commission-desc") {
      return copy.sort(
        (a, b) =>
          parseCommissionNumber(b.totalCommission) -
          parseCommissionNumber(a.totalCommission)
      );
    }

    return base;
  })();

  const totalItems = filteredReferrals.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, appliedFilters]);

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[#0A1B39]">
            Referrals
          </h1>
          <p className="text-[#667085] text-xs md:text-base">
            Manage and track your referral network
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6500AC]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8">
            <div className="bg-white p-3 md:p-6 rounded-xl border border-[#F0F1F2] shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                <div className="p-1 md:p-2 bg-[#E9F9EF] rounded-lg text-[#22C55E]">
                  <Users className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </div>
                <span className="text-[10px] md:text-sm font-medium text-[#667085]">
                  Total Referrals
                </span>
              </div>
              <p className="text-lg md:text-2xl font-bold text-[#0A1B39]">
                {stats.totalCount}
              </p>
            </div>
            <div className="bg-white p-3 md:p-6 rounded-xl border border-[#F0F1F2] shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                <div className="p-1 md:p-2 bg-[#F5F3FF] rounded-lg text-[#6500AC]">
                  <Users className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </div>
                <span className="text-[10px] md:text-sm font-medium text-[#667085]">
                  Total Earnings
                </span>
              </div>
              <p className="text-lg md:text-2xl font-bold text-[#0A1B39]">
                ₦{stats.totalEarned.toLocaleString()}
              </p>
            </div>
          </div>

          <ReferralCodeCard code={user?.referral_code || "---"} />

          <div className="bg-white rounded-xl border border-[#E9EAEB] overflow-hidden">
            <div className="p-2 md:p-4 border-b border-[#E9EAEB] flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
              <div className="w-full md:w-72">
                <SearchBar
                  placeholder="Search referrals..."
                  onSearch={setSearchQuery}
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 border border-[#D1D5DB] rounded-lg text-xs md:text-sm font-medium text-[#344054] hover:bg-gray-50"
              >
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Filters
              </button>
            </div>

            {referrals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-20">
                <img
                  src={Plugcon}
                  alt="No referrals"
                  className="w-16 h-16 md:w-48 md:h-48 object-contain mb-3 md:mb-4"
                />
                <h3 className="text-sm md:text-lg font-medium text-[#0A1B39]">
                  No referrals yet
                </h3>
                <p className="text-[10px] md:text-sm text-[#667085]">
                  Start sharing your link to build your network
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#E9EAEB]">
                        <th className="px-6 py-4 text-xs font-medium text-[#667085] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-xs font-medium text-[#667085] uppercase tracking-wider">
                          Date Joined
                        </th>
                        <th className="px-6 py-4 text-xs font-medium text-[#667085] uppercase tracking-wider">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EAEB]">
                      {paginatedReferrals.map((referral) => (
                        <tr
                          key={referral.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0A1B39]">
                            {referral.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#667085]">
                            {referral.dateJoined}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0A1B39]">
                            {referral.totalCommission}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-[#E9EAEB]">
                  {paginatedReferrals.map((referral) => (
                    <div key={referral.id} className="p-2 md:p-3 bg-white">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setExpandedId(
                            expandedId === referral.id ? null : referral.id
                          )
                        }
                      >
                        <span className="font-medium text-xs md:text-sm text-[#0A1B39]">
                          {referral.name}
                        </span>
                        <button className="text-[#6500AC] text-[10px] md:text-xs font-medium">
                          {expandedId === referral.id
                            ? "Hide details"
                            : "View details"}
                        </button>
                      </div>

                      {expandedId === referral.id && (
                        <div className="mt-2 md:mt-3 space-y-1.5 md:space-y-2 bg-[#F9FAFB] p-1.5 md:p-2 rounded-lg border border-[#F0F1F2]">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] md:text-xs text-[#667085]">
                              Date Joined
                            </span>
                            <span className="text-[10px] md:text-xs font-medium text-[#0A1B39]">
                              {referral.dateJoined}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] md:text-xs text-[#667085]">
                              Total referral commission
                            </span>
                            <span className="text-[10px] md:text-xs font-medium text-[#0A1B39]">
                              {referral.totalCommission}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="px-3 py-2 md:px-6 md:py-4 border-t border-[#E9EAEB]">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      <GenericFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        config={{
          title: "Filter Referrals",
          description: "Filter your referrals by various criteria",
          sections: [
            {
              title: "Date Joined",
              type: "range",
              min: 0,
              max: 365,
              step: 1,
              formatValue: (val: number) => {
                const date = new Date();
                date.setDate(date.getDate() - val);
                return date.toLocaleDateString();
              },
            },
            {
              title: "Commission Range (₦)",
              type: "range",
              min: 0,
              max: 1_000_000,
              step: 1_000,
              formatValue: (val: number) => `₦${val.toLocaleString()}`,
            },
            {
              title: "Sort",
              type: "select",
              placeholder: "Select option",
              options: [
                { label: "Recommended", value: "recommended", type: "radio" },
                { label: "Newest", value: "newest", type: "radio" },
                { label: "Oldest", value: "oldest", type: "radio" },
                {
                  label: "Commission: Low to High",
                  value: "commission-asc",
                  type: "radio",
                },
                {
                  label: "Commission: High to Low",
                  value: "commission-desc",
                  type: "radio",
                },
              ],
            },
          ],
          onApply: (filters) => {
            setAppliedFilters(filters);
          },
          onReset: () => {
            setAppliedFilters({});
          },
        }}
      />
    </div>
  );
};

export default DashboardReferrals;
