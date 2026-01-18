import React, { useEffect } from "react";
import { X, CreditCard } from "lucide-react";

interface TransactionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    title: string;
    amount: string;
    status: string;
    date: string;
    type: string;
  } | null;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-[#22C55E] bg-[#E9F9EF]";
      case "Approved":
        return "text-[#6500AC] bg-[#F0E6F7]";
      case "Pending":
        return "text-[#6B7280] bg-[#F5F5F5]";
      case "Failed":
        return "text-[#EF4444] bg-[#FDECEC]";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 font-poppins overflow-y-auto py-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-lg p-4 md:p-6 relative animate-fadeIn overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-[50px] md:h-[50px] flex items-center justify-center bg-[#F9F9F9] rounded-xl">
              <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-[#0A1B39]" />
            </div>
            <div>
              <h2 className="text-sm md:text-lg font-semibold text-[#0A1B39]">
                Transaction Details
              </h2>
              <p className="text-[10px] md:text-sm text-[#6B7280]">
                This contains the details of your transaction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Basic Details */}
          <div className="mb-4 md:mb-6">
            <p className="text-xs md:text-sm font-medium text-[#6B7280] mb-2 md:mb-3">
              Transaction Details
            </p>
            <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-xl p-2.5 md:p-4 space-y-2 md:space-y-3">
              <DetailRow label="Transaction ID" value={transaction.id} />
              <DetailRow label="Title" value={transaction.title} />
              <DetailRow label="Amount" value={transaction.amount} />
              <DetailRow label="Type" value={transaction.type} />
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-[#6B7280]">Status</span>
                <span
                  className={`px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${getStatusColor(
                    transaction.status
                  )}`}
                >
                  ● {transaction.status}
                </span>
              </div>
              <DetailRow label="Date" value={transaction.date} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between text-xs md:text-sm">
    <span className="text-[#6B7280]">{label}</span>
    <span className="text-[#0A1B39] font-medium">{value}</span>
  </div>
);

export default TransactionDetails;
