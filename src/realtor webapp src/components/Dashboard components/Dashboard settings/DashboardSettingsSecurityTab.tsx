import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { trimValues } from "../../../utils/trim";
import Loader from "../../Loader";
import { authService } from "../../../services/authService";

const DashboardSettingsSecurityTab = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdatePassword = async () => {
    // Trim form values
    const trimmedData = trimValues(formData);
    const trimmedNewPassword = trimmedData.newPassword as string;
    const trimmedConfirmPassword = trimmedData.confirmPassword as string;

    // Validate passwords
    if (trimmedNewPassword !== trimmedConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (trimmedNewPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.updatePassword(trimmedNewPassword);
      if (result.error) {
        throw result.error;
      }

      alert("Password updated successfully!");

      // Reset form
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.newPassword.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.newPassword === formData.confirmPassword;

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#0A1B39]">Security</h2>
        <p className="text-sm text-[#667085]">
          Manage your account security here
        </p>
      </div>

      {/* Password Update Form */}
      <div className=" bg-white border border-[#EAECF0] rounded-lg p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          {/* New Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A1B39]">
              New password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder="Input Password"
                className="w-full px-4 py-3 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#667085] transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.newPassword && formData.newPassword.length < 8 && (
              <p className="text-xs text-[#DC2626]">
                Password must be at least 8 characters long
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A1B39]">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Enter Password again"
                className="w-full px-4 py-3 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#667085] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-[#DC2626]">Passwords do not match</p>
              )}
          </div>
        </div>

        {/* Update Password Button */}
        <div className="pt-4">
          <button
            onClick={handleUpdatePassword}
            disabled={!isFormValid || isLoading}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              isFormValid && !isLoading
                ? "bg-[#6500AC] text-white hover:bg-[#5C009D]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>

      {/* Additional Security Features (Future) */}
      <div className="hidden bg-white border border-[#EAECF0] rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-[#0A1B39] mb-4">
          Additional Security Features
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-[#E6E7EC] rounded-lg">
            <div>
              <h4 className="font-medium text-[#0A1B39]">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-[#667085]">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm text-[#9CA3AF] border border-[#E5E7EB] rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-[#E6E7EC] rounded-lg">
            <div>
              <h4 className="font-medium text-[#0A1B39]">
                Login Notifications
              </h4>
              <p className="text-sm text-[#667085]">
                Get notified when someone logs into your account
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm text-[#9CA3AF] border border-[#E5E7EB] rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-[#E6E7EC] rounded-lg">
            <div>
              <h4 className="font-medium text-[#0A1B39]">Active Sessions</h4>
              <p className="text-sm text-[#667085]">
                View and manage your active login sessions
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm text-[#9CA3AF] border border-[#E5E7EB] rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && <Loader text="Updating password..." />}
    </div>
  );
};

export default DashboardSettingsSecurityTab;
