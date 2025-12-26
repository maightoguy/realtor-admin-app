import React from "react";
import { Link } from "react-router-dom";
import { File } from "lucide-react";

interface KYCReminderProps {
  onContinue: () => void;
}

const KYCReminder: React.FC<KYCReminderProps> = ({ onContinue }) => {
  return (
    <div className="flex flex-col gap-6 px-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">KYC Verification</h2>
        <p className="text-gray-500 text-sm mt-1">
          Complete your identity verification to access all features
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 border border-blue-200 text-blue-600 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-blue-900 mb-2">
              Complete KYC Later
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              You can complete your KYC (Know Your Customer) verification later
              from your account settings. This helps us verify your identity and
              ensures account security.
            </p>

            {/* Benefits List */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-blue-900">
                You'll be able to:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Upload your identity document</li>
                <li>Access all platform features after verification</li>
                <li>Complete transactions securely</li>
              </ul>
            </div>

            {/* Where to find it */}
            <div className="bg-white rounded-md p-3 border border-blue-200">
              <p className="text-xs text-blue-900 font-medium mb-1">
                <File className="w-5 h-5" /> Where to find it:
              </p>
              <p className="text-xs text-blue-700">
                Dashboard → Settings → KYC Tab
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-md bg-[#6500AC] text-white font-medium hover:bg-[#52008c] transition-colors"
        >
          Got it, Continue
        </button>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-500">
        I have an account?{" "}
        <Link to="/login" className="text-[#6500AC] font-medium">
          Login
        </Link>
      </p>
    </div>
  );
};

export default KYCReminder;
