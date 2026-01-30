import { useState } from "react";
import { authService } from "../../services/authService";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setIsSending(true);
    setMessage(null);
    try {
      const { error } = await authService.resetPasswordForEmail(trimmedEmail);
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMessage({
        type: "success",
        text: "Password reset email sent! Please check your inbox.",
      });
    } catch (e) {
      const text =
        e instanceof Error ? e.message : "Failed to send password reset email.";
      setMessage({ type: "error", text });
    } finally {
      setIsSending(false);
    }
  };

  const isActive = email.trim() !== "";

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-start justify-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-2xl font-bold text-gray-700"
          >
            ←
          </button>
          <h2 className="text-[22px] sm:text-2xl font-bold text-gray-900 mt-2">
            Forgot Password
          </h2>
        </div>

        <p className="text-gray-500 text-xs sm:text-sm text-left">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-purple-700 font-medium"
          >
            Log in
          </button>
        </p>

        {/* Email Field */}
        <div className="text-left">
          <label className="block text-gray-600 font-medium mb-2 text-xs sm:text-sm">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g ****@mail.com"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400 text-sm"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-xs sm:text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isActive || isSending}
          className={`w-full py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition ${
            isActive && !isSending
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isSending ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
