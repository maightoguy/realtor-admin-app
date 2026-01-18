/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import KYCPopupModal from "../../registration components/KYCPopupModal";
import { authService } from "../../../services/authService";
import { storageService } from "../../../services/storageService";
import { userService } from "../../../services/apiService";
import { draftService } from "../../../services/draftService";
import type { User } from "../../../services/types";
import { logger } from "../../../utils/logger";
import Loader from "../../Loader";

const DashboardSettingsKYCTab = () => {
  const [document, setDocument] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [wasResumed, setWasResumed] = useState(false);
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [verifiedDocumentType, setVerifiedDocumentType] = useState<string>("");
  const [verifiedFileName, setVerifiedFileName] = useState<string>("");
  const [verifiedDate, setVerifiedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState<string | null>(null);

  const canProceed = document !== "" && file !== null;

  // Fetch current user data and KYC status on mount
  useEffect(() => {
    const fetchUserData = async () => {
      logger.info("📋 [KYC TAB] Fetching user data...");
      setIsLoadingUser(true);
      setError(null);

      try {
        // Get current authenticated user
        const authUser = await authService.getCurrentUser();
        if (!authUser) {
          logger.error("❌ [KYC TAB] No authenticated user found");
          setError("You must be logged in to view KYC settings.");
          setIsLoadingUser(false);
          return;
        }

        logger.info("✅ [KYC TAB] Authenticated user found:", authUser.id);
        setDraftKey(`kyc_draft_${authUser.id}`);
        setResumeKey(`kyc_resume_modal_${authUser.id}`);

        // Fetch user profile from database
        const userProfile = await userService.getById(authUser.id);
        if (!userProfile) {
          logger.error("❌ [KYC TAB] User profile not found");
          setError("User profile not found. Please contact support.");
          setIsLoadingUser(false);
          return;
        }

        logger.info("✅ [KYC TAB] User profile loaded:", {
          id: userProfile.id,
          kycStatus: userProfile.kyc_status,
          hasDocument: !!userProfile.id_document_url,
        });

        setCurrentUser(userProfile);

        if (
          userProfile.id_document_url &&
          (userProfile.kyc_status === "pending" ||
            userProfile.kyc_status === "approved")
        ) {
          try {
            await draftService.deleteDraft(`kyc_draft_${authUser.id}`);
          } catch (clearError) {
            logger.warn("⚠️ [KYC TAB] Failed to clear KYC draft:", clearError);
          }
        } else {
          try {
            const draft = await draftService.getDraft(
              `kyc_draft_${authUser.id}`
            );
            if (draft && typeof draft === "object") {
              const draftDoc =
                typeof (draft as any).document === "string"
                  ? String((draft as any).document)
                  : "";
              const draftFile = (draft as any).file as unknown;
              if (draftDoc) {
                setDocument((prev) => prev || draftDoc);
              }
              if (draftFile instanceof File) {
                setFile((prev) => prev ?? draftFile);
              }
            }
          } catch (draftError) {
            logger.warn(
              "⚠️ [KYC TAB] Failed to restore KYC draft:",
              draftError
            );
          }
        }

        try {
          const shouldResume =
            localStorage.getItem(`kyc_resume_modal_${authUser.id}`) === "1";
          if (shouldResume) {
            setShowModal(true);
            setWasResumed(true);
          }
        } catch (e) {
          void e;
        }

        if (userProfile.kyc_status === "approved") {
          setIsKYCVerified(true);
          // Extract document type from URL if available, or use a default
          if (userProfile.id_document_url) {
            // Try to extract document type from URL path
            const urlMatch =
              userProfile.id_document_url.match(/\/([^/]+)-(\d+)\./);
            if (urlMatch) {
              setVerifiedDocumentType(urlMatch[1]);
            }
            // Extract filename from URL
            const fileNameMatch =
              userProfile.id_document_url.match(/\/([^/]+\.\w+)$/);
            if (fileNameMatch) {
              setVerifiedFileName(fileNameMatch[1]);
            }
          }
        } else if (
          userProfile.kyc_status === "pending" &&
          userProfile.id_document_url
        ) {
          // Document uploaded but pending approval - show pending state
          setIsKYCVerified(true); // Show status state, not form
          // Extract document info from URL
          if (userProfile.id_document_url) {
            const urlMatch =
              userProfile.id_document_url.match(/\/([^/]+)-(\d+)\./);
            if (urlMatch) {
              setVerifiedDocumentType(urlMatch[1]);
            }
            const fileNameMatch =
              userProfile.id_document_url.match(/\/([^/]+\.\w+)$/);
            if (fileNameMatch) {
              setVerifiedFileName(fileNameMatch[1]);
            }
          }
        } else if (userProfile.kyc_status === "rejected") {
          // KYC was rejected - allow resubmission
          setIsKYCVerified(false);
          if (userProfile.id_document_url) {
            // Extract previous document info
            const urlMatch =
              userProfile.id_document_url.match(/\/([^/]+)-(\d+)\./);
            if (urlMatch) {
              setVerifiedDocumentType(urlMatch[1]);
            }
          }
        }

        setIsLoadingUser(false);
      } catch (err) {
        logger.error("❌ [KYC TAB] Error fetching user data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load KYC information. Please try again."
        );
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const persistDraft = async (next: {
    document: string;
    file: File | null;
  }) => {
    if (!draftKey) return;
    try {
      await draftService.saveDraft(draftKey, {
        document: next.document,
        file: next.file,
        updatedAt: Date.now(),
      });
    } catch (persistError) {
      logger.warn("⚠️ [KYC TAB] Failed to persist KYC draft:", persistError);
    }
  };

  const handleUploadDocument = () => {
    if (document !== "") {
      setShowModal(true);
      if (resumeKey) {
        try {
          localStorage.setItem(resumeKey, "1");
        } catch (e) {
          void e;
        }
      }
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setShowModal(false);
    setWasResumed(false);
    setError(null); // Clear any previous errors
    void persistDraft({ document, file: selectedFile });
    if (resumeKey) {
      try {
        localStorage.removeItem(resumeKey);
      } catch (e) {
        void e;
      }
    }
  };

  const handleKYCComplete = async () => {
    if (!document || !file || !currentUser) {
      setError("Please select a document type and upload a file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    logger.info("📤 [KYC TAB] Starting KYC submission...", {
      userId: currentUser.id,
      documentType: document,
      fileName: file.name,
    });

    try {
      // Step 1: Upload document to Supabase Storage
      logger.info("📄 [KYC TAB] Step 1: Uploading document to storage...");
      const documentUrl = await storageService.uploadKYCDocument(
        currentUser.id,
        file,
        document
      );

      logger.info("✅ [KYC TAB] Document uploaded successfully:", documentUrl);

      // Step 2: Update user profile with document URL and set status to pending
      logger.info("🔄 [KYC TAB] Step 2: Updating user profile...");
      const updatedUser = await userService.update(currentUser.id, {
        id_document_url: documentUrl,
        kyc_status: "pending", // Will be reviewed by admin
      });

      logger.info("✅ [KYC TAB] User profile updated successfully");

      // Step 3: Store verified info and show success state
      setVerifiedDocumentType(document);
      setVerifiedFileName(file.name);
      setVerifiedDate(new Date().toLocaleDateString());
      setIsKYCVerified(true);
      setCurrentUser(updatedUser);

      // Reset form
      setDocument("");
      setFile(null);
      setWasResumed(false);
      if (draftKey) {
        try {
          await draftService.deleteDraft(draftKey);
        } catch (deleteError) {
          logger.warn("⚠️ [KYC TAB] Failed to delete KYC draft:", deleteError);
        }
      }
      if (resumeKey) {
        try {
          localStorage.removeItem(resumeKey);
        } catch (e) {
          void e;
        }
      }

      logger.info("✅ [KYC TAB] KYC submission completed successfully");
    } catch (err: any) {
      logger.error("❌ [KYC TAB] KYC submission failed:", {
        message: err?.message,
        error: err,
      });

      let errorMessage = "Failed to submit KYC document. Please try again.";

      if (err?.message?.includes("row-level security policy")) {
        errorMessage =
          "Upload failed due to permissions. Please ensure you are logged in and try again.";
      } else if (err?.message?.includes("must be logged in")) {
        errorMessage =
          "You must be logged in to upload documents. Please log in and try again.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format document type for display
  const formatDocumentType = (docType: string): string => {
    const typeMap: Record<string, string> = {
      id: "National ID",
      passport: "Passport",
      license: "Driver's License",
      utility: "Voters Card",
    };
    return typeMap[docType] || docType;
  };

  // If KYC is already verified or pending, show status state
  // But if rejected, show form to allow resubmission
  if (
    (isKYCVerified || (currentUser && currentUser.kyc_status === "approved")) &&
    currentUser?.kyc_status !== "rejected"
  ) {
    return (
      <div className="space-y-6">
        {/* KYC Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#0A1B39]">
            KYC verification
          </h2>
          <p className="text-sm text-[#667085]">
            Your identity has been verified
          </p>
        </div>

        {/* Success State */}
        <div className="bg-white border border-[#EAECF0] rounded-lg p-3 md:p-6">
          <div className="text-center py-6 md:py-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-[#0A1B39] mb-1.5 md:mb-2">
              {currentUser?.kyc_status === "approved"
                ? "KYC Verification Complete"
                : currentUser?.kyc_status === "pending"
                ? "KYC Submission Pending"
                : "KYC Verification Complete"}
            </h3>
            <p className="text-xs md:text-sm text-[#667085] mb-4 md:mb-6">
              {currentUser?.kyc_status === "approved"
                ? "Your identity has been successfully verified. You can now access all features of the platform."
                : currentUser?.kyc_status === "pending"
                ? "Your KYC document has been submitted and is pending review. You will be notified once it's approved."
                : "Your identity has been successfully verified. You can now access all features of the platform."}
            </p>
            <div
              className={`rounded-lg p-4 ${
                currentUser?.kyc_status === "approved"
                  ? "bg-green-50 border border-green-200"
                  : currentUser?.kyc_status === "pending"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      currentUser?.kyc_status === "approved"
                        ? "text-green-800"
                        : currentUser?.kyc_status === "pending"
                        ? "text-yellow-800"
                        : "text-green-800"
                    }`}
                  >
                    Document Type:{" "}
                    {verifiedDocumentType
                      ? formatDocumentType(verifiedDocumentType)
                      : "N/A"}
                  </p>
                  {verifiedFileName && (
                    <p
                      className={`text-xs mt-1 ${
                        currentUser?.kyc_status === "approved"
                          ? "text-green-700"
                          : currentUser?.kyc_status === "pending"
                          ? "text-yellow-700"
                          : "text-green-700"
                      }`}
                    >
                      File: {verifiedFileName}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      currentUser?.kyc_status === "approved"
                        ? "text-green-600"
                        : currentUser?.kyc_status === "pending"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {verifiedDate
                      ? `Submitted on ${verifiedDate}`
                      : currentUser?.created_at
                      ? `Submitted on ${new Date(
                          currentUser.created_at
                        ).toLocaleDateString()}`
                      : `Submitted on ${new Date().toLocaleDateString()}`}
                  </p>
                  {currentUser?.kyc_status === "pending" && (
                    <p className="text-xs text-yellow-700 mt-1 font-medium">
                      ⏳ Status: Pending Review
                    </p>
                  )}
                  {currentUser?.kyc_status === "approved" && (
                    <p className="text-xs text-green-700 mt-1 font-medium">
                      ✅ Status: Approved
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingUser) {
    return <Loader text="Loading KYC information..." />;
  }

  return (
    <div className="space-y-6">
      {/* KYC Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#0A1B39]">
          KYC verification
        </h2>
        <p className="text-sm text-[#667085]">
          Manage your account security here
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-600 font-medium mb-1">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rejected KYC Warning */}
      {currentUser?.kyc_status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium mb-1">
                KYC Verification Rejected
              </p>
              <p className="text-sm text-red-700">
                Your previous KYC submission was rejected. Please upload a new
                document to resubmit for verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KYC Form */}
      <div className="bg-white border border-[#EAECF0] rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        {wasResumed && !file && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            Your phone reloaded the page (low memory). Please select your file
            again to continue.
          </div>
        )}
        {/* Select document */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-[#0A1B39]">
            Select document
          </label>
          <select
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent bg-white"
            value={document}
            onChange={(e) => {
              const nextDoc = e.target.value;
              setDocument(nextDoc);
              void persistDraft({ document: nextDoc, file });
            }}
          >
            <option value="">what document do you want to use</option>
            <option value="id">National ID</option>
            <option value="passport">Passport</option>
            <option value="license">Driver's License</option>
            <option value="utility">Voters Card</option>
          </select>
        </div>

        {/* Upload Document Section */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-[#0A1B39]">
            Upload your document
          </label>
          {file ? (
            // --- File Uploaded State ---
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-green-100 border border-green-200 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  {file.name}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500">
                  Document uploaded successfully
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  void persistDraft({ document, file: null });
                }}
                className="text-green-600 hover:text-green-800"
                aria-label="Remove file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            // --- No File Uploaded State (Clickable) ---
            <div
              className={`
                flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-[#F9FAFB] border border-[#E6E7EC]
                ${
                  document !== ""
                    ? "cursor-pointer hover:bg-gray-50"
                    : "cursor-not-allowed opacity-60"
                }
              `}
              role="button"
              tabIndex={document !== "" ? 0 : -1}
              aria-disabled={document === ""}
              onClick={document !== "" ? handleUploadDocument : undefined}
              onKeyDown={(e) => {
                if (document !== "" && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleUploadDocument();
                }
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#F0E6F7] border border-[#E6E7EC] text-[#6500AC]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 16h16"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-[#0A1B39] font-medium">
                  {document !== ""
                    ? `Upload your ${document} document`
                    : "Select document type to upload"}
                </p>
                <p className="text-[10px] sm:text-xs text-[#667085]">
                  PDF, JPG format • Max. 5MB
                </p>
              </div>

              {/* Upload Button: Hidden on mobile (default) and shown on 'sm' screens */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadDocument();
                }}
                disabled={document === ""}
                className={`
                  hidden sm:block
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    document !== ""
                      ? "bg-[#6500AC] text-white hover:bg-[#5C009D]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                Upload
              </button>
            </div>
          )}
          <p className="text-xs text-[#667085] text-center sm:hidden">
            Tap above to upload document
          </p>
        </div>

        {/* Proceed Button */}
        <div className="pt-4">
          <button
            disabled={!canProceed || isLoading}
            onClick={handleKYCComplete}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              canProceed && !isLoading
                ? "bg-[#6500AC] text-white hover:bg-[#5C009D]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Submitting..." : "Proceed"}
          </button>
        </div>
      </div>

      {/* KYC Modal */}
      {showModal && (
        <KYCPopupModal
          onClose={() => {
            setShowModal(false);
            setWasResumed(false);
            if (resumeKey) {
              try {
                localStorage.removeItem(resumeKey);
              } catch (e) {
                void e;
              }
            }
          }}
          onFileSelected={handleFileSelected}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && <Loader text="Submitting KYC document..." />}
    </div>
  );
};

export default DashboardSettingsKYCTab;
