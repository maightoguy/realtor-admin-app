import { Component, useEffect, useMemo, useState } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import AdminSearchFilterModal from "../../AdminSearchFilterModal";
import TransactionsIcon from "../../icons/TransactionsIcon";
import type { Transaction } from "./AdminTransactionsData";
import TransactionDetailsModal from "./TransactionDetailsModal";
import WithdrawalDetailsModal from "./WithdrawalDetailsModal";
import {
  commissionService,
  payoutService,
  receiptService,
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

const transactionStatusConfig = {
  Paid: { color: "#22C55E", bgColor: "#D1FAE5", label: "Paid" },
  Approved: { color: "#6500AC", bgColor: "#F0E6F7", label: "Approved" },
  Pending: { color: "#6B7280", bgColor: "#F3F4F6", label: "Pending" },
  Rejected: { color: "#EF4444", bgColor: "#FEE2E2", label: "Rejected" },
} as const;

const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
  const config =
    transactionStatusConfig[status] || transactionStatusConfig.Pending;

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {},
  );
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
    status: Commission["status"] | Payout["status"],
  ): Transaction["status"] => {
    if (status === "paid") return "Paid";
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const normalizeDbStatus = (
    status: Commission["status"] | Payout["status"],
  ): Transaction["dbStatus"] => {
    if (status === "paid") return "paid";
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
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
            ].filter((id): id is string => Boolean(id)),
          ),
        );

        const receiptIds = Array.from(
          new Set(
            commissions
              .map((c) => c.receipt_id ?? null)
              .filter((id): id is string => Boolean(id)),
          ),
        );

        const [users, receipts] = await Promise.all([
          userService.getByIds(realtorIds),
          receiptService.getByIds(receiptIds),
        ]);
        const userById = new Map<string, User>(users.map((u) => [u.id, u]));
        const clientNameByReceiptId = new Map(
          receipts.map((r) => [r.id, r.client_name]),
        );

        const tx: Array<Transaction & { createdAtIso: string }> = [
          ...commissions.map((c): Transaction & { createdAtIso: string } => {
            const u = userById.get(c.realtor_id);
            const realtorName =
              `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim() ||
              u?.email ||
              "-";
            const clientName = c.receipt_id
              ? (clientNameByReceiptId.get(c.receipt_id) ?? undefined)
              : undefined;
            return {
              id: c.id,
              realtorId: c.realtor_id,
              realtorName,
              type: "Commission",
              amount: formatNaira(c.amount),
              date: formatDate(c.created_at),
              status: statusToUi(c.status),
              dbStatus: normalizeDbStatus(c.status),
              createdAtIso: c.created_at,
              clientName,
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
              dbStatus: normalizeDbStatus(p.status),
              bankName,
              accountNumber,
              createdAtIso: p.created_at,
            };
          }),
        ];

        tx.sort(
          (a, b) =>
            new Date(b.createdAtIso).getTime() -
            new Date(a.createdAtIso).getTime(),
        );

        setTransactions(tx);
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

  // Calculate metrics based on active filter
  const metrics = useMemo(() => {
    const parseAmount = (amountStr: string) =>
      parseFloat(amountStr.replace(/[₦,]/g, "")) || 0;

    let filteredForMetrics = transactions;
    let card1Title = "Total transactions";
    let card2Title = "Total pending transactions";

    if (activeFilter === "Commission") {
      filteredForMetrics = transactions.filter((t) => t.type === "Commission");
      card1Title = "Total Commissions";
      card2Title = "Total Pending Commissions";
    } else if (activeFilter === "Withdrawals") {
      filteredForMetrics = transactions.filter((t) => t.type === "Withdrawal");
      card1Title = "Total Payouts";
      card2Title = "Total Pending Payouts";
    }

    const totalAmount = filteredForMetrics.reduce((sum, t) => {
      return sum + parseAmount(t.amount);
    }, 0);

    const pendingCount = filteredForMetrics.filter(
      (t) => t.status === "Pending" || t.status === "Approved",
    ).length;

    return {
      card1: {
        title: card1Title,
        value: `₦${totalAmount.toLocaleString()}`,
      },
      card2: {
        title: card2Title,
        value: pendingCount,
      },
    };
  }, [transactions, activeFilter]);

  // Filter transactions based on active filter and search query
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

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
          t.amount.toLowerCase().includes(query),
      );
    }

    // Apply modal filters
    const priceRange = activeFilters["Price (₦)"] as number[] | undefined;
    if (priceRange && priceRange.length === 2) {
      const [min, max] = priceRange;
      filtered = filtered.filter((t) => {
        const amount = parseFloat(t.amount.replace(/[₦,]/g, "")) || 0;
        return amount >= min && amount <= max;
      });
    }

    const realtorName = activeFilters["Realtor Name"] as string | undefined;
    if (realtorName && realtorName.trim()) {
      filtered = filtered.filter((t) =>
        matchesText(realtorName, t.realtorName),
      );
    }

    const dateRange = activeFilters["Date Range"];
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const from = typeof dateRange[0] === "string" ? dateRange[0].trim() : "";
      const to = typeof dateRange[1] === "string" ? dateRange[1].trim() : "";
      if (from) {
        const fromDate = toDayStart(from);
        filtered = filtered.filter((t) => new Date(t.createdAtIso) >= fromDate);
      }
      if (to) {
        const toDate = toDayEnd(to);
        filtered = filtered.filter((t) => new Date(t.createdAtIso) <= toDate);
      }
    }

    return filtered;
  }, [activeFilter, searchQuery, transactions, activeFilters]);

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
    filter: "All Transactions" | "Commission" | "Withdrawals",
  ) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

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
      prev === transactionId ? null : transactionId,
    );
  };

  const handleCloseModals = () => {
    setIsTransactionModalOpen(false);
    setIsWithdrawalModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleApprovePayout = async (transactionId: string) => {
    const updated = await payoutService.updateStatus({
      id: transactionId,
      status: "approved",
    });

    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      await notificationService.create({
        userId: tx.realtorId,
        type: "success",
        title: "Withdrawal Approved",
        message: `Your withdrawal request of ${tx.amount} has been approved.`,
        metadata: { payout_id: transactionId, status: "approved" },
      });
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...t, status: "Approved", dbStatus: "approved" }
          : t,
      ),
    );
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
          ? {
              ...t,
              status: "Paid",
              dbStatus: "paid",
              date: formatDate(updated.created_at),
            }
          : t,
      ),
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
              dbStatus: "rejected",
              date: formatDate(updated.created_at),
              rejectionReason: reason,
            }
          : t,
      ),
    );
  };

  const handleApproveCommission = async (transactionId: string) => {
    const updated = await commissionService.updateStatus({
      id: transactionId,
      status: "approved",
    });

    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      await notificationService.create({
        userId: tx.realtorId,
        type: "success",
        title: "Commission Approved",
        message: `Your commission of ${tx.amount} has been approved.`,
        metadata: { commission_id: transactionId, status: "approved" },
      });
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...t, status: "Approved", dbStatus: "approved" }
          : t,
      ),
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
      prev.map((t) =>
        t.id === updated.id ? { ...t, status: "Paid", dbStatus: "paid" } : t,
      ),
    );
  };

  const handleRejectCommission = async (
    transactionId: string,
    reason: string,
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
          ? {
              ...t,
              status: "Rejected",
              dbStatus: "rejected",
              rejectionReason: reason,
            }
          : t,
      ),
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
              title={metrics.card1.title}
              value={metrics.card1.value}
              icon={<TransactionsIcon color="#6500AC" className="w-5 h-5" />}
              iconBgColor="#F0E6F7"
              iconStrokeColor="#F0E6F7"
              valueTextColor="#101828"
            />
            <MetricCard
              title={metrics.card2.title}
              value={metrics.card2.value}
              icon={<TransactionsIcon color="#6B7280" className="w-5 h-5" />}
              iconBgColor="#F3F4F6"
              iconStrokeColor="#F3F4F6"
              valueTextColor="#101828"
            />
          </div>

          {/* Filter Tabs and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filter Tabs */}
            <div
              className="flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full -mx-3 px-3 pb-2 sm:flex-wrap sm:overflow-visible sm:whitespace-normal sm:mx-0 sm:px-0 sm:pb-0"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <button
                type="button"
                onClick={() => handleFilterChange("All Transactions")}
                className={`px-4 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
                className={`px-4 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
                className={`px-4 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
                onFilterClick={handleFilterClick}
                className="flex-1 sm:flex-initial"
                placeholder="Search"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="hidden md:block overflow-x-auto admin-table-scroll">
              <table className="admin-table">
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
            <div className="md:hidden px-3 pb-3 space-y-3">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => {
                  const config =
                    transactionStatusConfig[transaction.status] ??
                    transactionStatusConfig.Pending;
                  return (
                    <div
                      key={transaction.id}
                      className="border border-[#E9EAEB] rounded-lg p-2 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="font-semibold text-xs text-[#0A1B39] truncate pr-2">
                          {transaction.type === "Commission"
                            ? "Commission payment"
                            : "Withdrawal"}
                        </p>
                        <span
                          className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            color: config.color,
                            backgroundColor: config.bgColor,
                          }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#667085] space-y-0.5">
                        <p>ID: {formatIdMiddle(transaction.id)}</p>
                        <p>Realtor: {transaction.realtorName}</p>
                        <p>Amount: {transaction.amount}</p>
                        <p>Date: {transaction.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewDetails(transaction)}
                        className="w-full mt-2 py-1 border border-[#EAECF0] rounded-lg text-[10px] font-medium text-[#344054] hover:bg-gray-50 transition-colors"
                      >
                        View details
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-2 py-6 text-center text-xs text-gray-500">
                  No transactions found
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

          {/* Filter Modal */}
          <AdminSearchFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApply={handleApplyFilter}
            onReset={handleResetFilter}
            initialFilters={activeFilters}
            config={{
              title: "Filter Transactions",
              description:
                "Filter transactions by amount, date range, and realtor",
              showPrice: true,
              showPropertyType: false,
              showLocation: false,
              priceMin: 0,
              priceMax: 10_000_000_000,
              priceStep: 100000,
              textFields: [
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

          {/* Transaction Details Modal (for Commission) */}
          <TransactionDetailsModal
            isOpen={isTransactionModalOpen}
            onClose={handleCloseModals}
            transaction={selectedTransaction}
            onApprove={handleApproveCommission}
            onMarkAsPaid={handleMarkCommissionAsPaid}
            onReject={handleRejectCommission}
          />

          {/* Withdrawal Details Modal (for Withdrawals) */}
          <WithdrawalDetailsModal
            isOpen={isWithdrawalModalOpen}
            onClose={handleCloseModals}
            transaction={selectedTransaction}
            onApprove={handleApprovePayout}
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
