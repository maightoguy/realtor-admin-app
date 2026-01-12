/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import SwitchAccountModal from "./SwitchAccountModal";
import BankDetailsModal from "../BankDetailsModal";
import { transactionService } from "../../../services/transactionService";
import { userService } from "../../../services/apiService";
import { useUser } from "../../../context/UserContext";
import { logger } from "../../../utils/logger";

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: string;
  currentBalanceAmount: number;
  realtorId: string;
  onSuccess?: () => void | Promise<void>;
}

interface Account {
  bankName: string;
  accountNo: string;
  accountName: string;
}

const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  currentBalanceAmount,
  realtorId,
  onSuccess,
}) => {
  const { user, refreshUser } = useUser();
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  // Default empty state, will be populated from user details
  const [selectedAccount, setSelectedAccount] = useState<Account>({
    bankName: "",
    accountNo: "",
    accountName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accounts = useMemo<Account[]>(() => {
    if (user?.bank_details && Array.isArray(user.bank_details)) {
      return user.bank_details.map((d: any) => ({
        bankName: d.bankName,
        accountNo: d.accountNo,
        accountName: d.accountName,
      }));
    }
    return [];
  }, [user?.bank_details]);

  // Set initial selected account from user profile
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount.accountNo) {
      setSelectedAccount(accounts[0]);
    } else if (accounts.length > 0 && selectedAccount.accountNo) {
      // Check if selected account is still in list, if not revert to primary?
      // Or just leave it.
    }
  }, [accounts, selectedAccount.accountNo]);

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

  const handleSubmit = async () => {
    if (!realtorId) {
      window.alert("Unable to request payout. Please sign in again.");
      return;
    }

    if (user?.kyc_status !== "approved") {
      window.alert(
        "You must complete KYC verification before requesting a payout."
      );
      return;
    }

    const parsedAmount = Number(withdrawalAmount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      window.alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (parsedAmount > currentBalanceAmount) {
      window.alert("Withdrawal amount exceeds your current balance.");
      return;
    }

    try {
      setIsSubmitting(true);
      await transactionService.requestPayout({
        realtorId,
        amount: parsedAmount,
        bankDetails: selectedAccount as unknown as Record<string, unknown>,
      });
      window.dispatchEvent(new Event("wallet:refresh"));
      await onSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit payout request.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsSwitchAccountOpen(false);
  };

  const handleOpenAddAccount = () => {
    setIsSwitchAccountOpen(false);
    setIsBankModalOpen(true);
  };

  const handleAddBankAccount = async (bankData: {
    bankName: string;
    accountNo: string;
    accountName: string;
  }) => {
    if (!user) {
      logger.error("Cannot add bank account: No user found");
      return;
    }

    try {
      logger.info("Adding bank account...", bankData);

      // Update via service
      await userService.updateBankDetails(user.id, bankData);

      // Refresh user context to update UI
      await refreshUser();

      // Automatically select the newly added account
      setSelectedAccount({
        bankName: bankData.bankName,
        accountNo: bankData.accountNo,
        accountName: bankData.accountName,
      });

      setIsBankModalOpen(false);
      logger.info("Bank account added successfully");
    } catch (error) {
      logger.error("Failed to add bank account:", error);
      window.alert("Failed to add bank account. Please try again.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 font-poppins overflow-y-auto py-4">
        <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-lg p-4 md:p-6 relative animate-fadeIn overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-[50px] md:h-[50px] flex items-center justify-center bg-[#F9F9F9] rounded-xl">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 7.5C11.4033 7.5 10.831 7.73705 10.409 8.15901C9.98705 8.58097 9.75 9.15326 9.75 9.75C9.75 10.3467 9.98705 10.919 10.409 11.341C10.831 11.7629 11.4033 12 12 12C12.5967 12 13.169 11.7629 13.591 11.341C14.0129 10.919 14.25 10.3467 14.25 9.75C14.25 9.15326 14.0129 8.58097 13.591 8.15901C13.169 7.73705 12.5967 7.5 12 7.5Z"
                    fill="black"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3H20.625C21.66 3 22.5 3.84 22.5 4.875V14.625C22.5 15.661 21.66 16.5 20.625 16.5H3.375C3.12877 16.5 2.88495 16.4515 2.65747 16.3573C2.42998 16.263 2.22328 16.1249 2.04917 15.9508C1.87506 15.7767 1.73695 15.57 1.64273 15.3425C1.5485 15.115 1.5 14.8712 1.5 14.625V4.875ZM8.25 9.75C8.25 8.75544 8.64509 7.80161 9.34835 7.09835C10.0516 6.39509 11.0054 6 12 6C12.9946 6 13.9484 6.39509 14.6517 7.09835C15.3549 7.80161 15.75 8.75544 15.75 9.75C15.75 10.7446 15.3549 11.6984 14.6517 12.4017C13.9484 13.1049 12.9946 13.5 12 13.5C11.0054 13.5 10.0516 13.1049 9.34835 12.4017C8.64509 11.6984 8.25 10.7446 8.25 9.75ZM18.75 9C18.5511 9 18.3603 9.07902 18.2197 9.21967C18.079 9.36032 18 9.55109 18 9.75V9.758C18 10.172 18.336 10.508 18.75 10.508H18.758C18.9569 10.508 19.1477 10.429 19.2883 10.2883C19.429 10.1477 19.508 9.95691 19.508 9.758V9.75C19.508 9.55109 19.429 9.36032 19.2883 9.21967C19.1477 9.07902 18.9569 9 18.758 9H18.75ZM4.5 9.75C4.5 9.55109 4.57902 9.36032 4.71967 9.21967C4.86032 9.07902 5.05109 9 5.25 9H5.258C5.45691 9 5.64768 9.07902 5.78833 9.21967C5.92898 9.36032 6.008 9.55109 6.008 9.75V9.758C6.008 9.95691 5.92898 10.1477 5.78833 10.2883C5.64768 10.429 5.45691 10.508 5.258 10.508H5.25C5.05109 10.508 4.86032 10.429 4.71967 10.2883C4.57902 10.1477 4.5 9.95691 4.5 9.758V9.75Z"
                    fill="black"
                  />
                  <path
                    d="M2.25 18C2.05109 18 1.86032 18.079 1.71967 18.2197C1.57902 18.3603 1.5 18.5511 1.5 18.75C1.5 18.9489 1.57902 19.1397 1.71967 19.2803C1.86032 19.421 2.05109 19.5 2.25 19.5C7.65 19.5 12.88 20.222 17.85 21.575C19.04 21.899 20.25 21.017 20.25 19.755V18.75C20.25 18.5511 20.171 18.3603 20.0303 18.2197C19.8897 18.079 19.6989 18 19.5 18H2.25Z"
                    fill="black"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#0A1B39]">
                  Request payout
                </h2>
                <p className="text-xs md:text-sm text-[#6B7280]">
                  you are about to make withdrawal from your wallet.
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

          {/* Bank Details Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <p className="text-xs md:text-sm font-medium text-[#6B7280]">
                Bank details
              </p>
              <button
                onClick={() => setIsSwitchAccountOpen(true)}
                className="text-[#6500AC] text-xs md:text-sm font-medium hover:underline"
              >
                Switch account
              </button>
            </div>
            <div className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-xl p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-[#6B7280]">Bank name</span>
                <span className="text-[#0A1B39] font-medium text-right">
                  {selectedAccount.bankName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-[#6B7280]">Account no:</span>
                <span className="text-[#0A1B39] font-medium text-right">
                  {selectedAccount.accountNo}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-[#6B7280]">Account name:</span>
                <span className="text-[#0A1B39] font-medium text-right">
                  {selectedAccount.accountName}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <p className="text-xs md:text-sm font-medium text-[#6B7280]">
                Amount
              </p>
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#E9F9EF] text-[#22C55E] text-xs md:text-sm font-medium rounded-full">
                Balance: {currentBalance}
              </span>
            </div>
            <div className="border border-[#F0F1F2] bg-white rounded-xl p-3 md:p-4">
              <input
                type="text"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="How much do you want to withdraw"
                className="w-full text-base md:text-lg font-medium text-[#0A1B39] placeholder-[#9CA3AF] border-none outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 md:px-6 md:py-4 border border-[#D1D5DB] text-[#374151] text-sm md:text-base font-medium rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] md:min-h-[48px] flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-[#6500AC] text-white text-sm md:text-base font-medium rounded-lg hover:bg-[#5E17EB] transition-colors min-h-[40px] md:min-h-[48px] flex items-center justify-center"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </div>
      </div>

      {/* SwitchAccountModal */}
      <SwitchAccountModal
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
        onSelectAccount={handleSwitchAccount}
        onAddNewAccount={handleOpenAddAccount}
        currentAccount={selectedAccount}
        accounts={accounts}
      />

      {/* BankDetailsModal */}
      <BankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onAddBankAccount={handleAddBankAccount}
      />
    </>
  );
};

export default RequestPayoutModal;
