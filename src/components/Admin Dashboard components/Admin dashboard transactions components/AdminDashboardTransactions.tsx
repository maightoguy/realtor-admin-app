import { Component, useEffect, useMemo, useState } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import TransactionsIcon from "../../icons/TransactionsIcon";
import type { Transaction } from "./AdminTransactionsData";
import TransactionDetailsModal from "./TransactionDetailsModal";
import WithdrawalDetailsModal from "./WithdrawalDetailsModal";
import {
  commissionService,
  payoutService,
  notificationService,
  userService,
} from "../../../services/apiService";
import Loader from "../../Loader";
import type { Commission, Payout, User } from "../../../services/types";

const formatIdMiddle = (value: string, start = 6, end = 4) => {
  if (!value) return value;
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
};

class TransactionsErrorBoundary extends Component<
  { children: React.ReactNode; onReset: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 bg-[#FCFCFC]">
          <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Transactions failed to render. Try again, or share the error
              message below.
            </p>
            <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-lg p-3 text-sm text-gray-800 mb-4 whitespace-pre-wrap">
              {this.state.error.message}
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                this.props.onReset();
              }}
              className="px-4 py-2 bg-[#6500AC] text-white rounded-lg text-sm font-medium hover:bg-[#4A14C7] transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      ></span>
      {config.label}
    </span>
  );
};

const AdminDashboardTransactionsInner = () => {
  const [activeFilter, setActiveFilter] = useState<
    "All Transactions" | "Commission" | "Withdrawals"
  >("All Transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);
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

  const statusToUi = (
    status: Commission["status"] | Payout["status"]
  ): Transaction["status"] => {
    if (status === "paid") return "Paid";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const extractString = (obj: unknown, key: string): string | undefined => {
    if (!obj || typeof obj !== "object") return undefined;
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      commissionService.getAll({ limit: 5000 }),
      payoutService.getAll({ limit: 5000 }),
    ])
      .then(async ([commissions, payouts]) => {
        if (cancelled) return;

        const realtorIds = Array.from(
          new Set(
            [
              ...commissions.map((c) => c.realtor_id),
              ...payouts.map((p) => p.realtor_id),
            ].filter((id): id is string => Boolean(id))
          )
        );

        const users = await userService.getByIds(realtorIds);
        const userById = new Map<string, User>(users.map((u) => [u.id, u]));

        const tx: Array<Transaction & { createdAtIso: string }> = [
          ...commissions.map((c): Transaction & { createdAtIso: string } => {
            const u = userById.get(c.realtor_id);
            const realtorName =
              `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim() ||
              u?.email ||
              "-";
            return {
              id: c.id,
              realtorId: c.realtor_id,
              realtorName,
              type: "Commission",
              amount: formatNaira(c.amount),
              date: formatDate(c.created_at),
              status: statusToUi(c.status),
              createdAtIso: c.created_at,
            };
          }),
          ...payouts.map((p): Transaction & { createdAtIso: string } => {
            const u = userById.get(p.realtor_id);
            const realtorName =
              `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim() ||
              u?.email ||
              "-";
            const bankName = extractString(p.bank_details, "bankName");
            const accountNumber =
              extractString(p.bank_details, "accountNo") ??
              extractString(p.bank_details, "accountNumber");

            return {
              id: p.id,
              realtorId: p.realtor_id,
              realtorName,
              type: "Withdrawal",
              amount: formatNaira(p.amount),
              date: formatDate(p.created_at),
              status: statusToUi(p.status),
              bankName,
              accountNumber,
              createdAtIso: p.created_at,
            };
          }),
        ];

        tx.sort(
          (a, b) =>
            new Date(b.createdAtIso).getTime() -
            new Date(a.createdAtIso).getTime()
        );

        setTransactions(tx.map(({ createdAtIso, ...rest }) => rest));
      })
      .catch(() => {
        if (!cancelled) setTransactions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      pendingPayouts,
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

  const handleToggleTransactionId = (transactionId: string) => {
    setExpandedTransactionId((prev) =>
      prev === transactionId ? null : transactionId
    );
  };

  const handleCloseModals = () => {
    setIsTransactionModalOpen(false);
    setIsWithdrawalModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleMarkPayoutAsPaid = async (transactionId: string) => {
    const updated = await payoutService.updateStatus({
      id: transactionId,
      status: "paid",
    });

    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      await notificationService.create({
        userId: tx.realtorId,
        type: "success",
        title: "Withdrawal Paid",
        message: `Your withdrawal request of ${tx.amount} has been marked as paid.`,
        metadata: { payout_id: transactionId, status: "paid" },
      });
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...t, status: "Paid", date: formatDate(updated.created_at) }
          : t
      )
    );
  };

  const handleRejectPayout = async (transactionId: string, reason: string) => {
    const updated = await payoutService.updateStatus({
      id: transactionId,
      status: "rejected",
    });

    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      await notificationService.create({
        userId: tx.realtorId,
        type: "error",
        title: "Withdrawal Rejected",
        message: `Your withdrawal request of ${tx.amount} has been rejected. Reason: ${reason}`,
        metadata: { payout_id: transactionId, status: "rejected", reason },
      });
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              status: "Rejected",
              date: formatDate(updated.created_at),
              rejectionReason: reason,
            }
          : t
      )
    );
  };

  const handleMarkCommissionAsPaid = async (transactionId: string) => {
    const updated = await commissionService.updateStatus({
      id: transactionId,
      status: "paid",
    });

    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      await notificationService.create({
        userId: tx.realtorId,
        type: "success",
        title: "Commission Paid",
        message: `Your commission of ${tx.amount} has been marked as paid.`,
        metadata: { commission_id: transactionId, status: "paid" },
      });
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, status: "Paid" } : t))
    );
  };

  const handleRejectCommission = async (
    transactionId: string,
    reason: string
  ) => {
    const updated = await commissionService.updateStatus({
      id: transactionId,
      status: "rejected",
    });

    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      await notificationService.create({
        userId: tx.realtorId,
        type: "error",
        title: "Commission Rejected",
        message: `Your commission of ${tx.amount} has been rejected. Reason: ${reason}`,
        metadata: { commission_id: transactionId, status: "rejected", reason },
      });
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...t, status: "Rejected", rejectionReason: reason }
          : t
      )
    );
  };

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {isLoading ? (
        <Loader text="Loading transactions..." />
      ) : (
        <>
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
                type="button"
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
                type="button"
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
                type="button"
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 w-56">
                          <p
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              handleToggleTransactionId(transaction.id)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleToggleTransactionId(transaction.id);
                              }
                            }}
                            className={`block w-full cursor-pointer select-text ${
                              expandedTransactionId === transaction.id
                                ? "break-all whitespace-normal"
                                : "truncate whitespace-nowrap"
                            }`}
                            title={transaction.id}
                          >
                            {expandedTransactionId === transaction.id
                              ? transaction.id
                              : formatIdMiddle(transaction.id)}
                          </p>
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
                            type="button"
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
            onMarkAsPaid={handleMarkCommissionAsPaid}
            onReject={handleRejectCommission}
          />

          {/* Withdrawal Details Modal (for Withdrawals) */}
          <WithdrawalDetailsModal
            isOpen={isWithdrawalModalOpen}
            onClose={handleCloseModals}
            transaction={selectedTransaction}
            onMarkAsPaid={handleMarkPayoutAsPaid}
            onReject={handleRejectPayout}
          />
        </>
      )}
    </div>
  );
};

const AdminDashboardTransactions = () => {
  const [resetKey, setResetKey] = useState(0);
  return (
    <TransactionsErrorBoundary onReset={() => setResetKey((k) => k + 1)}>
      <AdminDashboardTransactionsInner key={resetKey} />
    </TransactionsErrorBoundary>
  );
};

export default AdminDashboardTransactions;
