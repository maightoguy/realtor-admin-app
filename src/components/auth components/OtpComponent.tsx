import { useState } from "react";
import { authService } from "../../services/authService";

interface OTPFormProps {
  email: string;
  onBack: () => void;
  onContinue: () => void | Promise<void>;
}

const OTPForm: React.FC<OTPFormProps> = ({ email, onBack, onContinue }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage(null);
    setError(null);

    try {
      const { error: resendError } = await authService.resendConfirmationEmail(
        email
      );
      if (resendError) {
        setResendMessage({ type: "error", text: resendError.message });
      } else {
        setResendMessage({
          type: "success",
          text: "Confirmation email sent! Please check your inbox.",
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to resend email.";
      setResendMessage({ type: "error", text: message });
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = async () => {
    setIsChecking(true);
    setError(null);
    try {
      await onContinue();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to continue. Please try again.";
      setError(message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      {/* Back Button */}
      <div className="w-full max-w-sm mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-2xl text-gray-700 hover:text-purple-700 "
        >
          ←
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email!
            </h2>
            <p className="text-gray-600 mb-4">
              We need you to confirm your email before continuing.
            </p>
            <p className="text-lg font-semibold text-purple-700 mb-6">
              {email}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the confirmation link in the email</li>
                <li>Return here to continue</li>
              </ol>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={isChecking}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                isChecking
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              {isChecking ? "Checking..." : "I've Confirmed, Continue"}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Didn't receive the email?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className={`text-purple-700 font-medium hover:underline ${
                    isResending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </p>
              {resendMessage && (
                <p
                  className={`text-sm mt-2 ${
                    resendMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {resendMessage.text}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;
