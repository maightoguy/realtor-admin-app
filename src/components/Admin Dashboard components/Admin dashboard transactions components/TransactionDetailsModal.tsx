import { useEffect } from "react";
import { X } from "lucide-react";
import type { Transaction } from "./AdminTransactionsData";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) => {
  // Prevent background scrolling when modal is open
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

  if (!isOpen || !transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-[#22C55E] bg-[#E9F9EF]";
      case "Pending":
        return "text-[#6B7280] bg-[#F5F5F5]";
      case "Rejected":
        return "text-[#EF4444] bg-[#FDECEC]";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
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
            <div className="flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_19885_8481)">
                    <path
                      d="M24 1.24023C24 0.975018 23.8946 0.720664 23.7071 0.533128C23.5196 0.345591 23.2652 0.240234 23 0.240234H10.58C9.22 0.240234 8.58 1.51023 8.58 2.71023C8.58839 7.15506 8.29438 11.5953 7.7 16.0002C7.69071 16.0577 7.66165 16.1101 7.61783 16.1485C7.57402 16.1868 7.5182 16.2087 7.46 16.2102H4.46C2.46 16.2102 2.24 18.2802 2.12 19.5102C2 21.4802 1.73 21.7502 1 21.7502C0.734784 21.7502 0.48043 21.8556 0.292893 22.0431C0.105357 22.2307 0 22.485 0 22.7502C0 23.0155 0.105357 23.2698 0.292893 23.4573C0.48043 23.6449 0.734784 23.7502 1 23.7502H12.5C14.88 23.7502 15.22 21.3902 15.42 19.9902C15.59 18.8102 15.72 18.2502 16 18.2502H16.41C16.4628 18.2496 16.5145 18.2657 16.5576 18.2962C16.6008 18.3268 16.6331 18.3702 16.65 18.4202C16.71 18.6102 16.77 18.8702 16.81 19.0602C17.01 20.0002 17.37 21.7502 19.5 21.7502C23.57 21.7502 24 10.2102 24 5.27023V1.24023ZM12.06 13.5002C11.8611 13.5002 11.6703 13.4212 11.5297 13.2806C11.389 13.1399 11.31 12.9491 11.31 12.7502C11.31 12.5513 11.389 12.3606 11.5297 12.2199C11.6703 12.0793 11.8611 12.0002 12.06 12.0002H18.06C18.2589 12.0002 18.4497 12.0793 18.5903 12.2199C18.731 12.3606 18.81 12.5513 18.81 12.7502C18.81 12.9491 18.731 13.1399 18.5903 13.2806C18.4497 13.4212 18.2589 13.5002 18.06 13.5002H12.06ZM11.81 4.75023C11.81 4.55132 11.889 4.36056 12.0297 4.2199C12.1703 4.07925 12.3611 4.00023 12.56 4.00023H14.56C14.7589 4.00023 14.9497 4.07925 15.0903 4.2199C15.231 4.36056 15.31 4.55132 15.31 4.75023C15.31 4.94915 15.231 5.13991 15.0903 5.28056C14.9497 5.42122 14.7589 5.50023 14.56 5.50023H12.56C12.3611 5.50023 12.1703 5.42122 12.0297 5.28056C11.889 5.13991 11.81 4.94915 11.81 4.75023ZM18.56 9.50023H12.81C12.6111 9.50023 12.4203 9.42122 12.2797 9.28056C12.139 9.13991 12.06 8.94915 12.06 8.75023C12.06 8.55132 12.139 8.36056 12.2797 8.2199C12.4203 8.07925 12.6111 8.00023 12.81 8.00023H18.56C18.7589 8.00023 18.9497 8.07925 19.0903 8.2199C19.231 8.36056 19.31 8.55132 19.31 8.75023C19.31 8.94915 19.231 9.13991 19.0903 9.28056C18.9497 9.42122 18.7589 9.50023 18.56 9.50023ZM13.43 19.7002C13.18 21.4702 12.98 21.7502 12.49 21.7502H4.11C4.07158 21.7482 4.03399 21.7383 3.99958 21.7211C3.96517 21.7039 3.93468 21.6797 3.91 21.6502C3.8954 21.6172 3.88786 21.5814 3.88786 21.5452C3.88786 21.5091 3.8954 21.4733 3.91 21.4402C4.04673 20.8854 4.13704 20.3201 4.18 19.7502C4.19028 19.2415 4.2849 18.738 4.46 18.2602H13.46C13.4977 18.2606 13.5348 18.2696 13.5686 18.2864C13.6024 18.3031 13.6319 18.3274 13.655 18.3572C13.6781 18.387 13.6941 18.4217 13.7019 18.4585C13.7097 18.4954 13.7091 18.5336 13.7 18.5702C13.54 19.0002 13.48 19.3502 13.43 19.7002Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_19885_8481">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Transaction details
                </h2>
                <p className="text-sm text-gray-600">
                  This contains the details of this request.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Basic Details */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Basic Details
              </p>
              <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-xl p-4 space-y-3">
                <DetailRow label="Transaction ID" value={transaction.id} />
                <DetailRow
                  label="Realtor name"
                  value={transaction.realtorName}
                />
                <DetailRow label="Type" value={transaction.type} />
                <DetailRow label="Amount" value={transaction.amount} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    • {transaction.status}
                  </span>
                </div>
                <DetailRow label="Date" value={transaction.date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
);

export default TransactionDetailsModal;
