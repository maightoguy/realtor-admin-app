import { useEffect, useState } from "react";
import { authService } from "../../services/authService";
import { logger } from "../../utils/logger";
import Loader from "../Loader";

interface OTPFormProps {
  email: string;
  onBack: () => void;
  onVerified: () => void | Promise<void>;
}

const OTPForm: React.FC<OTPFormProps> = ({ email, onBack, onVerified }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer =
      timeLeft > 0 && setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer as NodeJS.Timeout);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(null);

      // Auto-focus next input
      if (value && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`);
        next?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    logger.info("🔐 [OTP] Verifying OTP", { email });

    try {
      const { error: verifyError } = await authService.verifyOtp(
        email,
        fullOtp,
        "email"
      );

      if (verifyError) {
        logger.error("❌ [OTP] OTP verification failed:", verifyError);
        
        let errorMessage = "Invalid OTP. Please try again.";
        if (verifyError.message.includes("expired")) {
          errorMessage = "OTP has expired. Please request a new one.";
        } else if (verifyError.message.includes("invalid")) {
          errorMessage = "Invalid OTP code. Please check and try again.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      logger.info("✅ [OTP] OTP verified successfully");
      setLoading(false);
      await onVerified();
    } catch (err) {
      logger.error("❌ [OTP] Unexpected error during OTP verification:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    setCanResend(false);
    setTimeLeft(59);
    setOtp(["", "", "", "", "", ""]);

    logger.info("📧 [OTP] Resending password reset email", { email });

    try {
      const { error: resetError } = await authService.resetPasswordForEmail(email);

      if (resetError) {
        logger.error("❌ [OTP] Failed to resend reset email:", resetError);
        setError("Failed to resend OTP. Please try again.");
        setLoading(false);
        return;
      }

      logger.info("✅ [OTP] Password reset email resent successfully");
      setLoading(false);
    } catch (err) {
      logger.error("❌ [OTP] Unexpected error during resend:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const isDisabled = otp.join("").length < 6;

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 md:my-[50%]">
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

      {/* Content */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
        {/* Heading */}
        <div className="text-start">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            OTP Verification
          </h2>
          <p className="text-gray-500 text-sm">
            Please enter the 6-digit sent to{" "}
            <span className="font-semibold text-black">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between w-full max-w-xs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Countdown / Resend */}
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-gray-600 text-sm hover:text-purple-700 disabled:opacity-50"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-gray-600 text-sm">
            Resend In{" "}
            <span className="text-purple-700 font-medium">
              00:{timeLeft.toString().padStart(2, "0")}
            </span>
          </p>
        )}

        {/* Confirm Button */}
        <button
          type="submit"
          disabled={isDisabled || loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            isDisabled || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
          {loading ? "Verifying..." : "Confirm OTP"}
        </button>

        {/* Loading Overlay */}
        {loading && <Loader text="Verifying OTP..." />}
      </form>
    </div>
  );
};

export default OTPForm;
