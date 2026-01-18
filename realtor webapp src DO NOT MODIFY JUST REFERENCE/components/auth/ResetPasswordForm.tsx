import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { trimValues } from "../../utils/trim";
import { authService } from "../../services/authService";
import { userService } from "../../services/apiService";
import { logger } from "../../utils/logger";
import Loader from "../Loader";

interface ResetPasswordFormProps {
  onBack: () => void;
  onDone: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onBack,
  onDone,
}) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if session exists on mount (wait for hash processing)
    const timer = setTimeout(async () => {
      const { data } = await authService.getSession();
      if (!data.session) {
        logger.warn("⚠️ [RESET PASSWORD] No active session found after delay");
        setError(
          "Invalid or expired password reset link. Please request a new one."
        );
      } else {
        logger.info("✅ [RESET PASSWORD] Active session verified");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedData = trimValues({ password, confirm });
    const trimmedPassword = trimmedData.password as string;
    const trimmedConfirm = trimmedData.confirm as string;

    if (!trimmedPassword || !trimmedConfirm) {
      setError("Please fill out both fields");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    logger.info("🔑 [RESET PASSWORD] Updating password");

    try {
      const { error: updateError } = await authService.updatePassword(
        trimmedPassword
      );

      if (updateError) {
        logger.error(
          "❌ [RESET PASSWORD] Failed to update password:",
          updateError
        );

        let errorMessage = "Failed to update password. Please try again.";
        if (updateError.message.includes("session")) {
          errorMessage =
            "Your session has expired. Please start the password reset process again.";
        } else if (updateError.message.includes("weak")) {
          errorMessage =
            "Password is too weak. Please choose a stronger password.";
        }

        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Verify user profile exists (handle deleted accounts)
      const { data: sessionData } = await authService.getSession();
      if (sessionData.session?.user) {
        try {
          const profile = await userService.getById(
            sessionData.session.user.id
          );
          if (!profile) {
            logger.warn(
              "⚠️ [RESET PASSWORD] Profile missing for user:",
              sessionData.session.user.id
            );
            await authService.signOut();
            setError("Account not found. It may have been deleted.");
            setLoading(false);
            return;
          }
        } catch (err) {
          logger.error("❌ [RESET PASSWORD] Failed to verify profile:", err);
          // If verification fails, treat as error? Or proceed?
          // Safer to stop if we can't verify.
          await authService.signOut();
          setError("Failed to verify account details.");
          setLoading(false);
          return;
        }
      }

      logger.info("✅ [RESET PASSWORD] Password updated successfully");
      try {
        localStorage.removeItem("realtor_app_recovery_mode");
      } catch {
        // ignore
      }
      await authService.signOut();
      setLoading(false);
      onDone();
    } catch (err) {
      logger.error("❌ [RESET PASSWORD] Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-10 md:my-[50%]">
      {/* Header */}
      <div className="w-full max-w-sm mx-auto mb-8 flex flex-col gap-3 items-start">
        <button
          type="button"
          onClick={onBack}
          className="text-2xl text-gray-700 hover:text-purple-700 "
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Reset password</h2>
        <p className="text-gray-500 text-sm">
          Kindly input your new password here
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto space-y-6"
      >
        {/* Password */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full border rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              placeholder="********"
              disabled={loading}
              className="w-full border rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Done Button */}
        <button
          type="submit"
          disabled={!password || !confirm || loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            password && confirm && !loading
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Updating..." : "Done"}
        </button>

        {/* Loading Overlay */}
        {loading && <Loader text="Updating password..." />}
      </form>
    </div>
  );
};

export default ResetPasswordForm;
