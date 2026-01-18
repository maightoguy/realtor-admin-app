/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, Camera, User } from "lucide-react";
import { trimValues } from "../../../utils/trim";
import {
  DeleteConfirmationModal,
  FinalDeleteConfirmationModal,
} from "./DashboardDeleteModals";
import DashboardOtp from "./DashboardOtp";
import DashboardSettingsBankingTab from "./DashboardSettingsBankingTab";
import DashboardSettingsSecurityTab from "./DashboardSettingsSecurityTab";
import DashboardSettingsKYCTab from "./DashboardSettingsKYCTab";
import DashboardSettingsLegalTab from "./DashboardSettingsLegalTab";
import { authService } from "../../../services/authService";
import { userService } from "../../../services/apiService";
import { storageService } from "../../../services/storageService";
import type { Gender } from "../../../services/types";
import { logger } from "../../../utils/logger";
import { validateNigerianPhone } from "../../../utils/ngPhone";

const DashboardSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("settingsTab") || "Profile";
  const navigate = useNavigate();

  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("settingsTab", tab);
      return newParams;
    });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] =
    useState(false);
  const [formData, setFormData] = useState({
    firstName: "Enter first name",
    lastName: "Enter last name",
    phoneNumber: "Enter phone number",
    email: "Enter Email",
    gender: "Male",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("confirmDelete") === "1") {
      setShowFinalConfirmationModal(true);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("confirmDelete");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  // Fetch user profile from Supabase on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const authUser = await authService.getCurrentUser();
        if (!authUser) {
          setError("No authenticated user");
          setLoading(false);
          return;
        }
        setCurrentUserId(authUser.id);
        const profile = await userService.getById(authUser.id);
        if (!profile) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }
        setFormData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          phoneNumber: profile.phone_number || "",
          email: profile.email || "",
          gender: profile.gender
            ? profile.gender[0].toUpperCase() + profile.gender.slice(1)
            : "Male",
        });
        if (profile.avatar_url) {
          setAvatarPreview(profile.avatar_url);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    // Trim value on input change
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    setFormData((prev) => ({
      ...prev,
      [field]: trimmedValue,
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

    setAvatarFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    logger.info("[DASHBOARD SETTINGS] Starting profile save");
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        logger.info("[DASHBOARD SETTINGS] Uploading new avatar", avatarFile);
        const ext = avatarFile.name.split(".").pop();
        const uploadPath = `${currentUserId}/avatar-${Date.now()}.${ext}`;
        const bucket = "profile-avatars";
        const uploadResult = await storageService.uploadFile(
          bucket,
          uploadPath,
          avatarFile,
          { contentType: avatarFile.type, upsert: true }
        );
        logger.info("[DASHBOARD SETTINGS] Avatar uploaded", uploadResult);
        avatarUrl = storageService.getPublicUrl(bucket, uploadPath);
      }

      // Build update payload:
      const trimmedFormData = trimValues(formData);
      const normalizedGender =
        typeof trimmedFormData.gender === "string"
          ? trimmedFormData.gender.toLowerCase()
          : undefined;
      const gender: Gender | null =
        normalizedGender === "male"
          ? "male"
          : normalizedGender === "female"
          ? "female"
          : normalizedGender === "other"
          ? "other"
          : null;
      const updatePayload = {
        first_name: trimmedFormData.firstName,
        last_name: trimmedFormData.lastName,
        phone_number: (() => {
          const phoneResult = validateNigerianPhone(
            String(trimmedFormData.phoneNumber ?? "")
          );
          if (!phoneResult.valid) {
            throw new Error(
              "Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)"
            );
          }
          return phoneResult.normalized;
        })(),
        gender,
        avatar_url: avatarUrl,
      };
      logger.info("[DASHBOARD SETTINGS] Saving profile with:", updatePayload);
      const newUser = await userService.update(currentUserId, updatePayload);
      logger.info("[DASHBOARD SETTINGS] Profile saved:", newUser);
      setAvatarPreview(newUser.avatar_url ?? null);
      setFormData({
        firstName: newUser.first_name || "",
        lastName: newUser.last_name || "",
        phoneNumber: newUser.phone_number || "",
        email: newUser.email || "",
        gender: newUser.gender
          ? newUser.gender[0].toUpperCase() + newUser.gender.slice(1)
          : "Male",
      });
      setAvatarFile(null);
      // You can display a success state to the user here (toast/snackbar etc)
    } catch (e: any) {
      logger.error("[DASHBOARD SETTINGS] Failed to save profile:", e);
      setError(e?.message || "Failed to save profile");
    }
    setLoading(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setShowOTPModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleSendDeletionEmail = async () => {
    if (!formData.email) {
      throw new Error("No email address found");
    }
    const { error } = await authService.sendAccountDeletionEmail(
      formData.email
    );
    if (error) {
      throw error;
    }
  };

  const handleCancelOTP = () => {
    setShowOTPModal(false);
  };

  const handleFinalConfirmDelete = async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      await authService.markCurrentUserDeleted();
      try {
        await userService.delete(currentUserId);
      } catch (e: any) {
        logger.error("[DASHBOARD SETTINGS] Failed to delete user profile:", e);
      }
      await authService.signOut();
      setShowFinalConfirmationModal(false);
      navigate("/login", { replace: true });
    } catch (e: any) {
      logger.error("[DASHBOARD SETTINGS] Failed to delete account:", e);
      setError(e?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFinalDelete = () => {
    setShowFinalConfirmationModal(false);
  };

  const settingsTabs = ["Profile", "Bank details", "Security", "KYC", "Legal"];

  return (
    <div className="px-3 py-3 md:px-6 md:py-6 space-y-4 md:space-y-6">
      {/* Settings Tabs */}
      <div className="border-b border-[#EAECF0]">
        <div className="flex overflow-x-auto scrollbar-hide">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? "border-[#6500AC] text-[#6500AC]"
                  : "border-transparent text-[#667085] hover:text-[#6500AC] hover:border-[#6500AC]/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === "Profile" && (
        <div className="bg-white border border-[#EAECF0] rounded-lg p-3 md:p-6 space-y-4 md:space-y-6">
          {/* Profile Header */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-[#0A1B39] mb-1 md:mb-2">
              Profile
            </h2>
            <p className="text-[#667085] text-xs md:text-sm">
              Your personal Information appears here
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-start space-y-2 md:space-y-3">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F0E6F7] rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 md:w-10 md:h-10 text-[#6500AC]" />
                )}
              </div>
              <button
                onClick={handleCameraClick}
                className="absolute -bottom-1 -right-1 bg-[#6500AC] text-white rounded-full p-1 hover:bg-[#5C009D] transition-colors"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[#667085] text-xs md:text-sm">
              Click to change image
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          {loading && <div className="text-center py-4">Loading...</div>}
          {error && (
            <div className="text-center py-2 text-red-500">{error}</div>
          )}
          {!loading && !error && (
            <div className="text-center py-2 text-green-600">
              Profile saved successfully!
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0A1B39]">
                First name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0A1B39]">
                Last name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0A1B39]">
                Phone number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g 08012345678"
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0A1B39]">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                aria-readonly="true"
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none bg-gray-50 text-gray-700"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-[#0A1B39]">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent appearance-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA1AA] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3 bg-[#FEE2E2] text-[#DC2626] font-medium rounded-lg hover:bg-[#FECACA] transition-colors"
            >
              Delete account
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-6 py-3 bg-[#6500AC] text-white font-medium rounded-lg hover:bg-[#5C009D] transition-colors"
              disabled={loading} // disable while loading
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {/* Bank Account Tab Content */}
      {activeTab === "Bank details" && <DashboardSettingsBankingTab />}

      {/* Security Tab Content */}
      {activeTab === "Security" && <DashboardSettingsSecurityTab />}

      {/* KYC Tab Content */}
      {activeTab === "KYC" && <DashboardSettingsKYCTab />}

      {/* Legal Tab Content */}
      {activeTab === "Legal" && <DashboardSettingsLegalTab />}

      {/* Other Tabs Content */}
      {activeTab !== "Profile" &&
        activeTab !== "Bank details" &&
        activeTab !== "Security" &&
        activeTab !== "KYC" &&
        activeTab !== "Legal" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F0E6F7] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#6500AC]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1B39] mb-2">
              {activeTab} Settings
            </h3>
            <p className="text-[#667085]">
              {activeTab} settings will be available soon.
            </p>
          </div>
        )}

      {/* Delete Account Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* OTP Verification Modal */}
      <DashboardOtp
        isOpen={showOTPModal}
        onClose={handleCancelOTP}
        onConfirm={handleSendDeletionEmail}
        email={formData.email}
      />

      {/* Final Delete Confirmation Modal */}
      <FinalDeleteConfirmationModal
        isOpen={showFinalConfirmationModal}
        onClose={handleCancelFinalDelete}
        onConfirm={handleFinalConfirmDelete}
      />
    </div>
  );
};

export default DashboardSettings;
