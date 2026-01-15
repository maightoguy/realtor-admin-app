import { ArrowLeft, Link2, Trash2, X } from "lucide-react";
import AdminPropertyCard from "../Admin dashboard properties components/AdminPropertyCard";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { months } from "../Admin dashboard overview components/adminDashboardOverviewData";
import TransactionsIcon from "../../icons/TransactionsIcon";
import ReferralsIcon from "../../icons/ReferralsIcon";
import DefaultProfilePic from "../../../assets/Default Profile pic.png";
import { propertyImages } from "../Admin dashboard properties components/adminDashboardPropertiesData";
import AdminReceiptsDetailsModal from "../Admin dashboard receipts components/AdminReceiptsDetailsModal";
import type { Transaction } from "../Admin dashboard transactions components/AdminTransactionsData";
import TransactionDetailsModal from "../Admin dashboard transactions components/TransactionDetailsModal";
import WithdrawalDetailsModal from "../Admin dashboard transactions components/WithdrawalDetailsModal";
import {
  commissionService,
  payoutService,
  propertyMediaService,
  propertyService,
  receiptService,
  referralService,
  userService,
} from "../../../services/apiService";
import type {
  Commission,
  Payout,
  Property,
  Receipt,
  ReceiptStatus,
  User,
} from "../../../services/types";

const formatCurrencyValue = (value: number) =>
  `₦${Math.max(value, 0).toLocaleString("en-NG")}`;

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

const formatIdMiddle = (value: string, start = 6, end = 4) => {
  if (!value) return value;
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
};

const normalizeReferralLink = (link: string) => {
  if (!link) return "https://referral.veriplot.com";
  if (link.startsWith("https://") || link.startsWith("http://")) return link;
  if (link.startsWith("htt://")) {
    return `https://${link.replace("htt://", "")}`;
  }
  return `https://${link.replace(/^\/+/, "")}`;
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  iconStrokeColor: string;
  textColor?: string;
  variant?: "default" | "primary";
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconStrokeColor,
  textColor = "#101828",
  variant = "default",
}: MetricCardProps) => {
  const isPrimary = variant === "primary";
  const containerClasses = isPrimary
    ? "rounded-2xl p-5 flex flex-col gap-4 w-full bg-[#6500AC] text-white shadow-lg border border-transparent"
    : "bg-white border border-[#F0F1F2] rounded-2xl shadow-sm p-5 flex flex-col gap-4 w-full transition duration-300 hover:shadow-lg";

  const finalTextColor = isPrimary ? "#FFFFFF" : textColor;
  const finalIconBgColor = isPrimary ? "rgba(255,255,255,0.15)" : iconBgColor;
  const finalIconStrokeColor = isPrimary
    ? "rgba(255,255,255,0.35)"
    : iconStrokeColor;

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-3">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="30"
            height="30"
            rx="15"
            fill={finalIconBgColor}
          />
          <rect
            x="3"
            y="3"
            width="30"
            height="30"
            rx="15"
            stroke={finalIconStrokeColor}
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
          style={{
            color: isPrimary ? "rgba(255,255,255,0.85)" : finalTextColor,
          }}
        >
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-3 min-w-0">
        <p
          className="text-[24px] leading-9 font-semibold wrap-break-word max-w-full"
          style={{ color: finalTextColor }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const TransactionStatusBadge = ({
  status,
}: {
  status: "Paid" | "Pending" | "Rejected";
}) => {
  const statusConfig = {
    Paid: { color: "#22C55E", bgColor: "#D1FAE5", label: "Paid" },
    Pending: { color: "#F59E0B", bgColor: "#FEF3C7", label: "Pending" },
    Rejected: { color: "#EF4444", bgColor: "#FEE2E2", label: "Failed" },
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

interface RealtorDetailsSectionProps {
  realtor: User;
  onBack: () => void;
  onRemoveRealtor?: (realtorId: string) => Promise<void>;
  onRealtorUpdated?: (updated: User) => void;
  onViewRealtor?: (realtor: User) => void;
  onNavigateToPropertyDetails?: (propertyId: string) => void;
}

interface RemoveRealtorModalProps {
  isOpen: boolean;
  realtorName: string;
  isRemoving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const RemoveRealtorModal = ({
  isOpen,
  realtorName,
  isRemoving,
  error,
  onClose,
  onConfirm,
}: RemoveRealtorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <div className="flex flex-col items-start gap-3">
            <div className="w-8 h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1B39]">
              Remove realtor
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA1AA] hover:text-[#667085] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[#667085] text-sm leading-relaxed">
            You are about to remove{" "}
            <span className="text-[#0A1B39] font-medium">{realtorName}</span>{" "}
            from the Veriplot database. This action may revoke access and affect
            related records.
          </p>

          <ul className="space-y-2 text-[#667085] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>They will lose access to the realtor platform.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>
                They may no longer be eligible for payouts/commissions.
              </span>
            </li>
          </ul>

          <p className="text-[#667085] text-sm leading-relaxed">
            Note that this action cannot be reversed. By clicking Proceed you
            agree to this.
          </p>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-[#EAECF0]">
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="sm:w-full sm:flex-1 px-4 py-2 border border-[#E6E7EC] text-[#667085] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="sm:w-full sm:flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
          >
            {isRemoving ? "Removing..." : "Proceed to remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface KycReviewModalProps {
  isOpen: boolean;
  realtor: User;
  onClose: () => void;
  onUpdated?: (updated: User) => void;
}

const KycReviewModal = ({
  isOpen,
  realtor,
  onClose,
  onUpdated,
}: KycReviewModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      setIsSaving(false);
      setError(null);
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const docUrl = realtor.id_document_url ?? null;
  const canReview = Boolean(docUrl);
  const normalized = (docUrl ?? "").split("?")[0].toLowerCase();
  const isImage =
    normalized.endsWith(".png") ||
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg") ||
    normalized.endsWith(".webp") ||
    normalized.endsWith(".gif");

  const handleUpdate = async (nextStatus: User["kyc_status"]) => {
    if (!canReview) return;
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await userService.update(realtor.id, {
        kyc_status: nextStatus,
      });
      onUpdated?.(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update KYC status.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabel =
    realtor.kyc_status === "approved"
      ? "Approved"
      : realtor.kyc_status === "pending"
      ? "Pending"
      : "Rejected";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="p-6 border-b border-[#F0F1F2]">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              KYC documents
            </h2>
            <p className="text-sm text-gray-600">
              Review submitted documents and update KYC status.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm gap-4">
                <span className="text-gray-600">Realtor</span>
                <span className="text-gray-900 font-medium text-right wrap-break-words">
                  {`${realtor.first_name ?? ""} ${
                    realtor.last_name ?? ""
                  }`.trim() ||
                    realtor.email ||
                    "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm gap-4">
                <span className="text-gray-600">Current status</span>
                <span className="text-gray-900 font-medium">{statusLabel}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">ID document</p>
                {docUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(docUrl, "_blank", "noopener,noreferrer")
                    }
                    className="text-sm text-[#6500AC] font-semibold hover:underline"
                  >
                    Open in new tab
                  </button>
                ) : null}
              </div>

              {docUrl ? (
                <div className="border border-[#F0F1F2] rounded-xl overflow-hidden bg-white">
                  {isImage ? (
                    <img
                      src={docUrl}
                      alt="KYC document"
                      className="w-full max-h-[520px] object-contain bg-[#FAFAFA]"
                    />
                  ) : (
                    <iframe
                      src={docUrl}
                      title="KYC document"
                      className="w-full h-[520px]"
                    />
                  )}
                </div>
              ) : (
                <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-xl p-4 text-sm text-gray-600">
                  No document uploaded for this realtor.
                </div>
              )}
            </div>

            {error ? (
              <div className="border border-[#FEE2E2] bg-[#FEF2F2] text-[#991B1B] rounded-xl p-4 text-sm">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={
                  !canReview || isSaving || realtor.kyc_status === "rejected"
                }
                onClick={() => handleUpdate("rejected")}
                className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={
                  !canReview || isSaving || realtor.kyc_status === "approved"
                }
                onClick={() => handleUpdate("approved")}
                className="px-4 py-2 bg-[#6500AC] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface BankDetailsModalProps {
  isOpen: boolean;
  realtor: User;
  onClose: () => void;
}

const BankDetailsModal = ({
  isOpen,
  realtor,
  onClose,
}: BankDetailsModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const accounts = realtor.bank_details ?? [];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="p-6 border-b border-[#F0F1F2]">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Bank details
            </h2>
            <p className="text-sm text-gray-600">
              All bank accounts saved for this realtor.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {accounts.length === 0 ? (
              <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-xl p-4 text-sm text-gray-600">
                No bank details found for this realtor.
              </div>
            ) : (
              accounts.map((a, idx) => (
                <div
                  key={`${a.bankName}-${a.accountNo}-${idx}`}
                  className="border border-[#F0F1F2] bg-white rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3 gap-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Account {idx + 1}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#F0E6F7] text-[#6500AC] font-medium">
                      {a.bankName || "Bank"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm gap-4">
                      <span className="text-gray-600">Account name</span>
                      <span className="text-gray-900 font-medium text-right wrap-break-words">
                        {a.accountName || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm gap-4">
                      <span className="text-gray-600">Account number</span>
                      <span className="text-gray-900 font-medium text-right">
                        {a.accountNo || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const RealtorDetailsSection = ({
  realtor,
  onBack,
  onRemoveRealtor,
  onRealtorUpdated,
  onViewRealtor,
  onNavigateToPropertyDetails,
}: RealtorDetailsSectionProps) => {
  type ReceiptDetailsItem = {
    id: string;
    realtorName: string;
    clientName: string;
    propertyName: string;
    amountPaid: number;
    receiptUrls: string[];
    status: ReceiptStatus;
    createdAt: string;
    rejectionReason: string | null;
  };

  const [activeTab, setActiveTab] = useState<
    "Properties sold" | "Receipts" | "Transactions" | "Referrals"
  >("Properties sold");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptsPage, setReceiptsPage] = useState(1);
  const receiptsPerPage = 8;
  const [transactionFilter, setTransactionFilter] = useState<
    "All" | "Commission" | "Withdrawals"
  >("All");
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsPerPage = 8;
  const [referralsPage, setReferralsPage] = useState(1);
  const referralsPerPage = 8;
  const [copyStatus, setCopyStatus] = useState<"code" | "link" | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(
    null
  );
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);
  const [expandedReferralId, setExpandedReferralId] = useState<string | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [downlines, setDownlines] = useState<User[]>([]);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] =
    useState<ReceiptDetailsItem | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleOpenRemoveModal = () => {
    setRemoveError(null);
    setIsRemoveModalOpen(true);
  };

  const handleCloseRemoveModal = () => {
    if (isRemoving) return;
    setIsRemoveModalOpen(false);
    setRemoveError(null);
  };

  const handleConfirmRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    setRemoveError(null);
    try {
      if (onRemoveRealtor) {
        await onRemoveRealtor(realtor.id);
      } else {
        await userService.removeAsAdmin(realtor.id);
      }
      setIsRemoveModalOpen(false);
      onBack();
    } catch (err) {
      setRemoveError(
        err instanceof Error ? err.message : "Failed to remove realtor."
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const handleReceiptStatusUpdate = (
    receiptId: string,
    newStatus: ReceiptStatus,
    rejectionReason?: string
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
                  rejection_reason: updated.rejection_reason ?? null,
                }
              : r
          )
        );
        setSelectedReceipt((prev) =>
          prev && prev.id === receiptId
            ? {
                ...prev,
                status: updated.status,
                rejectionReason: updated.rejection_reason ?? null,
              }
            : prev
        );
      })
      .catch(() => {});
  };

  const formatNaira = (amount: number) =>
    `₦${Math.round(amount).toLocaleString()}`;

  const statusToUi = (
    status: Commission["status"] | Payout["status"]
  ): Transaction["status"] => {
    if (status === "paid") return "Paid";
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const normalizeDbStatus = (
    status: Commission["status"] | Payout["status"]
  ): Transaction["dbStatus"] => {
    if (status === "paid") return "paid";
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  const extractString = (obj: unknown, key: string) => {
    if (!obj || typeof obj !== "object") return undefined;
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  };

  const handleApproveCommission = async (transactionId: string) => {
    const updated = await commissionService.updateStatus({
      id: transactionId,
      status: "approved",
    });
    setCommissions((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setSelectedTransaction((prev) =>
      prev && prev.id === updated.id
        ? {
            ...prev,
            status: statusToUi(updated.status),
            dbStatus: normalizeDbStatus(updated.status),
          }
        : prev
    );
  };

  const handleMarkCommissionAsPaid = async (transactionId: string) => {
    const updated = await commissionService.updateStatus({
      id: transactionId,
      status: "paid",
    });
    setCommissions((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setSelectedTransaction((prev) =>
      prev && prev.id === updated.id
        ? {
            ...prev,
            status: statusToUi(updated.status),
            dbStatus: normalizeDbStatus(updated.status),
          }
        : prev
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
    setCommissions((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setSelectedTransaction((prev) =>
      prev && prev.id === updated.id
        ? {
            ...prev,
            status: statusToUi(updated.status),
            dbStatus: normalizeDbStatus(updated.status),
            rejectionReason: reason,
          }
        : prev
    );
  };

  const handleApprovePayout = async (transactionId: string) => {
    const updated = await payoutService.updateStatus({
      id: transactionId,
      status: "approved",
    });
    setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedTransaction((prev) =>
      prev && prev.id === updated.id
        ? {
            ...prev,
            status: statusToUi(updated.status),
            dbStatus: normalizeDbStatus(updated.status),
          }
        : prev
    );
  };

  const handleMarkPayoutAsPaid = async (transactionId: string) => {
    const updated = await payoutService.updateStatus({
      id: transactionId,
      status: "paid",
    });
    setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedTransaction((prev) =>
      prev && prev.id === updated.id
        ? {
            ...prev,
            status: statusToUi(updated.status),
            dbStatus: normalizeDbStatus(updated.status),
            date: formatDate(updated.created_at),
          }
        : prev
    );
  };

  const handleRejectPayout = async (transactionId: string, reason: string) => {
    const updated = await payoutService.updateStatus({
      id: transactionId,
      status: "rejected",
    });
    setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedTransaction((prev) =>
      prev && prev.id === updated.id
        ? {
            ...prev,
            status: statusToUi(updated.status),
            dbStatus: normalizeDbStatus(updated.status),
            date: formatDate(updated.created_at),
            rejectionReason: reason,
          }
        : prev
    );
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.resolve()
      .then(async () => {
        const [
          receiptsRes,
          commissionsRes,
          payoutsRes,
          referralsRes,
          directReferralsRes,
        ] = await Promise.all([
          receiptService.getAll({ realtorId: realtor.id, limit: 1000 }),
          commissionService.getAll({ realtorId: realtor.id, limit: 1000 }),
          payoutService.getAll({ realtorId: realtor.id, limit: 1000 }),
          referralService.getAll({ upline_id: realtor.id, limit: 1000 }),
          userService.getAll({ referredBy: realtor.id, limit: 1000 }),
        ]);

        const propertyIds = Array.from(
          new Set(
            receiptsRes
              .map((r) => r.property_id)
              .filter((id): id is string => Boolean(id))
          )
        );

        const downlineIds = Array.from(
          new Set([
            ...referralsRes
              .map((r) => r.downline_id)
              .filter((id): id is string => Boolean(id)),
            ...directReferralsRes.map((u) => u.id),
          ])
        );

        // Collect receipt IDs from referral commissions that are missing downline_id
        const referralCommissionReceiptIds = commissionsRes
          .filter(
            (c) =>
              c.commission_type === "referral" && !c.downline_id && c.receipt_id
          )
          .map((c) => c.receipt_id as string);

        const [propertiesRes, downlinesRes, missingReceiptsRes] =
          await Promise.all([
            propertyService.getByIds(propertyIds),
            userService.getByIds(downlineIds),
            referralCommissionReceiptIds.length > 0
              ? receiptService.getByIds(referralCommissionReceiptIds)
              : Promise.resolve([]),
          ]);

        // Enrich commissions with downline_id from receipt if missing
        const enrichedCommissions = commissionsRes.map((c) => {
          if (
            c.commission_type === "referral" &&
            !c.downline_id &&
            c.receipt_id
          ) {
            const receipt = missingReceiptsRes.find(
              (r) => r.id === c.receipt_id
            );
            if (receipt && receipt.realtor_id) {
              return { ...c, downline_id: receipt.realtor_id };
            }
          }
          return c;
        });

        // Also add any new downlines found from these receipts to the downlines list
        const newDownlineIds = missingReceiptsRes
          .map((r) => r.realtor_id)
          .filter(
            (id): id is string =>
              typeof id === "string" && Boolean(id) && !downlineIds.includes(id)
          );

        let finalDownlines = downlinesRes;
        if (newDownlineIds.length > 0) {
          const newDownlinesRes = await userService.getByIds(newDownlineIds);
          finalDownlines = [...downlinesRes, ...newDownlinesRes];
        }

        if (cancelled) return;
        setReceipts(receiptsRes);
        setCommissions(enrichedCommissions);
        setPayouts(payoutsRes);
        setProperties(propertiesRes);
        setDownlines(finalDownlines);
      })
      .catch(() => {
        if (cancelled) return;
        setReceipts([]);
        setCommissions([]);
        setPayouts([]);
        setProperties([]);
        setDownlines([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [realtor.id]);

  const realtorName =
    `${realtor.first_name ?? ""} ${realtor.last_name ?? ""}`.trim() ||
    realtor.email ||
    "-";
  const realtorAvatar = realtor.avatar_url || DefaultProfilePic;
  const realtorStatus =
    realtor.kyc_status === "approved" ? "Active" : "Inactive";

  const propertyMap = useMemo(
    () => new Map(properties.map((p) => [p.id, p])),
    [properties]
  );

  const chartData = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);
    for (const receipt of receipts) {
      if (receipt.status !== "approved") continue;
      const d = new Date(receipt.created_at);
      if (Number.isNaN(d.getTime())) continue;
      totals[d.getUTCMonth()] += Number.isFinite(receipt.amount_paid)
        ? receipt.amount_paid
        : 0;
    }
    return totals;
  }, [receipts]);

  const maxValue = Math.max(...chartData, 1);

  // Calculate Y-axis labels based on max value
  const getYAxisLabels = () => {
    if (maxValue === 0) return ["₦0", "₦0", "₦0", "₦0", "₦0"];

    // Round max value to nearest million or appropriate scale
    let scale = 1000000; // Start with millions
    let roundedMax = Math.ceil(maxValue / scale) * scale;

    // If max is less than 1M, use thousands
    if (maxValue < 1000000) {
      scale = 1000;
      roundedMax = Math.ceil(maxValue / scale) * scale;
      return [
        `₦${(roundedMax / 1000).toFixed(0)}K`,
        `₦${((roundedMax * 0.75) / 1000).toFixed(0)}K`,
        `₦${((roundedMax * 0.5) / 1000).toFixed(0)}K`,
        `₦${((roundedMax * 0.25) / 1000).toFixed(0)}K`,
        "₦0",
      ];
    }

    // Use millions
    const maxM = roundedMax / 1000000;
    return [
      `₦${maxM.toFixed(0)}M`,
      `₦${(maxM * 0.75).toFixed(0)}M`,
      `₦${(maxM * 0.5).toFixed(0)}M`,
      `₦${(maxM * 0.25).toFixed(0)}M`,
      "₦0",
    ];
  };

  const yAxisLabels = getYAxisLabels();
  // Calculate chart max value based on the scale used
  const chartMaxValue =
    maxValue === 0
      ? 1
      : maxValue < 1000000
      ? Math.ceil(maxValue / 1000) * 1000
      : Math.ceil(maxValue / 1000000) * 1000000;

  // Get initials for avatar
  /* const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }; */

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    const uniqueSold = Array.from(
      new Set(
        receipts
          .filter((r) => r.status === "approved")
          .map((r) => r.property_id)
          .filter((id): id is string => Boolean(id))
      )
    )
      .map((propertyId, index) => {
        const p = propertyMap.get(propertyId);
        if (!p) return null;
        const img = Array.isArray(p.images) ? p.images[0] ?? "" : "";
        const fallbackImage =
          propertyImages[index % propertyImages.length] ?? DefaultProfilePic;
        return {
          id: p.id,
          image: img ? propertyMediaService.getPublicUrl(img) : fallbackImage,
          title: p.title,
          price: p.price,
          location: p.location,
          isSoldOut: p.status === "sold",
          description: p.description ?? undefined,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      image: string;
      title: string;
      price: number | string;
      location: string;
      isSoldOut: boolean;
      description?: string;
    }>;

    if (!searchQuery.trim()) return uniqueSold;

    const query = searchQuery.toLowerCase();
    return uniqueSold.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
    );
  }, [propertyMap, receipts, searchQuery]);

  // Get receipts for this realtor
  const realtorReceipts = useMemo(() => {
    return receipts.map((receipt) => {
      const propertyName = receipt.property_id
        ? propertyMap.get(receipt.property_id)?.title ?? receipt.property_id
        : "-";
      return {
        id: receipt.id,
        clientName: receipt.client_name ?? "-",
        propertyName,
        amount: formatCurrencyValue(
          Number.isFinite(receipt.amount_paid) ? receipt.amount_paid : 0
        ),
        date: formatDate(receipt.created_at),
        status: receipt.status,
      };
    });
  }, [propertyMap, receipts]);

  // Filter receipts based on search query
  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return realtorReceipts;

    const query = searchQuery.toLowerCase();
    return realtorReceipts.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.propertyName.toLowerCase().includes(query) ||
        r.clientName.toLowerCase().includes(query) ||
        r.amount.toLowerCase().includes(query)
    );
  }, [realtorReceipts, searchQuery]);

  // Pagination for receipts
  const receiptsTotalItems = filteredReceipts.length;
  const receiptsStartIndex = (receiptsPage - 1) * receiptsPerPage;
  const receiptsEndIndex = receiptsStartIndex + receiptsPerPage;
  const currentReceipts = filteredReceipts.slice(
    receiptsStartIndex,
    receiptsEndIndex
  );

  // Get transactions for this realtor
  const realtorTransactions = useMemo(() => {
    const statusLabel = (
      status: Commission["status"] | Payout["status"]
    ): "Paid" | "Pending" | "Rejected" => {
      if (status === "paid") return "Paid";
      if (status === "rejected") return "Rejected";
      return "Pending";
    };

    const mappedCommissions = commissions.map((c) => ({
      id: c.id,
      type: "Commission" as const,
      amount: formatCurrencyValue(Number.isFinite(c.amount) ? c.amount : 0),
      date: formatDate(c.created_at),
      status: statusLabel(c.status),
      created_at: c.created_at,
    }));

    const mappedPayouts = payouts.map((p) => ({
      id: p.id,
      type: "Withdrawal" as const,
      amount: formatCurrencyValue(Number.isFinite(p.amount) ? p.amount : 0),
      date: formatDate(p.created_at),
      status: statusLabel(p.status),
      created_at: p.created_at,
    }));

    return [...mappedCommissions, ...mappedPayouts].sort((a, b) => {
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      return bd - ad;
    });
  }, [commissions, payouts]);

  const transactionMetrics = useMemo(() => {
    const commissionTotal = commissions
      .filter((c) => c.status === "approved" || c.status === "paid")
      .reduce((sum, c) => sum + (Number.isFinite(c.amount) ? c.amount : 0), 0);

    const withdrawalTotal = payouts
      .filter((p) => p.status !== "rejected")
      .reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);

    const pendingTotal = payouts
      .filter((p) => p.status !== "paid" && p.status !== "rejected")
      .reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);

    const paidWithdrawalTotal = payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);

    const availableBalance = commissionTotal - paidWithdrawalTotal;

    return {
      availableBalance: formatCurrencyValue(availableBalance),
      totalEarnings: formatCurrencyValue(commissionTotal),
      totalWithdrawals: formatCurrencyValue(withdrawalTotal),
      totalPending: formatCurrencyValue(pendingTotal),
    };
  }, [commissions, payouts]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...realtorTransactions];

    if (transactionFilter === "Commission") {
      filtered = filtered.filter(
        (transaction) => transaction.type === "Commission"
      );
    } else if (transactionFilter === "Withdrawals") {
      filtered = filtered.filter(
        (transaction) => transaction.type === "Withdrawal"
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(query) ||
          transaction.amount.toLowerCase().includes(query) ||
          transaction.status.toLowerCase().includes(query) ||
          transaction.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [realtorTransactions, transactionFilter, searchQuery]);

  const transactionsTotalItems = filteredTransactions.length;
  const transactionsStartIndex = (transactionsPage - 1) * transactionsPerPage;
  const transactionsEndIndex = transactionsStartIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    transactionsStartIndex,
    transactionsEndIndex
  );

  useEffect(() => {
    setTransactionsPage(1);
  }, [transactionFilter, searchQuery, realtor.id]);

  const realtorReferrals = useMemo(() => {
    const commissionMap = new Map<string, number>();

    for (const c of commissions) {
      if (c.commission_type !== "referral" || !c.downline_id) continue;
      if (c.status === "rejected") continue;

      const amount = Number(c.amount);
      const current = commissionMap.get(c.downline_id) ?? 0;
      commissionMap.set(
        c.downline_id,
        current + (Number.isFinite(amount) ? amount : 0)
      );
    }

    return downlines
      .map((user) => {
        const commission = commissionMap.get(user.id) ?? 0;
        const name =
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
          user.email ||
          user.id;

        return {
          id: user.id,
          name,
          dateJoined: user.created_at ? formatDate(user.created_at) : "-",
          totalCommissionEarned: formatCurrencyValue(commission),
          totalReferralCommission: formatCurrencyValue(commission),
          rawDate: new Date(user.created_at).getTime(),
        };
      })
      .sort((a, b) => b.rawDate - a.rawDate);
  }, [downlines, commissions]);

  const filteredReferrals = useMemo(() => {
    if (!searchQuery.trim()) return realtorReferrals;

    const query = searchQuery.toLowerCase();
    return realtorReferrals.filter(
      (referral) =>
        referral.id.toLowerCase().includes(query) ||
        referral.name.toLowerCase().includes(query) ||
        referral.dateJoined.toLowerCase().includes(query) ||
        referral.totalReferralCommission.toLowerCase().includes(query)
    );
  }, [realtorReferrals, searchQuery]);

  const referralsTotalItems = filteredReferrals.length;
  const referralsStartIndex = (referralsPage - 1) * referralsPerPage;
  const referralsEndIndex = referralsStartIndex + referralsPerPage;
  const currentReferrals = filteredReferrals.slice(
    referralsStartIndex,
    referralsEndIndex
  );

  useEffect(() => {
    setReferralsPage(1);
  }, [searchQuery, realtor.id, activeTab]);

  const referralMetrics = useMemo(() => {
    const totalCommissionValue = commissions
      .filter(
        (c) => c.commission_type === "referral" && c.status !== "rejected"
      )
      .reduce((sum, c) => {
        const amount = Number(c.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);

    return {
      count: realtorReferrals.length,
      totalCommission: formatCurrencyValue(totalCommissionValue),
    };
  }, [realtorReferrals, commissions]);

  const realtorReferralCode = useMemo(() => {
    return realtor.referral_code || "-";
  }, [realtor.referral_code]);

  const realtorReferralLink = useMemo(() => {
    const normalizedBase = normalizeReferralLink(
      "https://referral.veriplot.com"
    );
    const slug = realtorReferralCode || `agent-${realtor.id}`;
    const separator = normalizedBase.includes("?") ? "&" : "?";
    return `${normalizedBase}${separator}code=${encodeURIComponent(slug)}`;
  }, [realtor.id, realtorReferralCode]);

  const referralLinkDisplay = realtorReferralLink;

  const handleCopyValue = (value: string, type: "code" | "link") => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(() => setCopyStatus(type))
        .catch(() => setCopyStatus(type));
    } else {
      setCopyStatus(type);
    }
  };

  useEffect(() => {
    if (!copyStatus) return;
    const timer = setTimeout(() => setCopyStatus(null), 1500);
    return () => clearTimeout(timer);
  }, [copyStatus]);

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

    const config = statusConfig[status] ?? statusConfig.pending;

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

  return (
    <div className="mb-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#F0F1F2] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          Realtors/Realtors detail
        </h2>
      </div>

      {/* Realtor Info and Sales Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Info Card */}
        <div className="flex flex-col bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 gap-6">
          <div className="flex flex-row justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">Basic info</h3>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  realtorStatus === "Active" ? "bg-[#22C55E]" : "bg-[#EF4444]"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {realtorStatus}
              </span>
            </div>
          </div>

          {/* Realtor Name and Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={realtorAvatar}
              alt={realtorName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 ring-offset-2 ring-offset-white"
            />
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {realtorName}
              </p>
              <p className="text-sm text-gray-600">{realtor.email || "-"}</p>
            </div>
          </div>

          {/* Detailed Info Section */}
          <div className="space-y-3">
            {realtor.first_name && (
              <div>
                <p className="text-xs text-gray-500 mb-1">First name</p>
                <p className="text-sm text-gray-900">{realtor.first_name}</p>
              </div>
            )}
            {realtor.last_name && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Last name</p>
                <p className="text-sm text-gray-900">{realtor.last_name}</p>
              </div>
            )}
            {realtor.phone_number && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone number</p>
                <p className="text-sm text-gray-900">{realtor.phone_number}</p>
              </div>
            )}
            {realtor.gender && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="text-sm text-gray-900">{realtor.gender}</p>
              </div>
            )}
          </div>

          {/* KYC Verification Section */}
          <div>
            <p className="text-xs text-gray-500 mb-1">KYC status</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  realtor.kyc_status === "approved"
                    ? "bg-[#22C55E]"
                    : realtor.kyc_status === "pending"
                    ? "bg-[#F59E0B]"
                    : "bg-[#EF4444]"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {realtor.kyc_status === "approved"
                  ? "Approved"
                  : realtor.kyc_status === "pending"
                  ? "Pending"
                  : "Rejected"}
              </span>
              <button
                type="button"
                onClick={() => setIsKycModalOpen(true)}
                className="text-sm text-[#6500AC] font-semibold hover:underline ml-2"
              >
                View
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsBankModalOpen(true);
              }}
              className="flex-1 px-4 py-2 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Bank details
            </button>
            <button
              onClick={handleOpenRemoveModal}
              className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors"
            >
              Remove Realtor
            </button>
          </div>
        </div>

        {/* Sales Statistics Card */}
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Sales Statistics
          </h3>

          {/* Chart */}
          <div className="relative h-64">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500 pr-3 w-12">
              {yAxisLabels.map((label, index) => (
                <span key={`y-label-${index}`}>{label}</span>
              ))}
            </div>

            {/* Chart container with grid lines */}
            <div className="ml-12 pr-4 relative h-full">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-12">
                <div className="w-full h-px bg-gray-200"></div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              {/* Bars and labels container */}
              <div className="relative">
                {/* Bars container */}
                <div className="relative h-48 flex items-end justify-between gap-1.5 mb-2">
                  {chartData.map((value, index) => {
                    const height = (value / chartMaxValue) * 100;
                    const isCurrentMonth = months[index] === "Aug";
                    return (
                      <div
                        key={`bar-${index}`}
                        className="flex-1 flex flex-col items-center h-full justify-end relative"
                      >
                        {/* Highlight background for current month */}
                        {isCurrentMonth && (
                          <div className="absolute -inset-x-1 -top-2 -bottom-8 bg-gray-100 rounded-lg"></div>
                        )}
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all relative z-10 ${
                            isCurrentMonth ? "bg-green-500" : "bg-[#6500AC]"
                          }`}
                          style={{
                            height: `${height}%`,
                            minHeight: height > 0 ? "4px" : "0",
                          }}
                        />
                        {/* Vertical line from bar to month label */}
                        <div
                          className="absolute w-px bg-gray-200 z-0"
                          style={{
                            bottom: "-20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            height: "20px",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Month labels */}
                <div className="flex justify-between gap-1.5 mt-2">
                  {months.map((month, index) => (
                    <div
                      key={`label-${index}`}
                      className="flex-1 text-center text-xs text-gray-500"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Sold Section */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(
            [
              "Properties sold",
              "Receipts",
              "Transactions",
              "Referrals",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery(""); // Reset search when switching tabs
                setReceiptsPage(1); // Reset pagination when switching tabs
                setTransactionsPage(1);
                setTransactionFilter("All");
              }}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                  : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        {(activeTab === "Properties sold" || activeTab === "Receipts") && (
          <div className="mb-6 flex items-center gap-3">
            <AdminSearchBar
              key={activeTab}
              onSearch={(query) => {
                setSearchQuery(query);
                if (activeTab === "Receipts") {
                  setReceiptsPage(1);
                }
              }}
              onFilterClick={() => console.log("Filter clicked")}
              className="flex-1"
              placeholder="Search"
            />
          </div>
        )}

        {/* Properties Grid */}
        {activeTab === "Properties sold" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Loading properties...
              </div>
            ) : filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <AdminPropertyCard
                  key={property.id}
                  image={property.image}
                  title={property.title}
                  price={property.price}
                  location={property.location}
                  isSoldOut={property.isSoldOut}
                  description={property.description}
                  onViewDetails={
                    onNavigateToPropertyDetails
                      ? () => onNavigateToPropertyDetails(property.id)
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {searchQuery
                  ? "No properties found matching your search"
                  : "No properties sold by this realtor"}
              </div>
            )}
          </div>
        )}

        {/* Receipts Table */}
        {activeTab === "Receipts" && (
          <>
            <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#F0F1F2]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Client name
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
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          Loading receipts...
                        </td>
                      </tr>
                    ) : currentReceipts.length > 0 ? (
                      currentReceipts.map((receipt) => (
                        <tr
                          key={receipt.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <p
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                setExpandedReceiptId((prev) =>
                                  prev === receipt.id ? null : receipt.id
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setExpandedReceiptId((prev) =>
                                    prev === receipt.id ? null : receipt.id
                                  );
                                }
                              }}
                              className={`block w-full cursor-pointer select-text ${
                                expandedReceiptId === receipt.id
                                  ? "break-all whitespace-normal"
                                  : "truncate whitespace-nowrap"
                              }`}
                              title={receipt.id}
                            >
                              {expandedReceiptId === receipt.id
                                ? receipt.id
                                : formatIdMiddle(receipt.id)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {receipt.clientName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {receipt.propertyName}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {receipt.amount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {receipt.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={receipt.status} />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                const original = receipts.find(
                                  (r) => r.id === receipt.id
                                );
                                if (!original) return;
                                const propertyName =
                                  original.property_id &&
                                  propertyMap.get(original.property_id)?.title
                                    ? propertyMap.get(original.property_id!)!
                                        .title
                                    : "-";
                                setSelectedReceipt({
                                  id: original.id,
                                  realtorName,
                                  clientName: original.client_name ?? "-",
                                  propertyName,
                                  amountPaid: Number(original.amount_paid) || 0,
                                  receiptUrls: Array.isArray(
                                    original.receipt_urls
                                  )
                                    ? original.receipt_urls
                                    : [],
                                  status: original.status,
                                  createdAt: original.created_at,
                                  rejectionReason:
                                    original.rejection_reason ?? null,
                                });
                              }}
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
                          {searchQuery
                            ? "No receipts found matching your search"
                            : "No receipts found for this realtor"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination for Receipts */}
            {receiptsTotalItems > 0 && (
              <div className="mt-6">
                <AdminPagination
                  totalItems={receiptsTotalItems}
                  itemsPerPage={receiptsPerPage}
                  currentPage={receiptsPage}
                  onPageChange={setReceiptsPage}
                />
              </div>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === "Transactions" && (
          <div className="space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Available Balance"
                value={transactionMetrics.availableBalance}
                icon={<TransactionsIcon color="#FFFFFF" className="w-5 h-5" />}
                iconBgColor="#6B7280"
                iconStrokeColor="#CFB0E5"
                textColor="#FFFFFF"
                variant="primary"
              />
              <MetricCard
                title="Total Earnings"
                value={transactionMetrics.totalEarnings}
                icon={<TransactionsIcon color="#6500AC" className="w-5 h-5" />}
                iconBgColor="#F0E6F7"
                iconStrokeColor="#CFB0E5"
              />
              <MetricCard
                title="Total Withdrawals"
                value={transactionMetrics.totalWithdrawals}
                icon={<TransactionsIcon color="#6B7280" className="w-5 h-5" />}
                iconBgColor="#F3F4F6"
                iconStrokeColor="#E5E7EB"
              />
              <MetricCard
                title="Total Pending"
                value={transactionMetrics.totalPending}
                icon={<TransactionsIcon color="#F59E0B" className="w-5 h-5" />}
                iconBgColor="#FEF3C7"
                iconStrokeColor="#FDE68A"
              />
            </div>

            {/* Filter + search */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 flex-wrap">
                {(["All", "Commission", "Withdrawals"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setTransactionFilter(filter)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                        transactionFilter === filter
                          ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                          : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
                      }`}
                    >
                      {filter === "All" ? "All transactions" : filter}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <AdminSearchBar
                  key="transactions-search"
                  onSearch={(query) => {
                    setSearchQuery(query);
                    setTransactionsPage(1);
                  }}
                  onFilterClick={() => console.log("Filter clicked")}
                  className="flex-1 lg:flex-initial"
                  placeholder="Search transactions"
                />
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#F0F1F2] bg-white">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.75 3.375H7.5V7.125H3.75V3.375ZM10.5 3.375H14.25V7.125H10.5V3.375ZM3.75 10.125H7.5V13.875H3.75V10.125ZM10.5 10.125H14.25V13.875H10.5V10.125Z"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#F0F1F2] bg-white">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.75 4.5H14.25M3.75 9H14.25M3.75 13.5H14.25"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#F0F1F2]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
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
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          Loading transactions...
                        </td>
                      </tr>
                    ) : currentTransactions.length > 0 ? (
                      currentTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <p
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                setExpandedTransactionId((prev) =>
                                  prev === transaction.id
                                    ? null
                                    : transaction.id
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setExpandedTransactionId((prev) =>
                                    prev === transaction.id
                                      ? null
                                      : transaction.id
                                  );
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
                            {transaction.type === "Commission"
                              ? "Commission Payment"
                              : "Withdrawal"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {transaction.amount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TransactionStatusBadge
                              status={transaction.status}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                if (transaction.type === "Commission") {
                                  const c = commissions.find(
                                    (row) => row.id === transaction.id
                                  );
                                  if (!c) return;
                                  setSelectedTransaction({
                                    id: c.id,
                                    realtorId: c.realtor_id,
                                    realtorName,
                                    type: "Commission",
                                    amount: formatNaira(c.amount),
                                    date: formatDate(c.created_at),
                                    status: statusToUi(c.status),
                                    dbStatus: normalizeDbStatus(c.status),
                                  });
                                  return;
                                }

                                const p = payouts.find(
                                  (row) => row.id === transaction.id
                                );
                                if (!p) return;
                                const bankName = extractString(
                                  p.bank_details,
                                  "bankName"
                                );
                                const accountNumber =
                                  extractString(p.bank_details, "accountNo") ??
                                  extractString(
                                    p.bank_details,
                                    "accountNumber"
                                  );
                                setSelectedTransaction({
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
                                });
                              }}
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
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          {searchQuery
                            ? "No transactions match your search"
                            : "No transactions found for this realtor"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {transactionsTotalItems > 0 && (
              <AdminPagination
                totalItems={transactionsTotalItems}
                itemsPerPage={transactionsPerPage}
                currentPage={transactionsPage}
                onPageChange={setTransactionsPage}
              />
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "Referrals" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
              <div className="bg-[#6500AC] text-white rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-white/80 truncate">
                    Realtors referral code
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-3xl font-semibold tracking-wide">
                    {realtorReferralCode}
                  </p>
                  <button
                    onClick={() => handleCopyValue(realtorReferralCode, "code")}
                    className="px-4 py-2 bg-white text-[#5E17EB] rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    {copyStatus === "code" ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-white/80">or</span>
                  <div className="flex flex-1 items-center gap-3 flex-wrap min-w-0">
                    <a
                      href={realtorReferralLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[200px] px-4 py-2 border border-white/30 rounded-2xl bg-white/5 text-sm text-white font-medium break-all hover:bg-white/10 transition-colors truncate"
                    >
                      {referralLinkDisplay}
                    </a>
                    <button
                      onClick={() =>
                        handleCopyValue(realtorReferralLink, "link")
                      }
                      className="px-4 py-2 bg-white text-[#5E17EB] rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors"
                    >
                      {copyStatus === "link" ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#F0F1F2] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F4F0FE] border border-[#E0D1FB] flex items-center justify-center">
                    <ReferralsIcon color="#6500AC" className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Referrals
                  </p>
                </div>
                <p className="text-4xl font-semibold text-gray-900">
                  {referralMetrics.count}
                </p>
                <p className="text-sm text-gray-500">
                  Commission earned{" "}
                  <span className="font-semibold text-gray-900">
                    {referralMetrics.totalCommission}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Showing {currentReferrals.length} of {referralMetrics.count}{" "}
                referrals
              </p>
              <AdminSearchBar
                key="referrals-search"
                onSearch={(query) => {
                  setSearchQuery(query);
                  setReferralsPage(1);
                }}
                onFilterClick={() => console.log("Filter clicked")}
                className="flex-1 md:flex-initial"
                placeholder="Search referrals"
              />
            </div>

            <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
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
                        Date joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total commission earned
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F2]">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          Loading referrals...
                        </td>
                      </tr>
                    ) : currentReferrals.length > 0 ? (
                      currentReferrals.map((referral) => (
                        <tr
                          key={referral.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <p
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                setExpandedReferralId((prev) =>
                                  prev === referral.id ? null : referral.id
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setExpandedReferralId((prev) =>
                                    prev === referral.id ? null : referral.id
                                  );
                                }
                              }}
                              className={`block w-full cursor-pointer select-text ${
                                expandedReferralId === referral.id
                                  ? "break-all whitespace-normal"
                                  : "truncate whitespace-nowrap"
                              }`}
                              title={referral.id}
                            >
                              {expandedReferralId === referral.id
                                ? referral.id
                                : formatIdMiddle(referral.id)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {referral.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {referral.dateJoined}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {referral.totalCommissionEarned ||
                              referral.totalReferralCommission}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="text-sm text-[#5E17EB] font-semibold hover:underline whitespace-nowrap"
                              onClick={() => {
                                const target = downlines.find(
                                  (d) => d.id === referral.id
                                );
                                if (!target) return;
                                onViewRealtor?.(target);
                              }}
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          {searchQuery
                            ? "No referrals match your search"
                            : "No referrals found for this realtor"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {referralsTotalItems > 0 && (
              <AdminPagination
                totalItems={referralsTotalItems}
                itemsPerPage={referralsPerPage}
                currentPage={referralsPage}
                onPageChange={setReferralsPage}
              />
            )}
          </div>
        )}
      </div>
      <KycReviewModal
        isOpen={isKycModalOpen}
        realtor={realtor}
        onClose={() => setIsKycModalOpen(false)}
        onUpdated={onRealtorUpdated}
      />
      <BankDetailsModal
        isOpen={isBankModalOpen}
        realtor={realtor}
        onClose={() => setIsBankModalOpen(false)}
      />
      <RemoveRealtorModal
        isOpen={isRemoveModalOpen}
        realtorName={realtorName}
        isRemoving={isRemoving}
        error={removeError}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
      />
      <AdminReceiptsDetailsModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
        onStatusUpdate={handleReceiptStatusUpdate}
      />

      <TransactionDetailsModal
        isOpen={
          !!selectedTransaction && selectedTransaction.type === "Commission"
        }
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onApprove={handleApproveCommission}
        onMarkAsPaid={handleMarkCommissionAsPaid}
        onReject={handleRejectCommission}
      />

      <WithdrawalDetailsModal
        isOpen={
          !!selectedTransaction && selectedTransaction.type === "Withdrawal"
        }
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onApprove={handleApprovePayout}
        onMarkAsPaid={handleMarkPayoutAsPaid}
        onReject={handleRejectPayout}
      />
    </div>
  );
};

export default RealtorDetailsSection;
