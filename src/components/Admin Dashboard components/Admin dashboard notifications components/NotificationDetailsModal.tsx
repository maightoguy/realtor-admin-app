import { useEffect, useState } from "react";
import { X } from "lucide-react";
import NotificationBellIcon from "../../icons/NotificationBellIcon";
import type { Notification } from "./AdminNotificationsData";

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  onResend?: (notificationId: string) => void;
}

const NotificationDetailsModal = ({
  isOpen,
  onClose,
  notification,
  onResend,
}: NotificationDetailsModalProps) => {
  const [isUserDisplayExpanded, setIsUserDisplayExpanded] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setIsUserDisplayExpanded(false);
  }, [isOpen, notification?.id]);

  if (!isOpen || !notification) return null;

  const getStatusColor = (status: Notification["status"]) => {
    switch (status) {
      case "Sent":
        return "bg-[#E9F9EF] text-[#22C55E]";
      case "Failed":
        return "bg-[#FDECEC] text-[#EF4444]";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusDotColor = (status: Notification["status"]) => {
    switch (status) {
      case "Sent":
        return "#22C55E";
      case "Failed":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  // Get display text for users
  const getUserDisplayText = () => {
    if (!notification.userType) return "All Users";
    if (notification.selectedUsers && notification.selectedUsers.length > 0) {
      if (notification.selectedUsers.length === 1) {
        return notification.selectedUsers[0];
      }
      if (notification.selectedUsers.length <= 3) {
        return notification.selectedUsers.join(", ");
      }
      return `${notification.selectedUsers.length} users selected`;
    }
    return notification.userType === "All Users"
      ? "All Users"
      : `All ${notification.userType.toLowerCase()}`;
  };

  const handleResend = () => {
    if (onResend) {
      onResend(notification.id);
    }
    onClose();
  };

  const userDisplayText = getUserDisplayText();
  const isLikelyUserId = (() => {
    const text = userDisplayText.trim();
    if (text.length < 20) return false;
    if (text.includes("users selected")) return false;
    if (text.includes("All ")) return false;
    if (text.includes(",") || text.includes(" ")) return false;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text))
      return true;
    if (/^[a-z0-9_-]{20,}$/i.test(text)) return true;
    return false;
  })();

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-[#F0F1F2]">
            <div className="flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <NotificationBellIcon color="#000000" className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Notification details
                </h2>
                <p className="text-sm text-gray-600">
                  This contain the details of your notification
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(
                    notification.status
                  )}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: getStatusDotColor(notification.status),
                    }}
                  ></span>
                  {notification.status.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={notification.title}
                readOnly
                className="w-full px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 bg-white cursor-not-allowed"
              />
            </div>

            {/* User Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <div className="relative">
                <div className="w-full px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 bg-white flex items-center justify-between cursor-not-allowed">
                  {isLikelyUserId ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setIsUserDisplayExpanded((prev) => !prev)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsUserDisplayExpanded((prev) => !prev);
                        }
                      }}
                      className={`block w-full cursor-pointer select-text ${
                        isUserDisplayExpanded
                          ? "break-all whitespace-normal"
                          : "truncate whitespace-nowrap"
                      }`}
                      title={userDisplayText}
                    >
                      {userDisplayText}
                    </span>
                  ) : (
                    <span>{userDisplayText}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Body Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body
              </label>
              <textarea
                value={notification.message}
                readOnly
                rows={8}
                className="w-full px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 bg-white cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-[#F0F1F2] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="flex-1 px-4 py-3 bg-[#6500AC] text-white rounded-lg text-sm font-medium hover:bg-[#4A14C7] transition-colors"
            >
              Resend notification
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDetailsModal;
