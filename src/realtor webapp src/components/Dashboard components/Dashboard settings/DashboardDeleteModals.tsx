import React from "react";
import { X, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface FinalDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface DeleteBankAccountConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  } | null;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <div className="flex flex-col items-start gap-3">
            <div className="w-8 h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1B39]">
              Delete account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA1AA] hover:text-[#667085] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-[#667085] text-sm leading-relaxed">
            You are about to start the initiation of deleting your account from
            the Veriplot database, doing this would automatically means you
            would loose access to:
          </p>

          <ul className="space-y-2 text-[#667085] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>
                All your personal information and data you've shared with the
                company
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>All your funds available on this platform.</span>
            </li>
          </ul>

          <p className="text-[#667085] text-sm leading-relaxed">
            Note that this action cannot be reversed and Veriplot won't be held
            liable for this action. By clicking on Proceed you agree to this.
          </p>
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
            onClick={onConfirm}
            className="sm:w-full sm:flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
          >
            Proceed to delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeleteBankAccountConfirmationModal: React.FC<
  DeleteBankAccountConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, bankAccount }) => {
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
              Delete bank account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA1AA] hover:text-[#667085] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[#667085] text-sm leading-relaxed">
            You are about to delete this bank account from your Veriplot
            profile.
          </p>

          {bankAccount ? (
            <ul className="space-y-2 text-[#667085] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] mt-1">•</span>
                <span>Account name: {bankAccount.accountName}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] mt-1">•</span>
                <span>Account number: {bankAccount.accountNumber}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] mt-1">•</span>
                <span>Bank name: {bankAccount.bankName}</span>
              </li>
            </ul>
          ) : null}

          <p className="text-[#667085] text-sm leading-relaxed">
            Note that this action cannot be reversed and Veriplot won't be held
            liable for this action. By clicking on Proceed you agree to this.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-[#EAECF0]">
          <button
            onClick={onClose}
            className="sm:w-full sm:flex-1 px-4 py-2 border border-[#E6E7EC] text-[#667085] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="sm:w-full sm:flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
          >
            Proceed to delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const FinalDeleteConfirmationModal: React.FC<
  FinalDeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <div className="flex flex-col items-start gap-3">
            <div className="w-8 h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1B39]">
              Delete account ~ final confirmation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA1AA] hover:text-[#667085] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-[#667085] text-sm leading-relaxed">
            You are about to start the initiation of deleting your account from
            the Veriplot database, doing this would automatically means you
            would loose access to:
          </p>

          <ul className="space-y-2 text-[#667085] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>
                All your personal information and data you've shared with the
                company
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>All your funds available on this platform.</span>
            </li>
          </ul>

          <p className="text-[#667085] text-sm leading-relaxed">
            Note that this action cannot be reversed and Veriplot won't be held
            liable for this action. By clicking on Proceed you agree to this.
          </p>
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
            onClick={onConfirm}
            className="sm:w-full sm:flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};
