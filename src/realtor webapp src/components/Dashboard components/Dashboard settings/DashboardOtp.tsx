import React, { useState } from "react";
import { X } from "lucide-react";

interface DashboardOtpProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  email: string;
}

const DashboardOtp: React.FC<DashboardOtpProps> = ({
  isOpen,
  onClose,
  onConfirm,
  email,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setIsSending(true);
    try {
      await onConfirm();
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <h3 className="text-lg font-semibold text-[#0A1B39]">
            Email confirmation
          </h3>
          <button
            onClick={onClose}
            className="text-[#9CA1AA] hover:text-[#667085] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-[#667085] text-sm">
              We will send a confirmation link to{" "}
              <span className="font-semibold text-[#0A1B39]">{email}</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {sent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                Confirmation email sent. Please check your inbox.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-[#EAECF0]">
          <button
            onClick={onClose}
            className="sm:w-full sm:flex-1 px-4 py-2 border border-[#E6E7EC] text-[#667085] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || sent}
            className={`sm:w-full sm:flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isSending || sent
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#6500AC] text-white hover:bg-[#5C009D]"
            }`}
          >
            {sent ? "Email sent" : isSending ? "Sending..." : "Send email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOtp;
