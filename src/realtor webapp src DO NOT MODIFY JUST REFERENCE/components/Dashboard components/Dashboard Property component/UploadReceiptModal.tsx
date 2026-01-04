import { useState, useEffect, useRef, type FC } from "react";
import { X, Upload, Download, Check } from "lucide-react";
import { trimValues } from "../../../utils/trim";
import { draftService } from "../../../services/draftService";

interface UploadedFile {
  file: File;
  uploadDate: Date;
  id: string;
}

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    clientName: string;
    amount: string;
    files: File[]; // Changed from UploadedFile[] to File[] for easier handling
  }) => Promise<void>;
  isLoading?: boolean;
  propertyId: string;
}

const UploadReceiptModal: FC<UploadReceiptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  propertyId,
}) => {
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const isSubmittingRef = useRef(false);

  const DRAFT_KEY = `upload_receipt_draft_${propertyId}`;

  // Restore draft on mount
  useEffect(() => {
    let isMounted = true;
    const loadDraft = async () => {
      try {
        const draft = await draftService.getDraft(DRAFT_KEY);
        if (!isMounted) return;

        if (draft) {
          setClientName(draft.clientName || "");
          setAmount(draft.amount || "");

          if (draft.files && Array.isArray(draft.files)) {
            // Reconstruct files from stored data
            setFiles(
              draft.files.map((f: any) => ({
                ...f,
                uploadDate: new Date(f.uploadDate), // Restore date object
              }))
            );
          }
        } else {
          // Reset if no draft found (important when switching properties)
          setClientName("");
          setAmount("");
          setFiles([]);
        }
      } catch (err) {
        console.error("Failed to load draft:", err);
      } finally {
        if (isMounted) setIsDraftLoaded(true);
      }
    };
    if (isOpen) {
      loadDraft();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, DRAFT_KEY]);

  // Auto-save draft
  useEffect(() => {
    if (!isOpen || !isDraftLoaded || isSubmittingRef.current) return;

    const saveTimeout = setTimeout(() => {
      draftService
        .saveDraft(DRAFT_KEY, {
          clientName,
          amount,
          files,
        })
        .catch((err) => console.error("Failed to save draft:", err));
    }, 1000); // Debounce 1s

    return () => clearTimeout(saveTimeout);
  }, [clientName, amount, files, isDraftLoaded, DRAFT_KEY, isOpen]);

  const handleFileUpload = (newFiles: FileList | null) => {
    if (newFiles) {
      const fileArray = Array.from(newFiles);
      // Filter for PDF files and check size (5MB limit)
      const validFiles = fileArray.filter(
        (file) =>
          file.type === "application/pdf" && file.size <= 5 * 1024 * 1024
      );

      const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        uploadDate: new Date(),
        id: Math.random().toString(36).substr(2, 9),
      }));

      setFiles((prev) => [...prev, ...uploadedFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const downloadFile = (uploadedFile: UploadedFile) => {
    const url = URL.createObjectURL(uploadedFile.file);
    const link = document.createElement("a");
    link.href = url;
    link.download = uploadedFile.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isFormValid = () => {
    return clientName.trim() !== "" && amount.trim() !== "" && files.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      const trimmedData = trimValues({ clientName, amount });
      try {
        isSubmittingRef.current = true;
        await onSubmit?.({
          clientName: trimmedData.clientName as string,
          amount: trimmedData.amount as string,
          files: files.map((f) => f.file),
        });

        // Clear draft on successful submission
        await draftService.deleteDraft(DRAFT_KEY);

        // Only reset and close if submission was successful (parent should handle errors)
        setClientName("");
        setAmount("");
        setFiles([]);
        onClose();
      } catch (error) {
        // Error handling is done in the parent component
        console.error("Submission failed", error);
      } finally {
        isSubmittingRef.current = false;
      }
    }
  };

  const handleClose = () => {
    // Save current state before closing to ensure no data loss
    draftService
      .saveDraft(DRAFT_KEY, {
        clientName,
        amount,
        files,
      })
      .catch((err) => console.error("Failed to save draft on close:", err));
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] max-h-[90vh] flex flex-col mx-auto">
        {/* Modal Header */}
        <div className="relative p-6 pb-0 flex-shrink-0">
          <div className="flex flex-col items-start gap-4">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-6 top-6 w-11 h-11 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
            {/* Receipt Icon */}
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-[10px] shadow-sm flex items-center justify-center flex-shrink-0">
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_19524_39759)">
                  <path
                    d="M24 1.74C24 1.47478 23.8946 1.22043 23.7071 1.03289C23.5196 0.845355 23.2652 0.739998 23 0.739998H10.58C9.22 0.739998 8.58 2.01 8.58 3.21C8.58839 7.65483 8.29438 12.0951 7.7 16.5C7.69071 16.5575 7.66165 16.6099 7.61783 16.6482C7.57402 16.6866 7.5182 16.7084 7.46 16.71H4.46C2.46 16.71 2.24 18.78 2.12 20.01C2 21.98 1.73 22.25 1 22.25C0.734784 22.25 0.48043 22.3554 0.292893 22.5429C0.105357 22.7304 0 22.9848 0 23.25C0 23.5152 0.105357 23.7696 0.292893 23.9571C0.48043 24.1446 0.734784 24.25 1 24.25H12.5C14.88 24.25 15.22 21.89 15.42 20.49C15.59 19.31 15.72 18.75 16 18.75H16.41C16.4628 18.7493 16.5145 18.7654 16.5576 18.796C16.6008 18.8265 16.6331 18.8699 16.65 18.92C16.71 19.11 16.77 19.37 16.81 19.56C17.01 20.5 17.37 22.25 19.5 22.25C23.57 22.25 24 10.71 24 5.77V1.74ZM12.06 14C11.8611 14 11.6703 13.921 11.5297 13.7803C11.389 13.6397 11.31 13.4489 11.31 13.25C11.31 13.0511 11.389 12.8603 11.5297 12.7197C11.6703 12.579 11.8611 12.5 12.06 12.5H18.06C18.2589 12.5 18.4497 12.579 18.5903 12.7197C18.731 12.8603 18.81 13.0511 18.81 13.25C18.81 13.4489 18.731 13.6397 18.5903 13.7803C18.4497 13.921 18.2589 14 18.06 14H12.06ZM11.81 5.25C11.81 5.05109 11.889 4.86032 12.0297 4.71967C12.1703 4.57902 12.3611 4.5 12.56 4.5H14.56C14.7589 4.5 14.9497 4.57902 15.0903 4.71967C15.231 4.86032 15.31 5.05109 15.31 5.25C15.31 5.44891 15.231 5.63968 15.0903 5.78033C14.9497 5.92098 14.7589 6 14.56 6H12.56C12.3611 6 12.1703 5.92098 12.0297 5.78033C11.889 5.63968 11.81 5.44891 11.81 5.25ZM18.56 10H12.81C12.6111 10 12.4203 9.92098 12.2797 9.78033C12.139 9.63968 12.06 9.44891 12.06 9.25C12.06 9.05109 12.139 8.86032 12.2797 8.71967C12.4203 8.57902 12.6111 8.5 12.81 8.5H18.56C18.7589 8.5 18.9497 8.57902 19.0903 8.71967C19.231 8.86032 19.31 9.05109 19.31 9.25C19.31 9.44891 19.231 9.63968 19.0903 9.78033C18.9497 9.92098 18.7589 10 18.56 10ZM13.43 20.2C13.18 21.97 12.98 22.25 12.49 22.25H4.11C4.07158 22.248 4.03399 22.238 3.99958 22.2208C3.96517 22.2036 3.93468 22.1795 3.91 22.15C3.8954 22.1169 3.88786 22.0812 3.88786 22.045C3.88786 22.0088 3.8954 21.9731 3.91 21.94C4.04673 21.3851 4.13704 20.8198 4.18 20.25C4.19028 19.7413 4.2849 19.2378 4.46 18.76H13.46C13.4977 18.7604 13.5348 18.7693 13.5686 18.7861C13.6024 18.8029 13.6319 18.8271 13.655 18.8569C13.6781 18.8868 13.6941 18.9214 13.7019 18.9583C13.7097 18.9952 13.7091 19.0334 13.7 19.07C13.54 19.5 13.48 19.85 13.43 20.2Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_19524_39759">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* Title and Description */}
            <div className="flex-1">
              <h2 className="text-base font-bold text-black mb-1">
                Upload Receipt
              </h2>
              <p className="text-sm text-gray-500 leading-5">
                Please Kindly fill the form below to to upload necessary
                documents, that have been requested
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Form Fields */}
            <div className="space-y-4">
              {/* Client Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Client name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client's full name"
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-md text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount paid"
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-md text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Upload Instructions */}
            <div className="bg-purple-50 border border-purple-200 rounded-[10px] p-4">
              <p className="text-sm font-medium text-purple-800">
                Click on upload to add all documents, you can upload more 1 at a
                time
              </p>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-[10px] p-4 transition-colors ${
                dragActive
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-100 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Upload Icon */}
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>

                {/* Upload Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-black mb-1">
                    Upload your documents
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>PDF format</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Max. 5MB</span>
                  </div>
                </div>

                {/* Upload Button */}
                <label className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-purple-700 transition-colors flex-shrink-0 w-full sm:w-auto text-center">
                  Upload
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Files:
                </h4>
                <div className="space-y-2">
                  {files.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Success Check Icon */}
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatDate(uploadedFile.uploadDate)}</span>
                            <span>•</span>
                            <span>{formatTime(uploadedFile.uploadDate)}</span>
                            <span>•</span>
                            <span>
                              {formatFileSize(uploadedFile.file.size)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete file"
                        >
                          <svg
                            width="12"
                            height="18"
                            viewBox="0 0 12 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.91659 0.458344C3.57021 0.458344 3.25994 0.672618 3.13727 0.996553L2.94594 1.50178C2.53579 1.4608 2.1579 1.4199 1.85199 1.38555C1.62331 1.35988 1.43533 1.33792 1.30475 1.3224L1.15413 1.30433L1.10298 1.29807C0.646233 1.24152 0.229468 1.56585 0.172907 2.0226C0.116346 2.47935 0.440762 2.89547 0.89751 2.95203L0.95317 2.95883L1.10815 2.97743C1.24177 2.99331 1.43333 3.01568 1.66602 3.04181C2.13099 3.09402 2.76207 3.16141 3.42419 3.22184C4.31734 3.30335 5.29636 3.37501 5.99992 3.37501C6.70349 3.37501 7.68251 3.30335 8.57566 3.22184C9.23778 3.16141 9.86886 3.09402 10.3338 3.04181C10.5665 3.01568 10.7581 2.99331 10.8917 2.97743L11.0467 2.95883L11.1022 2.95204C11.559 2.89548 11.8835 2.47935 11.8269 2.0226C11.7704 1.56585 11.3543 1.24144 10.8975 1.29799L10.8457 1.30433L10.6951 1.3224C10.5645 1.33792 10.3765 1.35988 10.1479 1.38555C9.84195 1.4199 9.46406 1.4608 9.05391 1.50178L8.86258 0.996553C8.73991 0.672618 8.42964 0.458344 8.08326 0.458344H3.91659Z"
                              fill="currentColor"
                            />
                            <path
                              d="M5.16659 8.79168C5.16659 8.33144 4.79349 7.95834 4.33326 7.95834C3.87302 7.95834 3.49992 8.33144 3.49992 8.79168V12.9583C3.49992 13.4186 3.87302 13.7917 4.33326 13.7917C4.79349 13.7917 5.16659 13.4186 5.16659 12.9583V8.79168Z"
                              fill="currentColor"
                            />
                            <path
                              d="M7.66659 7.95834C8.12683 7.95834 8.49992 8.33144 8.49992 8.79168V12.9583C8.49992 13.4186 8.12683 13.7917 7.66659 13.7917C7.20635 13.7917 6.83326 13.4186 6.83326 12.9583V8.79168C6.83326 8.33144 7.20635 7.95834 7.66659 7.95834Z"
                              fill="currentColor"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11.758 5.70881C11.8335 4.6515 10.9219 3.80387 9.886 3.92359C8.82598 4.0461 7.19021 4.20834 5.99992 4.20834C4.80964 4.20834 3.17387 4.0461 2.11385 3.92359C1.07791 3.80387 0.166359 4.6515 0.241881 5.70881L0.955826 15.704C1.00995 16.4617 1.57431 17.1023 2.34879 17.2188C3.1793 17.3437 4.70321 17.5432 6.00089 17.5417C7.28262 17.5402 8.81273 17.3416 9.64689 17.2178C10.4227 17.1027 10.9899 16.4617 11.0442 15.7018L11.758 5.70881ZM10.0773 5.57924C10.0802 5.57891 10.0824 5.5791 10.0824 5.5791L10.0846 5.57961C10.0865 5.58025 10.0894 5.58177 10.0923 5.58449C10.0942 5.58629 10.0956 5.58849 10.0956 5.58849L10.0955 5.59006L9.38253 15.5721C8.55696 15.6941 7.14203 15.8737 5.99896 15.875C4.8435 15.8763 3.43732 15.6966 2.61744 15.5738L1.90431 5.59006L1.90425 5.58849C1.90425 5.58849 1.90567 5.58629 1.90757 5.58449C1.91044 5.58177 1.91335 5.58025 1.9152 5.57961L1.9174 5.5791C1.9174 5.5791 1.91962 5.57891 1.92251 5.57924C2.98441 5.70196 4.70446 5.87501 5.99992 5.87501C7.29539 5.87501 9.01544 5.70196 10.0773 5.57924Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>

                        {/* Download Button */}
                        <button
                          type="button"
                          onClick={() => downloadFile(uploadedFile)}
                          className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Actions */}
        <div className="px-6 pb-8 pt-2 flex-shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isLoading || !clientName || !amount || files.length === 0
              }
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                isLoading || !clientName || !amount || files.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#5E17EB] hover:bg-[#4A14C7]"
              }`}
            >
              {isLoading ? "Submitting..." : "Submit Receipt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReceiptModal;
