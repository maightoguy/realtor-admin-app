import { useState } from "react";
import { Link } from "react-router-dom";
import { trimValues } from "../../utils/trim";
import { authService } from "../../services/authService";
import { logger } from "../../utils/logger";
import Loader from "../Loader";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedData = trimValues({ email });
    const trimmedEmail = trimmedData.email as string;
    
    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    logger.info("📧 [FORGOT PASSWORD] Sending password reset email", { email: trimmedEmail });

    try {
      const { error: resetError } = await authService.resetPasswordForEmail(trimmedEmail);

      if (resetError) {
        logger.error("❌ [FORGOT PASSWORD] Failed to send reset email:", resetError);
        
        let errorMessage = "Failed to send reset email. Please try again.";
        if (resetError.message.includes("rate limit")) {
          errorMessage = "Too many requests. Please try again later.";
        } else if (resetError.message.includes("not found") || resetError.message.includes("does not exist")) {
          // Don't reveal if email exists for security
          errorMessage = "If an account exists with this email, a password reset link has been sent.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      logger.info("✅ [FORGOT PASSWORD] Password reset email sent successfully");
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      logger.error("❌ [FORGOT PASSWORD] Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const isActive = email.trim() !== "";

  return (
    <div className="flex flex-col md:items-center md:my-[50%] md:justify-center min-h-screen px-6 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 ">
        {/* Header */}
        <div className="flex flex-col items-start justify-start gap-3 ">
          <button type="button" onClick={onBack}>
            <span className="text-2xl font-bold text-gray-700">←</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            Forgot Password
          </h2>
        </div>

        <p className="text-gray-500 text-sm text-left">
          Don’t have an account?{" "}
          <Link to="/register" className="text-purple-700 font-medium">
            Sign Up
          </Link>
        </p>

        {/* Email Field */}
        <div className="text-left">
          <label className="block text-gray-600 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="e.g ****@mail.com"
            disabled={loading}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">
              Password reset email sent! Please check your inbox.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isActive || loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            isActive && !loading
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        {/* Loading Overlay */}
        {loading && <Loader text="Sending reset email..." />}
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
