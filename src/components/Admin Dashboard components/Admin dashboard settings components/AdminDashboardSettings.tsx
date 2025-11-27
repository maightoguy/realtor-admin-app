import { useState, useRef } from "react";
import { Eye, EyeOff, Camera, User } from "lucide-react";

const AdminDashboardSettings = () => {
  const [activeTab, setActiveTab] = useState<"Profile" | "Security">("Profile");
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "Veriplot@mail.com",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityInputChange = (field: string, value: string) => {
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

  const handleSaveProfileChanges = () => {
    console.log("Saving profile changes:", formData);
    if (avatarFile) {
      console.log("Avatar file to upload:", avatarFile);
      // Here you would typically upload the file to your backend
    }
    alert("Profile changes saved successfully!");
  };

  const handleSaveSecurityChanges = () => {
    // Validate passwords
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (securityData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    console.log("Saving security changes");
    // Here you would typically make an API call to update the password
    alert("Password updated successfully!");

    // Reset form
    setSecurityData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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

          {/* Avatar Section */}
          <div className="flex flex-col items-start space-y-3">
            <div className="relative">
              <button
                onClick={handleAvatarClick}
                className="relative group cursor-pointer"
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
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSaveProfileChanges}
              className="px-6 py-3 bg-[#6500AC] text-white font-medium rounded-lg hover:bg-[#4A14C7] transition-colors"
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
                  value={securityData.oldPassword}
                  onChange={(e) =>
                    handleSecurityInputChange("oldPassword", e.target.value)
                  }
                  placeholder="Input old Password"
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
                  value={securityData.newPassword}
                  onChange={(e) =>
                    handleSecurityInputChange("newPassword", e.target.value)
                  }
                  placeholder="Input new Password"
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
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    handleSecurityInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Enter Password again"
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
              onClick={handleSaveSecurityChanges}
              disabled={!isSecurityFormValid}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                isSecurityFormValid
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
