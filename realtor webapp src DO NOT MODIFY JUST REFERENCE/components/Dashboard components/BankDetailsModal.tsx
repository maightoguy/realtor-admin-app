import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { draftService } from "../../services/draftService";

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBankAccount?: (bankData: {
    bankName: string;
    accountNo: string;
    accountName: string;
  }) => void;
}

type BankDetailsDraft = {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

const DRAFT_KEY = "bank_details_draft";

const BankDetailsModal = ({
  isOpen,
  onClose,
  onAddBankAccount,
}: BankDetailsModalProps) => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const isSubmittingRef = useRef(false);

  // Example mock bank list

  const isValidAccountNumber = accountNumber.length === 10;
  const isFormValid =
    bankName && isValidAccountNumber && accountName.length > 0;

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Restore draft on mount
  useEffect(() => {
    let isMounted = true;
    const loadDraft = async () => {
      try {
        const draft = await draftService.getDraft<BankDetailsDraft>(DRAFT_KEY);
        if (!isMounted) return;

        if (draft) {
          setBankName(draft.bankName ?? "");
          setAccountNumber(draft.accountNumber ?? "");
          setAccountName(draft.accountName ?? "");
        }
      } catch (err) {
        console.error("Failed to load draft:", err);
      } finally {
        if (isMounted) setIsDraftLoaded(true);
      }
    };
    if (isOpen) {
      loadDraft();
    } else {
      setIsDraftLoaded(false); // Reset loaded state when closed
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Auto-save draft
  useEffect(() => {
    if (!isDraftLoaded || isSubmittingRef.current) return;

    const saveTimeout = setTimeout(() => {
      draftService
        .saveDraft(DRAFT_KEY, {
          bankName,
          accountNumber,
          accountName,
        })
        .catch((err) => console.error("Failed to save draft:", err));
    }, 1000); // Debounce 1s

    return () => clearTimeout(saveTimeout);
  }, [bankName, accountNumber, accountName, isDraftLoaded, isOpen]);

  const handleClose = () => {
    // Save draft before closing
    draftService
      .saveDraft(DRAFT_KEY, {
        bankName,
        accountNumber,
        accountName,
      })
      .catch((err) => console.error("Failed to save draft on close:", err));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
      <div className="bg-white w-full max-w-[480px] rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-start space-y-2 mb-4 md:mb-6">
          <div className="p-2 md:p-3 border rounded-lg text-gray-200 bg-white shadow-sm">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path
                d="M10.5 6.5L5.5 10V22"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.5 2L15.5 5.5V12L19 14.5V22H10.5V2Z"
                fill="black"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 22H22"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="font-bold text-base md:text-lg text-black">
            Bank details
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Please kindly fill the form below to add your bank details
          </p>
        </div>

        {/* Bank Name */}
        <div className="mb-3 md:mb-4">
          <label className="text-xs md:text-sm text-gray-600 mb-1 block">
            Bank name
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. GTBank"
            className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-md px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
          />
        </div>

        {/* Account Number */}
        <div className="mb-3 md:mb-4">
          <label className="text-xs md:text-sm text-gray-600 mb-1 block">
            Account number
          </label>
          <input
            type="text"
            maxLength={10}
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            placeholder="1234567890"
            className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-md px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
          />
        </div>

        {/* Account Name */}
        <div className="mb-3 md:mb-4">
          <label className="text-xs md:text-sm text-gray-600 mb-1 block">
            Account name
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-md px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 md:gap-4">
          <button
            onClick={handleClose}
            className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-base font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (isFormValid && onAddBankAccount) {
                isSubmittingRef.current = true;
                onAddBankAccount({
                  bankName,
                  accountNo: accountNumber,
                  accountName,
                });
                try {
                  await draftService.deleteDraft(DRAFT_KEY);
                } catch (e) {
                  console.error("Failed to delete draft", e);
                } finally {
                  isSubmittingRef.current = false;
                }
              }
              onClose();
            }}
            disabled={!isFormValid}
            className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-medium text-xs md:text-base text-white transition-colors ${
              isFormValid
                ? "bg-[#5E17EB] hover:bg-[#4A14C7]"
                : "bg-gray-200 cursor-not-allowed"
            }`}
          >
            Save details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsModal;
