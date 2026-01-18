import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authService } from "../../services/authService";
import { authManager } from "../../services/authManager";

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!password || !confirm) {
      setError("Please fill out both fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const { error: updateError } = await authService.updatePassword(password);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await authService.signOut();
      authManager.clearUser();
      onDone();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to reset password.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      {/* Header */}
      <div className="w-full max-w-sm mx-auto mb-8 flex flex-col gap-3 items-start">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
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
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
              disabled={isSaving}
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
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
              className="w-full border rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={isSaving}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          type="submit"
          disabled={!password || !confirm || isSaving}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            password && confirm && !isSaving
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : "Done"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
