import { useState } from "react";
import { X, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Add this import
import fallbackProfile from "../../assets/Default Profile pic.png"; // Use existing asset as fallback

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

const ProfileModal = ({
  isOpen,
  onClose,
  onLogout,
  onProfileClick,
}: ProfileModalProps) => {
  const { user, loading } = useUser(); // Use context
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;
  if (loading) return <div>Loading...</div>; // Or skeleton

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    setShowLogoutConfirm(false);
    onClose();
    navigate("/login"); // Or wherever after logout
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div
        className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[280px] max-w-[320px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <img
                src={user?.avatar_url || fallbackProfile} // Dynamic avatar
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {user ? `${user.first_name} ${user.last_name}` : "John Doe"}{" "}
                {/* Dynamic name */}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {user?.email || "ookon@veriplot.com"} {/* Dynamic email */}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              if (onProfileClick) onProfileClick();
            }}
            className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          ></button>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {/* My Profile */}
          <button
            onClick={onProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm md:text-base text-gray-900">My profile</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-1" />

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
            <span className="text-sm md:text-base text-gray-900">Log-out</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors z-10"
            >
              <X className="w-6 h-6 text-[#717680]" />
            </button>

            {/* Modal Content */}
            <div className="p-6 pb-4">
              {/* Featured Icon */}
              <div className="w-12 h-12 bg-white border border-[#E9EAEB] rounded-[10px] shadow-sm flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-[#EF4444] rounded-sm flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Text and Supporting Text */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-black leading-6 mb-1">
                  Log-out
                </h3>
                <p className="text-sm text-[#6B7280] leading-[21px]">
                  Are you sure you want to log-out from your account?
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-11 bg-white border border-[#D5D7DA] text-[#414651] rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-medium text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-11 bg-[#EF4444] text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors font-medium text-base"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
