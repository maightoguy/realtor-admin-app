import React, { useEffect } from "react";
import { X, CreditCard } from "lucide-react";

interface Account {
  bankName: string;
  accountNo: string;
  accountName: string;
}

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: Account) => void;
  onAddNewAccount?: () => void;
  currentAccount: Account;
  accounts: Account[];
}

const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  onAddNewAccount,
  currentAccount,
  accounts,
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

  if (!isOpen) return null;

  const handleAccountSelect = (account: Account) => {
    onSelectAccount(account);
  };

  const handleAddNewAccount = () => {
    if (onAddNewAccount) {
      onAddNewAccount();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4 font-poppins overflow-y-auto py-4">
        <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-lg p-4 md:p-6 relative animate-fadeIn overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-[50px] md:h-[50px] flex items-center justify-center bg-[#F9F9F9] rounded-xl">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-[#0A1B39]" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#0A1B39]">
                  Switch account
                </h2>
                <p className="text-xs md:text-sm text-[#6B7280]">
                  Which account do you want to use for withdrawals
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

          {/* Add New Account Link */}
          <div className="mb-4 md:mb-6">
            <button
              onClick={handleAddNewAccount}
              className="text-[#6500AC] text-xs md:text-sm font-medium hover:underline"
            >
              + Add new account
            </button>
          </div>

          {/* Account List */}
          <div className="flex-1 overflow-y-auto mb-4 md:mb-6">
            <div className="space-y-2 md:space-y-3">
              {accounts.map((account, index) => {
                const isSelected =
                  account.bankName === currentAccount.bankName &&
                  account.accountNo === currentAccount.accountNo;

                return (
                  <div
                    key={index}
                    onClick={() => handleAccountSelect(account)}
                    className={`border rounded-xl p-3 md:p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#CFB0E5] bg-[#F0E6F7]"
                        : "border-[#E9EAEB] bg-white hover:border-[#CFB0E5] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-[#6B7280]">Bank name</span>
                        <span className="text-[#0A1B39] font-medium">
                          {account.bankName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-[#6B7280]">Account no:</span>
                        <span className="text-[#0A1B39] font-medium">
                          {account.accountNo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-[#6B7280]">Account name:</span>
                        <span className="text-[#0A1B39] font-medium">
                          {account.accountName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 md:px-6 md:py-4 border border-[#D1D5DB] text-[#374151] font-medium rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] md:min-h-[48px] flex items-center justify-center text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-[#6500AC] text-white font-medium rounded-lg hover:bg-[#5E17EB] transition-colors min-h-[40px] md:min-h-[48px] flex items-center justify-center text-sm md:text-base"
            >
              Use account
            </button>
          </div>
        </div>
      </div>
  );
};

export default SwitchAccountModal;
