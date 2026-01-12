/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import BankDetailsModal from "../BankDetailsModal";
import Pagination from "../Pagination";
import { useUser } from "../../../context/UserContext";
import { userService } from "../../../services/apiService";
import { logger } from "../../../utils/logger";
import plugicon from "../../../assets/Empty State.png";
import { DeleteBankAccountConfirmationModal } from "./DashboardDeleteModals";

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  dateAdded: string;
}

const DashboardSettingsBankingTab = () => {
  const { user, refreshUser } = useUser();
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDeleteBankAccountModal, setShowDeleteBankAccountModal] =
    useState(false);
  const [pendingDeleteBankAccount, setPendingDeleteBankAccount] =
    useState<BankAccount | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 bank accounts per page

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Sync bank details from user profile
  useEffect(() => {
    if (user?.bank_details && Array.isArray(user.bank_details)) {
      const mappedAccounts: BankAccount[] = user.bank_details.map(
        (detail: any, index: number) => ({
          id: `bank-${index}`, // Generate a stable-ish ID
          accountName: detail.accountName || "",
          accountNumber: detail.accountNo || "",
          bankName: detail.bankName || "",
          dateAdded: detail.created_at
            ? formatDate(detail.created_at)
            : detail.dateAdded || "Recently",
        })
      );
      setBankAccounts(mappedAccounts);
    } else {
      setBankAccounts([]);
    }
  }, [user]);

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

      setShowBankModal(false);
      logger.info("Bank account added successfully");
    } catch (error) {
      logger.error("Failed to add bank account:", error);
      // Ideally show a toast notification here
    }
  };

  const deleteBankAccount = async (targetAccount: BankAccount) => {
    if (!user) {
      logger.error("Cannot delete bank account: No user found");
      return;
    }

    try {
      await userService.removeBankDetails(user.id, {
        bankName: targetAccount.bankName,
        accountNo: targetAccount.accountNumber,
        accountName: targetAccount.accountName,
      });

      await refreshUser();
      logger.info("Bank account deleted successfully");
    } catch (error) {
      logger.error("Failed to delete bank account:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete bank account. Please try again."
      );
    }
  };

  const handleRequestDeleteBankAccount = (account: BankAccount) => {
    setPendingDeleteBankAccount(account);
    setShowDeleteBankAccountModal(true);
  };

  const handleCloseDeleteBankAccountModal = () => {
    setShowDeleteBankAccountModal(false);
    setPendingDeleteBankAccount(null);
  };

  const handleConfirmDeleteBankAccount = async () => {
    const targetAccount = pendingDeleteBankAccount;
    setShowDeleteBankAccountModal(false);
    setPendingDeleteBankAccount(null);

    if (!targetAccount) return;
    await deleteBankAccount(targetAccount);
  };

  // Pagination logic
  //const totalPages = Math.ceil(bankAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccounts = bankAccounts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Bank Account Header */}
      <div className="sm:flex sm:flex-row sm:justify-between space-y-4">
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-[#0A1B39]">
            Bank account
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Manage your bank accounts here
          </p>
        </div>
        {/* Add Bank Details Button */}
        <div className="flex sm:justify-end sm:p-3">
          <button
            onClick={() => setShowBankModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#6500AC] text-white text-xs sm:text-sm rounded-lg hover:bg-[#5C009D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add bank details
          </button>
        </div>
      </div>

      {/* Bank Accounts List */}
      {bankAccounts.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EAECF0]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#667085]">
                    Account name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#667085]">
                    Account number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#667085]">
                    Bank name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#667085]">
                    Date Added
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#667085]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]"
                  >
                    <td className="py-4 px-4 text-sm text-[#0A1B39] font-medium">
                      {account.accountName}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#667085]">
                      {account.accountNumber}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#667085]">
                      {account.bankName}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#667085]">
                      {account.dateAdded}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleRequestDeleteBankAccount(account)}
                        className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                        title="Delete bank account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-2">
            {paginatedAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white border border-[#EAECF0] rounded-lg p-2.5 sm:p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm sm:text-base text-[#0A1B39]">
                      {account.accountName}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#667085]">
                      {account.accountNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-[#667085]">
                      {account.bankName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#9CA3AF]">
                      Added {account.dateAdded}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRequestDeleteBankAccount(account)}
                    className="p-1.5 sm:p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                    title="Delete bank account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {bankAccounts.length > itemsPerPage && (
            <Pagination
              totalItems={bankAccounts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-[#F9FAFB] rounded-lg flex items-center justify-center">
            <img src={plugicon} alt="" />
          </div>
          <h3 className="text-sm sm:text-lg font-medium text-[#0A1B39] mb-2">
            You haven't added any bank details yet!
          </h3>
          <p className="text-xs sm:text-sm text-[#667085] mb-6">
            Add your bank account details to start receiving payments
          </p>
          <button
            onClick={() => setShowBankModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#6500AC] text-white text-xs sm:text-sm rounded-lg hover:bg-[#5C009D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add bank details
          </button>
        </div>
      )}

      {/* Bank Details Modal */}
      <BankDetailsModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onAddBankAccount={handleAddBankAccount}
      />

      <DeleteBankAccountConfirmationModal
        isOpen={showDeleteBankAccountModal}
        onClose={handleCloseDeleteBankAccountModal}
        onConfirm={handleConfirmDeleteBankAccount}
        bankAccount={
          pendingDeleteBankAccount
            ? {
                accountName: pendingDeleteBankAccount.accountName,
                accountNumber: pendingDeleteBankAccount.accountNumber,
                bankName: pendingDeleteBankAccount.bankName,
              }
            : null
        }
      />
    </div>
  );
};

export default DashboardSettingsBankingTab;
