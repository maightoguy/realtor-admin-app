import { useState, useMemo, useEffect } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import { mockReferrals } from "./refferalData";

type TabType = "all" | "top";

const AdminDashboardReferrals = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter referrals based on active tab
  const filteredByTab = useMemo(() => {
    if (activeTab === "top") {
      // For Top Referrals, sort by amountReferred in descending order
      return [...mockReferrals]
        .filter((r) => r.amountReferred !== undefined)
        .sort((a, b) => (b.amountReferred || 0) - (a.amountReferred || 0));
    }
    return mockReferrals;
  }, [activeTab]);

  // Filter referrals based on search query
  const filteredReferrals = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTab;

    const query = searchQuery.toLowerCase();
    return filteredByTab.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.referredBy.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        r.dateJoined.toLowerCase().includes(query)
    );
  }, [searchQuery, filteredByTab]);

  // Pagination
  const totalItems = filteredReferrals.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReferrals = filteredReferrals.slice(startIndex, endIndex);

  // Reset to page 1 when search or tab changes
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
    console.log("View agent:", referralId);
    // Handle view agent action
  };

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
                {activeTab === "all" ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Referred by
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Joined
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
              {currentReferrals.length > 0 ? (
                currentReferrals.map((referral, index) => (
                  <tr
                    key={`${referral.id}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {referral.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {referral.name}
                    </td>
                    {activeTab === "all" ? (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.referredBy}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {referral.dateJoined}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.totalReferralCommission}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.amountReferred || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.totalCommissionEarned ||
                            referral.totalReferralCommission}
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
                    colSpan={activeTab === "all" ? 6 : 5}
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
