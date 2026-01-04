/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";

import SearchBar from "../SearchBar";
import Pagination from "../Pagination";
import GenericFilterModal from "../GenericFilterModal";
import { transactionFilterConfig } from "../filterConfigs";
import TransactionDetails from "./TransactionDetails";
import RequestPayoutModal from "./RequestPayoutModal";

import Plugcon from "../../../assets/Empty State.png";
import { CardColors } from "./Cardcolors";
import { useUser } from "../../../context/UserContext";
import { transactionService } from "../../../services/transactionService";
import type {
  TransactionMetrics,
  UnifiedTransaction,
} from "../../../services/transactionService";
import Toast from "../../Toast";
import type { ToastType } from "../../Toast";

type TransactionStatus = "Paid" | "Pending" | "Failed";
type TransactionType = "Commission" | "Withdrawal" | "Referral";

interface Transaction {
  id: string;
  title: string;
  amount: string;
  date: string;
  status: TransactionStatus;
  type: TransactionType;
}

const MetricCard = ({
  bg,
  title,
  value,
  button,
  iconBgColor,
  iconStrokeColor,
  iconFgColor,
  valueTextColor,
}: {
  bg: string;
  title: string;
  value: string | number | null;
  button?: React.ReactNode;
  iconBgColor: string;
  iconStrokeColor: string;
  iconFgColor: string;
  valueTextColor: string;
}) => (
  <div
    className={`${bg} border border-[#F0F1F2] rounded-xl shadow-sm p-5 flex flex-col gap-4 w-full transition duration-300 hover:shadow-lg`}
  >
    {/* Top Row - Icon and Title */}
    <div className="flex items-center gap-3">
      {/* --- DO NOT REMOVE SVG --- */}
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
        <path
          d="M18 14.625C17.5524 14.625 17.1232 14.8028 16.8068 15.1193C16.4903 15.4357 16.3125 15.8649 16.3125 16.3125C16.3125 16.7601 16.4903 17.1893 16.8068 17.5057C17.1232 17.8222 17.5524 18 18 18C18.4476 18 18.8768 17.8222 19.1932 17.5057C19.5097 17.1893 19.6875 16.7601 19.6875 16.3125C19.6875 15.8649 19.5097 15.4357 19.1932 15.1193C18.8768 14.8028 18.4476 14.625 18 14.625Z"
          fill={iconFgColor}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.125 12.6562C10.125 11.8792 10.755 11.25 11.5312 11.25H24.4688C25.245 11.25 25.875 11.88 25.875 12.6562V19.9688C25.875 20.7458 25.245 21.375 24.4688 21.375H11.5312C11.3466 21.375 11.1637 21.3386 10.9931 21.268C10.8225 21.1973 10.6675 21.0937 10.5369 20.9631C10.4063 20.8325 10.3027 20.6775 10.232 20.5069C10.1614 20.3363 10.125 20.1534 10.125 19.9688V12.6562ZM15.1875 16.3125C15.1875 15.5666 15.4838 14.8512 16.0113 14.3238C16.5387 13.7963 17.2541 13.5 18 13.5C18.7459 13.5 19.4613 13.7963 19.9887 14.3238C20.5162 14.8512 20.8125 15.5666 20.8125 16.3125C20.8125 17.0584 20.5162 17.7738 19.9887 18.3012C19.4613 18.8287 18.7459 19.125 18 19.125C17.2541 19.125 16.5387 18.8287 16.0113 18.3012C15.4838 17.7738 15.1875 17.0584 15.1875 16.3125ZM23.0625 15.75C22.9133 15.75 22.7702 15.8093 22.6648 15.9148C22.5593 16.0202 22.5 16.1633 22.5 16.3125V16.3185C22.5 16.629 22.752 16.881 23.0625 16.881H23.0685C23.2177 16.881 23.3608 16.8217 23.4662 16.7162C23.5717 16.6108 23.631 16.4677 23.631 16.3185V16.3125C23.631 16.1633 23.5717 16.0202 23.4662 15.9148C23.3608 15.8093 23.2177 15.75 23.0685 15.75H23.0625ZM12.375 16.3125C12.375 16.1633 12.4343 16.0202 12.5398 15.9148C12.6452 15.8093 12.7883 15.75 12.9375 15.75H12.9435C13.0927 15.75 13.2358 15.8093 13.3412 15.9148C13.4467 16.0202 13.506 16.1633 13.506 16.3125V16.3185C13.506 16.4677 13.4467 16.6108 13.3412 16.7162C13.2358 16.8217 13.0927 16.881 12.9435 16.881H12.9375C12.7883 16.881 12.6452 16.8217 12.5398 16.7162C12.4343 16.6108 12.375 16.4677 12.375 16.3185V16.3125Z"
          fill={iconFgColor}
        />
        <path
          d="M10.6875 22.5C10.5383 22.5 10.3952 22.5593 10.2898 22.6648C10.1843 22.7702 10.125 22.9133 10.125 23.0625C10.125 23.2117 10.1843 23.3548 10.2898 23.4602C10.3952 23.5657 10.5383 23.625 10.6875 23.625C14.7375 23.625 18.66 24.1665 22.3875 25.1813C23.28 25.4243 24.1875 24.7627 24.1875 23.8162V23.0625C24.1875 22.9133 24.1282 22.7702 24.0227 22.6648C23.9173 22.5593 23.7742 22.5 23.625 22.5H10.6875Z"
          fill={iconFgColor}
        />
      </svg>

      <p
        className="text-sm font-medium truncate"
        style={{ color: valueTextColor }}
      >
        {title}
      </p>
    </div>

    {/* Value + Button Row */}
    <div
      className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 min-w-0"
      style={{ color: valueTextColor }}
    >
      <p
        className="text-[24px] leading-9 font-medium break-words max-w-full"
        style={{ color: valueTextColor }}
      >
        {value ?? "-"}
      </p>
      {button && <div className="flex-shrink-0 w-full sm:w-auto">{button}</div>}
    </div>
  </div>
);

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "₦0";
  return `₦${Math.round(value).toLocaleString()}`;
};

const getOrdinalSuffix = (day: number) => {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatTransactionDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
};

const mapUnifiedToUI = (tx: UnifiedTransaction): Transaction => {
  const isCredit = tx.type === "credit";

  const uiStatus: Transaction["status"] = isCredit
    ? tx.status === "pending"
      ? "Pending"
      : "Paid"
    : tx.status === "paid"
    ? "Paid"
    : tx.status === "rejected"
    ? "Failed"
    : "Pending";

  return {
    id: tx.id,
    title: isCredit ? "Commission payment" : "Withdrawal request",
    amount: formatCurrency(tx.amount),
    date: formatTransactionDate(tx.created_at),
    status: uiStatus,
    type: isCredit ? "Commission" : "Withdrawal",
  };
};

const DashboardTransactions = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState("All transaction");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isRequestPayoutOpen, setIsRequestPayoutOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<TransactionMetrics | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>(
    {}
  );

  const itemsPerPage = 10;

  const getAmountNumber = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const load = async () => {
      try {
        const [txs, m] = await Promise.all([
          transactionService.getTransactions(user.id),
          transactionService.getMetrics(user.id),
        ]);

        if (cancelled) return;
        setTransactions(txs.map(mapUnifiedToUI));
        setMetrics(m);
      } catch {
        if (cancelled) return;
        setTransactions([]);
        setMetrics({
          totalEarnings: 0,
          totalWithdrawals: 0,
          currentBalance: 0,
          totalPending: 0,
        });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Filter logic
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Handle transaction type filtering
    let matchesTypeFilter = true;
    if (activeTypeFilter === "Earnings") {
      // Earnings = Commission + Referral transactions
      matchesTypeFilter =
        transaction.type === "Commission" || transaction.type === "Referral";
    } else if (activeTypeFilter === "Withdrawals") {
      matchesTypeFilter = transaction.type === "Withdrawal";
    } else if (activeTypeFilter === "Referrals") {
      matchesTypeFilter = transaction.type === "Referral";
    } else if (activeTypeFilter === "All transaction") {
      matchesTypeFilter = true; // Show all transactions
    }

    const matchesStatusFilter =
      activeStatusFilter === "All" || transaction.status === activeStatusFilter;

    if (!matchesSearch || !matchesTypeFilter || !matchesStatusFilter) {
      return false;
    }

    const amountRange = appliedFilters["Amount Range"];
    if (Array.isArray(amountRange) && amountRange.length === 2) {
      const min = Number(amountRange[0]);
      const max = Number(amountRange[1]);
      const amount = getAmountNumber(transaction.amount);
      if (Number.isFinite(min) && amount < min) return false;
      if (Number.isFinite(max) && amount > max) return false;
    }

    return true;
  });

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTypeFilter, activeStatusFilter, appliedFilters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-[#E9F9EF] text-[#22C55E]";
      case "Pending":
        return "bg-[#F5F5F5] text-[#6B7280]";
      case "Failed":
        return "bg-[#FDECEC] text-[#EF4444]";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const purple = CardColors.Purple;
  const green = CardColors.Green;
  const gray = CardColors.Gray;
  const yellow = CardColors.Yellow;

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const handleRequestPayout = () => {
    if (!user) return;

    if (user.kyc_status !== "approved") {
      setToast({
        message:
          "You must complete your KYC verification before requesting a payout.",
        type: "error",
      });
      return;
    }

    setIsRequestPayoutOpen(true);
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Transaction Type Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible -mx-4 px-4 pb-2">
        {["All transaction", "Earnings", "Withdrawals", "Referrals"].map(
          (label) => (
            <button
              key={label}
              onClick={() => setActiveTypeFilter(label)}
              className={`px-4 py-2 rounded-[10px] border text-sm font-medium transition-all whitespace-nowrap ${
                activeTypeFilter === label
                  ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                  : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA] hover:text-[#6500AC]"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Current Balance (Purple Theme) */}
        <MetricCard
          bg={purple.bg}
          title="Current Balance"
          value={formatCurrency(metrics?.currentBalance ?? 0)}
          iconBgColor={purple.iconBg}
          iconStrokeColor={purple.iconStroke}
          iconFgColor={purple.iconFg}
          valueTextColor={purple.valueTextColor}
          button={
            <button
              onClick={handleRequestPayout}
              className={`px-3 py-1 md:py-3 bg-white text-[${purple.buttonText}] text-sm font-medium rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors `}
            >
              Request Payout
            </button>
          }
        />

        {/* 2. Total Earnings */}
        <MetricCard
          bg={gray.bg}
          title="Total Earnings"
          value={formatCurrency(metrics?.totalEarnings ?? 0)}
          iconBgColor={purple.iconBg}
          iconStrokeColor={purple.iconStroke}
          iconFgColor={purple.iconFg}
          valueTextColor="#101828"
        />

        {/* 3. Withdrawals */}
        <MetricCard
          bg={green.bg}
          title="Withdrawals"
          value={formatCurrency(metrics?.totalWithdrawals ?? 0)}
          iconBgColor={green.iconBg}
          iconStrokeColor={green.iconStroke}
          iconFgColor={green.iconFg}
          valueTextColor="#101828"
        />

        {/* 4. Total Pending */}
        <MetricCard
          bg={yellow.bg}
          title="Total Pending"
          value={formatCurrency(metrics?.totalPending ?? 0)}
          iconBgColor={yellow.iconBg}
          iconStrokeColor={yellow.iconStroke}
          iconFgColor={yellow.iconFg}
          valueTextColor="#101828"
        />
      </div>

      {/* All Transactions Section */}
      <div className="bg-white border border-[#EAECF0] rounded-lg shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAECF0]">
          <div>
            <p className="text-[18px] font-medium text-[#101828]">
              {activeTypeFilter === "Earnings"
                ? "Earnings"
                : activeTypeFilter === "Withdrawals"
                ? "Withdrawals"
                : activeTypeFilter === "Referrals"
                ? "Referrals"
                : "All Transactions"}
            </p>
            <p className="text-sm text-[#667085]">
              {activeTypeFilter === "Earnings"
                ? "Keep track of your Earnings in this table"
                : activeTypeFilter === "Withdrawals"
                ? "Keep track of your Withdrawals in this table"
                : activeTypeFilter === "Referrals"
                ? "Keep track of your Referrals in this table"
                : "Keep track of your Transactions in this table"}
            </p>
          </div>
        </div>

        {/* Filter Tabs + Search */}
        <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible -mx-4 px-4 pb-2">
            {["All", "Paid", "Pending", "Failed"].map((label) => (
              <button
                key={label}
                onClick={() => setActiveStatusFilter(label)}
                className={`px-4 py-2 rounded-[10px] border text-sm font-medium transition-all whitespace-nowrap ${
                  activeStatusFilter === label
                    ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                    : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA] hover:text-[#6500AC]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* UNIFORM SEARCH BAR WRAPPER */}
          <div className="w-full lg:w-[350px]">
            <SearchBar
              className="w-full"
              onSearch={setSearchQuery}
              onFilterClick={() => setIsFilterOpen(true)}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EAECF0]" />

        {/* Transactions Table or Empty */}
        {paginatedTransactions.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center justify-center gap-5">
            <img src={Plugcon} alt="Empty" className="w-[185px]" />
            <p className="text-sm font-medium text-[#6B7280]">
              {activeTypeFilter === "Earnings"
                ? "You don't have any earnings yet!"
                : activeTypeFilter === "Withdrawals"
                ? "You don't have any withdrawals yet!"
                : activeTypeFilter === "Referrals"
                ? "You don't have any referrals yet!"
                : "You don't have any transactions yet!"}
            </p>
            <button className="px-5 py-3 rounded-lg bg-[#6500AC] text-white text-sm font-medium shadow-sm">
              Explore Properties
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[#667085] text-xs border-b border-[#EAECF0] bg-[#FAFAFA]">
                  <tr>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-[#EAECF0] hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">{transaction.id}</td>
                      <td className="px-6 py-3 font-medium text-[#0A1B39]">
                        {transaction.title}
                      </td>
                      <td className="px-6 py-3">{transaction.amount}</td>
                      <td className="px-6 py-3">{transaction.date}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          ● {transaction.status}
                        </span>
                      </td>
                      <td
                        onClick={() => setSelectedTransaction(transaction)}
                        className="px-6 py-3 text-[#6500AC] font-medium cursor-pointer hover:underline"
                      >
                        View details
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden px-6 pb-4 space-y-4">
              {paginatedTransactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="border border-[#E9EAEB] rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-[#0A1B39]">
                      {transaction.title}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      ● {transaction.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#667085] space-y-1">
                    <p>ID: {transaction.id}</p>
                    <p>Amount: {transaction.amount}</p>
                    <p>Date: {transaction.date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="mt-3 text-[#6500AC] font-medium text-sm hover:underline"
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-[#E9EAEB]">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <GenericFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        config={{
          ...transactionFilterConfig,
          onApply: (filters) => {
            setAppliedFilters(filters);

            const txType =
              String(filters["Transaction Type"] ?? "all") || "all";
            if (txType === "Commission") setActiveTypeFilter("Earnings");
            else if (txType === "Referral") setActiveTypeFilter("Referrals");
            else if (txType === "Withdrawal")
              setActiveTypeFilter("Withdrawals");
            else setActiveTypeFilter("All transaction");

            const status = String(filters["Status"] ?? "all") || "all";
            setActiveStatusFilter(status === "all" ? "All" : status);
          },
          onReset: () => {
            setAppliedFilters({});
            setActiveTypeFilter("All transaction");
            setActiveStatusFilter("All");
          },
        }}
      />

      <TransactionDetails
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />

      <RequestPayoutModal
        isOpen={isRequestPayoutOpen}
        onClose={() => setIsRequestPayoutOpen(false)}
        currentBalance={formatCurrency(metrics?.currentBalance ?? 0)}
        currentBalanceAmount={metrics?.currentBalance ?? 0}
        realtorId={user?.id ?? ""}
        onSuccess={async () => {
          if (!user?.id) return;
          const [txs, m] = await Promise.all([
            transactionService.getTransactions(user.id),
            transactionService.getMetrics(user.id),
          ]);
          setTransactions(txs.map(mapUnifiedToUI));
          setMetrics(m);
        }}
      />
    </div>
  );
};

export default DashboardTransactions;
