import { useState, useMemo, useEffect } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import TransactionsIcon from "../../icons/TransactionsIcon";
import { mockTransactions, type Transaction } from "./AdminTransactionsData";
import TransactionDetailsModal from "./TransactionDetailsModal";
import WithdrawalDetailsModal from "./WithdrawalDetailsModal";

// MetricCard component
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
const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
  const statusConfig = {
    Paid: { color: "#22C55E", bgColor: "#D1FAE5", label: "Paid" },
    Pending: { color: "#6B7280", bgColor: "#F3F4F6", label: "Pending" },
    Rejected: { color: "#EF4444", bgColor: "#FEE2E2", label: "Rejected" },
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

const AdminDashboardTransactions = () => {
  const [activeFilter, setActiveFilter] = useState<
    "All Transactions" | "Commission" | "Withdrawals"
  >("All Transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const itemsPerPage = 8;

  // Calculate metrics from all transactions
  const metrics = useMemo(() => {
    const totalAmount = transactions.reduce((sum, t) => {
      const amount = parseFloat(t.amount.replace(/[₦,]/g, "")) || 0;
      return sum + amount;
    }, 0);
    const pendingPayouts = transactions.filter(
      (t) => t.type === "Withdrawal" && t.status === "Pending"
    ).length;

    return {
      totalTransactions: `₦${totalAmount.toLocaleString()}`,
      pendingPayouts: pendingPayouts || 100,
    };
  }, [transactions]);

  // Filter transactions based on active filter and search query
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply type filter
    if (activeFilter === "Commission") {
      filtered = filtered.filter((t) => t.type === "Commission");
    } else if (activeFilter === "Withdrawals") {
      filtered = filtered.filter((t) => t.type === "Withdrawal");
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.realtorName.toLowerCase().includes(query) ||
          t.type.toLowerCase().includes(query) ||
          t.amount.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeFilter, searchQuery, transactions]);

  // Pagination
  const totalItems = filteredTransactions.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const handleFilterChange = (
    filter: "All Transactions" | "Commission" | "Withdrawals"
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

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    if (transaction.type === "Withdrawal") {
      setIsWithdrawalModalOpen(true);
    } else {
      setIsTransactionModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setIsTransactionModalOpen(false);
    setIsWithdrawalModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleMarkAsPaid = (transactionId: string) => {
    // TODO: Implement mark as paid logic
    console.log("Mark as paid:", transactionId);
    // Update transaction status
  };

  const handleReject = (transactionId: string) => {
    // TODO: Implement reject logic
    console.log("Reject:", transactionId);
    // Update transaction status
  };

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MetricCard
          title="Total transactions"
          value={metrics.totalTransactions}
          icon={<TransactionsIcon color="#6500AC" className="w-5 h-5" />}
          iconBgColor="#F0E6F7"
          iconStrokeColor="#F0E6F7"
          valueTextColor="#101828"
        />
        <MetricCard
          title="Pending payouts"
          value={metrics.pendingPayouts}
          icon={<TransactionsIcon color="#6B7280" className="w-5 h-5" />}
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
            onClick={() => handleFilterChange("All Transactions")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "All Transactions"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => handleFilterChange("Commission")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "Commission"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            Commission
          </button>
          <button
            onClick={() => handleFilterChange("Withdrawals")}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilter === "Withdrawals"
                ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
            }`}
          >
            Withdrawals
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

      {/* Transactions Table */}
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
                  Type
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
                      {transaction.realtorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.type === "Commission"
                        ? "Commission payment"
                        : "Withdrawal"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(transaction)}
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
                    No transactions found
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

      {/* Transaction Details Modal (for Commission) */}
      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseModals}
        transaction={selectedTransaction}
      />

      {/* Withdrawal Details Modal (for Withdrawals) */}
      <WithdrawalDetailsModal
        isOpen={isWithdrawalModalOpen}
        onClose={handleCloseModals}
        transaction={selectedTransaction}
        onMarkAsPaid={handleMarkAsPaid}
        onReject={handleReject}
      />
    </div>
  );
};

export default AdminDashboardTransactions;
