import React, { useEffect } from "react";
import { X, FileText, Download } from "lucide-react";

interface ReceiptDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  // This interface now matches the data object being passed from the parent
  receipt: {
    id: string;
    clientName: string;
    propertyName: string;
    amount: string; // Formatted currency string
    status: string; // Formatted status string
    date: string; // Formatted date string
    receipt_urls?: string[]; // Supabase URLs
    rejection_reason?: string | null;
  } | null;
}

const DashboardReceiptDetails: React.FC<ReceiptDetailsProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
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

  if (!isOpen || !receipt) return null;

  // Restoring your original status color logic
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("approved")) return "text-[#22C55E] bg-[#E9F9EF]";
    if (s.includes("rejected")) return "text-[#EF4444] bg-[#FDECEC]";
    if (s.includes("review")) return "text-[#F59E0B] bg-[#FFF7ED]";
    return "text-[#6B7280] bg-[#F3F4F6]"; // Default/Pending
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[480px] bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Restored to Original Design */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-[#101828]">
            Receipt details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#667085]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto">
          {/* Receipt Info Card - Original Purple Design */}
          <div className=" flex flex-col items-start gap-2 mb-5">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_19548_4474)">
                  <path
                    d="M24 1.23999C24 0.974774 23.8946 0.72042 23.7071 0.532883C23.5196 0.345347 23.2652 0.23999 23 0.23999H10.58C9.22 0.23999 8.58 1.50999 8.58 2.70999C8.58839 7.15482 8.29438 11.5951 7.7 16C7.69071 16.0575 7.66165 16.1099 7.61783 16.1482C7.57402 16.1866 7.5182 16.2084 7.46 16.21H4.46C2.46 16.21 2.24 18.28 2.12 19.51C2 21.48 1.73 21.75 1 21.75C0.734784 21.75 0.48043 21.8553 0.292893 22.0429C0.105357 22.2304 0 22.4848 0 22.75C0 23.0152 0.105357 23.2696 0.292893 23.4571C0.48043 23.6446 0.734784 23.75 1 23.75H12.5C14.88 23.75 15.22 21.39 15.42 19.99C15.59 18.81 15.72 18.25 16 18.25H16.41C16.4628 18.2493 16.5145 18.2654 16.5576 18.296C16.6008 18.3265 16.6331 18.3699 16.65 18.42C16.71 18.61 16.77 18.87 16.81 19.06C17.01 20 17.37 21.75 19.5 21.75C23.57 21.75 24 10.21 24 5.26999V1.23999ZM12.06 13.5C11.8611 13.5 11.6703 13.421 11.5297 13.2803C11.389 13.1397 11.31 12.9489 11.31 12.75C11.31 12.5511 11.389 12.3603 11.5297 12.2197C11.6703 12.079 11.8611 12 12.06 12H18.06C18.2589 12 18.4497 12.079 18.5903 12.2197C18.731 12.3603 18.81 12.5511 18.81 12.75C18.81 12.9489 18.731 13.1397 18.5903 13.2803C18.4497 13.421 18.2589 13.5 18.06 13.5H12.06ZM11.81 4.74999C11.81 4.55108 11.889 4.36031 12.0297 4.21966C12.1703 4.07901 12.3611 3.99999 12.56 3.99999H14.56C14.7589 3.99999 14.9497 4.07901 15.0903 4.21966C15.231 4.36031 15.31 4.55108 15.31 4.74999C15.31 4.9489 15.231 5.13967 15.0903 5.28032C14.9497 5.42097 14.7589 5.49999 14.56 5.49999H12.56C12.3611 5.49999 12.1703 5.42097 12.0297 5.28032C11.889 5.13967 11.81 4.9489 11.81 4.74999ZM18.56 9.49999H12.81C12.6111 9.49999 12.4203 9.42097 12.2797 9.28032C12.139 9.13967 12.06 8.9489 12.06 8.74999C12.06 8.55108 12.139 8.36031 12.2797 8.21966C12.4203 8.07901 12.6111 7.99999 12.81 7.99999H18.56C18.7589 7.99999 18.9497 8.07901 19.0903 8.21966C19.231 8.36031 19.31 8.55108 19.31 8.74999C19.31 8.9489 19.231 9.13967 19.0903 9.28032C18.9497 9.42097 18.7589 9.49999 18.56 9.49999ZM13.43 19.7C13.18 21.47 12.98 21.75 12.49 21.75H4.11C4.07158 21.748 4.03399 21.738 3.99958 21.7208C3.96517 21.7036 3.93468 21.6795 3.91 21.65C3.8954 21.6169 3.88786 21.5812 3.88786 21.545C3.88786 21.5088 3.8954 21.4731 3.91 21.44C4.04673 20.8851 4.13704 20.3198 4.18 19.75C4.19028 19.2413 4.2849 18.7378 4.46 18.26H13.46C13.4977 18.2604 13.5348 18.2693 13.5686 18.2861C13.6024 18.3029 13.6319 18.3271 13.655 18.3569C13.6781 18.3868 13.6941 18.4214 13.7019 18.4583C13.7097 18.4952 13.7091 18.5334 13.7 18.57C13.54 19 13.48 19.35 13.43 19.7Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_19548_4474">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold text-[#101828] break-all">
                This contains the details of the receipt
              </p>
            </div>
          </div>

          {/* Details Grid - Restored Spacing */}
          <div className="space-y-2 md:space-y-3">
            <DetailRow label="Receipt ID" value={receipt.id} wrapValue />
            <DetailRow label="Client name" value={receipt.clientName} />
            <DetailRow label="Property name" value={receipt.propertyName} />
            <DetailRow label="Amount paid" value={receipt.amount} />

            <div className="flex justify-between items-center py-1">
              <span className="text-[#6B7280] text-xs md:text-sm font-medium">Status</span>
              <span
                className={`px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold rounded-full flex items-center gap-1.5 ${getStatusColor(
                  receipt.status
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {receipt.status}
              </span>
            </div>

            <DetailRow label="Date uploaded" value={receipt.date} />

            {receipt.rejection_reason && (
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280] text-xs md:text-sm font-medium">
                  Rejection Reason
                </span>
                <p className="text-xs md:text-sm text-red-600 bg-red-50 p-2 md:p-3 rounded-lg border border-red-100">
                  {receipt.rejection_reason}
                </p>
              </div>
            )}

            {/* Restored Supabase File Link Section */}
            {receipt.receipt_urls && receipt.receipt_urls.length > 0 && (
              <div className="pt-3 md:pt-4 border-t border-[#F3F4F6]">
                <p className="text-[#6B7280] text-xs md:text-sm font-medium mb-2 md:mb-3">
                  Attached Receipt
                </p>
                <a
                  href={receipt.receipt_urls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 md:p-3 border border-[#E9EAEB] rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#6B7280]" />
                    <span className="text-xs md:text-sm font-medium text-[#344054]">
                      receipt_document.pdf
                    </span>
                  </div>
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6B7280] group-hover:text-[#6500AC]" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Restored to Original Design */}
        <div className="p-3 md:p-6 border-t border-[#F3F4F6] bg-gray-50/50">
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 md:px-4 md:py-2.5 border border-[#D0D5DD] bg-white text-[#344054] text-xs md:text-base font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Close
            </button>
            {receipt.status.toLowerCase().includes("rejected") && (
              <button className="flex-1 px-3 py-2 md:px-4 md:py-2.5 bg-[#6500AC] text-white text-xs md:text-base font-semibold rounded-lg hover:bg-[#5E17EB] transition-colors shadow-sm">
                Re-upload Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Helper for rows to keep UI clean
const DetailRow = ({
  label,
  value,
  wrapValue = false,
}: {
  label: string;
  value: string;
  wrapValue?: boolean;
}) => (
  <div
    className={`flex justify-between ${
      wrapValue ? "items-start" : "items-center"
    }`}
  >
    <span className="text-[#6B7280] text-xs md:text-sm font-medium shrink-0 mr-2">
      {label}
    </span>
    <span
      className={`text-[#101828] text-xs md:text-sm font-semibold text-right ${
        wrapValue ? "break-all" : "max-w-[200px] truncate"
      }`}
    >
      {value}
    </span>
  </div>
);

export default DashboardReceiptDetails;
