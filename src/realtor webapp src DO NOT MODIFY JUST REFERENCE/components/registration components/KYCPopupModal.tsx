import React, { useState } from "react";
import { X, Upload } from "lucide-react";

interface KYCPopupModalProps {
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

const KYCPopupModal: React.FC<KYCPopupModalProps> = ({
  onClose,
  onFileSelected,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Upload Document
          </h2>
          <p className="text-gray-600 text-sm">
            Select your document file to complete KYC verification
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {selectedFile ? selectedFile.name : "Click to select file"}
              </p>
              <p className="text-sm text-gray-500">
                PDF, JPG format • Max. 5MB
              </p>
            </label>
          </div>
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
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
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedFile
                ? "bg-[#6500AC] text-white hover:bg-[#52008c]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Select File
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCPopupModal;
