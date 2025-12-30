import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Camera, User } from "lucide-react";
import {
  profileAvatarService,
  userService,
} from "../../../services/apiService";
import type { User as DbUser } from "../../../services/types";
import { authManager } from "../../../services/authManager";
import { authService } from "../../../services/authService";
import { getSupabaseClient } from "../../../services/supabaseClient";
import { logger } from "../../../utils/logger";

interface AdminDashboardSettingsProps {
  user: DbUser | null;
  onUserUpdated?: (user: DbUser) => void;
}

const AdminDashboardSettings = ({
  user,
  onUserUpdated,
}: AdminDashboardSettingsProps) => {
  const [activeTab, setActiveTab] = useState<"Profile" | "Security">("Profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setProfileError(null);
    setProfileSuccess(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityInputChange = (field: string, value: string) => {
    setSecurityError(null);
    setSecurityData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    setProfileError(null);
    setProfileSuccess(null);
    setAvatarFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    setIsProfileLoading(true);
    setProfileError(null);

    userService
      .getById(user.id)
      .then(async (fresh: DbUser | null) => {
        if (cancelled) return;
        const baseEmail = fresh?.email ?? user.email ?? "";
        const email =
          baseEmail ||
          (await getSupabaseClient().auth.getUser()).data.user?.email ||
          "";

        setFormData({
          firstName: fresh?.first_name || user.first_name || "",
          lastName: fresh?.last_name || user.last_name || "",
          email,
        });
        setAvatarPreview(fresh?.avatar_url ?? user.avatar_url ?? null);
      })
      .catch((e: unknown) => {
        logger.error("[ADMIN][SETTINGS] Failed to load profile", { error: e });
        if (cancelled) return;
        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
        });
        setAvatarPreview(user.avatar_url ?? null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    user?.avatar_url,
    user?.email,
    user?.first_name,
    user?.id,
    user?.last_name,
  ]);

  useEffect(() => {
    if (!profileSuccess) return;
    const timer = window.setTimeout(() => setProfileSuccess(null), 5000);
    return () => window.clearTimeout(timer);
  }, [profileSuccess]);

  useEffect(() => {
    if (!securitySuccess) return;
    const timer = window.setTimeout(() => setSecuritySuccess(null), 5000);
    return () => window.clearTimeout(timer);
  }, [securitySuccess]);

  const handleSaveProfileChanges = async () => {
    if (!user?.id) return;
    setIsProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
      }

      let avatarUrl = avatarPreview;
      if (avatarFile) {
        avatarUrl = await profileAvatarService.uploadForUser(
          user.id,
          avatarFile
        );
      }

      const updated = await userService.update(user.id, {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl ?? null,
      });

      authManager.saveUser(updated);
      onUserUpdated?.(updated);

      setAvatarPreview(updated.avatar_url ?? null);
      setAvatarFile(null);
      setFormData((prev) => ({
        ...prev,
        firstName: updated.first_name || "",
        lastName: updated.last_name || "",
        email: prev.email,
      }));
      setProfileSuccess("Profile updated successfully");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save profile";
      logger.error("[ADMIN][SETTINGS] Save profile failed", { message });
      setProfileError(message);
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleSaveSecurityChanges = async () => {
    setIsSecuritySaving(true);
    setSecurityError(null);
    setSecuritySuccess(null);

    try {
      if (securityData.newPassword !== securityData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (securityData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const email =
        formData.email.trim() ||
        user?.email?.trim() ||
        (await getSupabaseClient().auth.getUser()).data.user?.email ||
        "";

      if (!email) {
        throw new Error("Missing email. Please refresh and try again.");
      }

      const signInResult = await authService.signInWithPassword(
        email,
        securityData.oldPassword
      );
      if (signInResult.error) {
        throw new Error("Old password is incorrect");
      }

      const updateResult = await authService.updatePassword(
        securityData.newPassword
      );
      if (updateResult.error) {
        throw updateResult.error;
      }

      setSecurityData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setSecuritySuccess("Password updated successfully");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to update password";
      logger.error("[ADMIN][SETTINGS] Save password failed", { message });
      setSecurityError(message);
    } finally {
      setIsSecuritySaving(false);
    }
  };

  const isSecurityFormValid =
    securityData.oldPassword.length > 0 &&
    securityData.newPassword.length >= 8 &&
    securityData.confirmPassword.length >= 8 &&
    securityData.newPassword === securityData.confirmPassword;

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#F0F1F2]">
          <button
            onClick={() => setActiveTab("Profile")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "Profile"
                ? "text-[#6500AC] border-[#6500AC]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("Security")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "Security"
                ? "text-[#6500AC] border-[#6500AC]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === "Profile" && (
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 space-y-6">
          {/* Profile Header */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Profile
            </h2>
          </div>

          <div className="min-h-12">
            {profileSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                {profileSuccess}
              </div>
            ) : profileError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {profileError}
              </div>
            ) : null}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-start space-y-3">
            <div className="relative">
              <button
                onClick={handleAvatarClick}
                className="relative group cursor-pointer"
                disabled={isProfileLoading || isProfileSaving}
              >
                <div className="w-20 h-20 bg-[#F0E6F7] rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#6500AC] transition-colors">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-10 h-10 text-[#6500AC]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#6500AC] text-white rounded-full p-1.5 hover:bg-[#4A14C7] transition-colors">
                  <Camera className="w-3 h-3" />
                </div>
              </button>
            </div>
            <p className="text-sm text-gray-600">Click to change image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                First name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={isProfileLoading || isProfileSaving}
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Last name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={isProfileLoading || isProfileSaving}
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-900">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                readOnly
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                void handleSaveProfileChanges();
              }}
              disabled={!user?.id || isProfileLoading || isProfileSaving}
              className="px-6 py-3 bg-[#6500AC] text-white font-medium rounded-lg hover:bg-[#4A14C7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* Security Tab Content */}
      {activeTab === "Security" && (
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 space-y-6">
          {/* Security Header */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Security
            </h2>
          </div>

          <div className="min-h-12">
            {securitySuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                {securitySuccess}
              </div>
            ) : securityError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {securityError}
              </div>
            ) : null}
          </div>

          {/* Password Change Form */}
          <div className="space-y-4">
            {/* Old Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Old password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="admin-old-password"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={securityData.oldPassword}
                  onChange={(e) =>
                    handleSecurityInputChange("oldPassword", e.target.value)
                  }
                  placeholder="Input old Password"
                  disabled={isSecuritySaving}
                  className="w-full px-4 py-3 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showOldPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="admin-new-password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}
                  value={securityData.newPassword}
                  onChange={(e) =>
                    handleSecurityInputChange("newPassword", e.target.value)
                  }
                  placeholder="Input new Password"
                  disabled={isSecuritySaving}
                  className="w-full px-4 py-3 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {securityData.newPassword &&
                securityData.newPassword.length < 8 && (
                  <p className="text-xs text-red-600">
                    Password must be at least 8 characters long
                  </p>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="admin-confirm-password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    handleSecurityInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Enter Password again"
                  disabled={isSecuritySaving}
                  className="w-full px-4 py-3 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {securityData.confirmPassword &&
                securityData.newPassword !== securityData.confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                void handleSaveSecurityChanges();
              }}
              disabled={!isSecurityFormValid || isSecuritySaving}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                isSecurityFormValid && !isSecuritySaving
                  ? "bg-[#6500AC] text-white hover:bg-[#4A14C7]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardSettings;
