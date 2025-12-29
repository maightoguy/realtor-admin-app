import { useState, useEffect, useRef } from "react";
import { X, ChevronUp, Download } from "lucide-react";
import ReceiptsIcon from "../../icons/ReceiptsIcon";
import type { ReceiptStatus } from "../../../services/types";

interface AdminReceiptsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    id: string;
    realtorName: string;
    clientName: string;
    propertyName: string;
    amountPaid: number;
    receiptUrls: string[];
    status: ReceiptStatus;
    createdAt: string;
    rejectionReason: string | null;
  } | null;
  onStatusUpdate?: (
    receiptId: string,
    newStatus: ReceiptStatus,
    rejectionReason?: string
  ) => void;
}

const AdminReceiptsDetailsModal = ({
  isOpen,
  onClose,
  receipt,
  onStatusUpdate,
}: AdminReceiptsDetailsModalProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "approve" | "reject" | "under review" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Reset states when modal opens/closes or receipt changes
  useEffect(() => {
    if (!isOpen) {
      setShowDropdown(false);
      setSelectedAction(null);
      setRejectionReason("");
    }
  }, [isOpen, receipt]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  if (!isOpen || !receipt) return null;

  const handleActionSelect = (
    action: "approve" | "reject" | "under review"
  ) => {
    setSelectedAction(action);
    setShowDropdown(false);
    if (action !== "reject") {
      setRejectionReason("");
    }
  };

  const handleUpdateProgress = () => {
    if (selectedAction === "reject" && !rejectionReason.trim()) {
      return; // Don't allow rejection without reason
    }

    let newStatus: ReceiptStatus;
    if (selectedAction === "approve") {
      newStatus = "approved";
    } else if (selectedAction === "reject") {
      newStatus = "rejected";
    } else {
      newStatus = "under_review";
    }

    onStatusUpdate?.(receipt.id, newStatus, rejectionReason || undefined);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return; // Don't allow rejection without reason
    }

    onStatusUpdate?.(receipt.id, "rejected", rejectionReason);
    onClose();
  };

  const canShowUpdateButton =
    receipt.status === "pending" || receipt.status === "under_review";
  const showRejectButton = selectedAction === "reject";
  const showRejectionReasonField =
    receipt.status === "rejected" || showRejectButton;

  const rejectionReasonFromReceipt = receipt.rejectionReason ?? "";

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-[#F0F1F2]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <ReceiptsIcon color="#000000" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Receipt Details
                </h2>
                <p className="text-sm text-gray-600">
                  This contains the details of this receipt.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Basic Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Basic Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Receipt ID:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {`#${receipt.id.slice(0, 6)}`}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Realtor's name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {receipt.realtorName}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Client name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {receipt.clientName}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Property name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {receipt.propertyName}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Amount paid:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNaira(receipt.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={receipt.status} />
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Date uploaded:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(receipt.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Action Options (only for Pending/Under review) */}
            {canShowUpdateButton && !showRejectButton && (
              <div className="space-y-3">
                {selectedAction === null && (
                  <>
                    <div
                      className="p-4 rounded-lg border border-[#F0E6F7] bg-[#F0E6F7]/30 cursor-pointer hover:bg-[#F0E6F7]/50 transition-colors"
                      onClick={() => handleActionSelect("under review")}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#6500AC]"></span>
                        <span className="text-sm font-semibold text-gray-900">
                          Under review
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        This would let the Realtor know that this receipt is now
                        under review
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/30 cursor-pointer hover:bg-[#D1FAE5]/50 transition-colors"
                      onClick={() => handleActionSelect("approve")}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span className="text-sm font-semibold text-gray-900">
                          Approve Receipt
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        This would approve this receipt and update the Realtor
                        and reflect commission
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg border border-[#FEE2E2] bg-[#FEE2E2]/30 cursor-pointer hover:bg-[#FEE2E2]/50 transition-colors"
                      onClick={() => handleActionSelect("reject")}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                        <span className="text-sm font-semibold text-gray-900">
                          Reject Receipt
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        This would reject this receipt & update the Realtor with
                        your reason
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Rejection Reason Field */}
            {showRejectionReasonField && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason for rejection:
                </label>
                {receipt.status === "rejected" ? (
                  <div className="p-4 bg-gray-50 border border-[#F0F1F2] rounded-lg">
                    <p className="text-sm text-gray-700">
                      {rejectionReasonFromReceipt || "-"}
                    </p>
                  </div>
                ) : (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter your reason for rejecting this receipt"
                    className="w-full p-4 border border-[#F0F1F2] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
                    rows={5}
                  />
                )}
              </div>
            )}

            {/* Attached Documents */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Attached Documents
              </h3>
              <div className="space-y-3">
                {receipt.receiptUrls.length > 0 ? (
                  receipt.receiptUrls.map((url, idx) => {
                    const filename = (() => {
                      try {
                        const u = new URL(url);
                        const parts = u.pathname.split("/").filter(Boolean);
                        return parts[parts.length - 1] ?? `Receipt ${idx + 1}`;
                      } catch {
                        const parts = url.split("/").filter(Boolean);
                        return parts[parts.length - 1] ?? `Receipt ${idx + 1}`;
                      }
                    })();

                    return (
                      <div
                        key={`${url}-${idx}`}
                        className="flex items-center justify-between p-3 border border-[#F0F1F2] rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                            <ReceiptsIcon color="#EF4444" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {filename}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {url}
                            </p>
                          </div>
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Download className="w-5 h-5 text-gray-600" />
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 border border-[#F0F1F2] rounded-lg text-sm text-gray-600">
                    No receipt files attached
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          {canShowUpdateButton && (
            <div className="p-6 border-t border-[#F0F1F2] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {showRejectButton ? "Go back" : "Cancel"}
              </button>
              {showRejectButton ? (
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-colors ${
                    rejectionReason.trim()
                      ? "bg-[#EF4444] hover:bg-[#DC2626]"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Reject
                </button>
              ) : (
                <div className="flex-1 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-3 bg-[#6500AC] text-white rounded-lg text-sm font-semibold hover:bg-[#4D14C7] transition-colors flex items-center justify-center gap-2"
                  >
                    Update progress
                    <ChevronUp
                      className={`w-4 h-4 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#F0F1F2] rounded-lg shadow-lg overflow-hidden z-20">
                      <button
                        onClick={() => handleActionSelect("approve")}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionSelect("reject")}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                        Reject
                      </button>
                      <button
                        onClick={() => handleActionSelect("under review")}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#6500AC]"></span>
                        Under review
                      </button>
                    </div>
                  )}
                  {selectedAction &&
                    (selectedAction === "approve" ||
                      selectedAction === "under review") && (
                      <button
                        onClick={handleUpdateProgress}
                        className="w-full mt-2 px-4 py-3 bg-[#6500AC] hover:bg-[#4D14C7] text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Update progress
                      </button>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Status Badge component
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

  const config = statusConfig[status];

  return (
    <span
      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md"
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

export default AdminReceiptsDetailsModal;
