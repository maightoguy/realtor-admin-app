import { Menu, Calendar, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import DefaultProfilePic from "../assets/Default Profile pic.png";
import NotificationModal from "../components/Admin Dashboard components/NotificationModal";
import { notificationService } from "../services/apiService";
import { getSupabaseClient } from "../services/supabaseClient";
import type { User } from "../services/types";
import { useNotifications } from "../services/useNotifications";

interface HeaderProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
  onProfileClick?: () => void;
  isAddPropertyFormActive?: boolean;
  user?: User | null;
}

const AdminDashboardHeader = ({
  activeSection,
  onProfileClick,
  isAddPropertyFormActive = false,
  user,
}: HeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "Admin";
  const profileSrc = user?.avatar_url ? user.avatar_url : DefaultProfilePic;

  const resolveUserId = async () => {
    if (user?.id) return user.id;
    const { data } = await getSupabaseClient().auth.getSession();
    return data.session?.user?.id ?? null;
  };

  const refreshUnreadCount = async () => {
    const id = resolvedUserId ?? (await resolveUserId());
    if (!id) return; 
    const count = await notificationService.getAdminActionUnreadCount({
      userId: id,
    });
    setUnreadCount(count);
  };

  useEffect(() => {
    resolveUserId()
      .then((id) => setResolvedUserId(id))
      .catch(() => setResolvedUserId(null));
  }, [user?.id]);

  const { inserts } = useNotifications({
    userId: resolvedUserId ?? undefined,
    enabled: Boolean(resolvedUserId),
  });

  useEffect(() => {
    if (!resolvedUserId) return;
    if (inserts.length === 0) return;
    refreshUnreadCount().catch(() => {});
  }, [inserts.length, resolvedUserId]);

  useEffect(() => {
    refreshUnreadCount().catch(() => {});
  }, [resolvedUserId]);

  useEffect(() => {
    if (!isNotificationOpen) {
      refreshUnreadCount().catch(() => {});
    }
  }, [isNotificationOpen]);

  return (
    <>
      <header className="flex justify-between items-center px-6 py-5 bg-white shadow-sm relative z-10">
        {/* Left - Welcome message */}
        <div className="flex items-center gap-4">
          {activeSection === "Overview" ? (
            <span className="text-lg font-semibold text-gray-900">
              Welcome back, {displayName || "Admin"}
            </span>
          ) : activeSection === "Properties" && isAddPropertyFormActive ? (
            <span className="text-lg text-gray-900">
              <span className="text-gray-500 font-normal">Properties</span>
              <span className="text-black font-semibold">/Add Property</span>
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              {activeSection}
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Date */}
          <div className="flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 font-semibold px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>

          {/* Desktop: Notification + Profile */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="text-gray-600 hover:text-gray-800 relative"
            >
              <Bell className="w-5 h-5" />
              {/* Unread notification dot */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            <button
              onClick={onProfileClick}
              className="rounded-full overflow-hidden border border-gray-200 w-8 h-8 hover:ring-2 hover:ring-gray-300 transition-all"
            >
              <img
                src={profileSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>

          {/* Mobile: Menu icon */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Render the Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userId={user?.id ?? null}
      />
    </>
  );
};

export default AdminDashboardHeader;
