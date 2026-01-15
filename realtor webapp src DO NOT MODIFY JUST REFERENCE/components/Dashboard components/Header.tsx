// src/components/Dashboard components/Header.tsx (updated with backend integration only)
import { useEffect, useState } from "react";
import { Menu, Wallet, Bell, Eye, EyeOff } from "lucide-react";

import NotificationModal from "./NotificationModal";
import MobileMenuModal from "./MobileMenuModal";
import ProfileModal from "./ProfileModal";
import VeriplotLogo from "../../assets/Veriplot Primary logo 2.svg";

import { useUser } from "../../context/UserContext"; // Add this import for Supabase user data
import fallbackProfile from "../../assets/Default Profile pic.png"; // Use existing asset as fallback
import { transactionService } from "../../services/transactionService";
import { notificationService } from "../../services/apiService";
import { authService } from "../../services/authService";
import { getSupabaseClient } from "../../services/supabaseClient";
import { Link } from "react-router-dom";
import { authManager } from "../../services";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onHelpCenterClick?: () => void;
  onKYCClick?: () => void;
  onProfileClick?: () => void;
}

const Header = ({
  activeSection,
  onSectionChange,
  onHelpCenterClick,
  onKYCClick,
  onProfileClick,
}: HeaderProps) => {
  const { user } = useUser(); // Use context for dynamic user data from Supabase

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const formatCurrency = (value: number) => {
    if (!Number.isFinite(value)) return "₦0";
    return `₦${Math.round(value).toLocaleString()}`;
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!user?.id) {
        setCurrentBalance(0);
        setUnreadNotifications(0);
        return;
      }

      try {
        const [metrics, unreadCount] = await Promise.all([
          transactionService.getMetrics(user.id),
          notificationService.getUnreadCount(user.id),
        ]);

        if (cancelled) return;

        setCurrentBalance(metrics.currentBalance ?? 0);
        setUnreadNotifications(unreadCount);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load header data:", error);
        // Keep previous values or set to 0? Maybe just keep quiet.
      }
    };

    void loadData();

    const handleRefresh = () => {
      void loadData();
    };

    window.addEventListener("wallet:refresh", handleRefresh);
    window.addEventListener("notification:refresh", handleRefresh);

    // Setup Realtime Subscription
    let channel: ReturnType<
      ReturnType<typeof getSupabaseClient>["channel"]
    > | null = null;

    if (user?.id) {
      const supabase = getSupabaseClient();
      channel = supabase
        .channel(`header-updates-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => void loadData()
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "commissions",
            filter: `realtor_id=eq.${user.id}`,
          },
          () => void loadData()
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "payouts",
            filter: `realtor_id=eq.${user.id}`,
          },
          () => void loadData()
        )
        .subscribe();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("wallet:refresh", handleRefresh);
      window.removeEventListener("notification:refresh", handleRefresh);
      if (channel) {
        void getSupabaseClient().removeChannel(channel);
      }
    };
  }, [user?.id]);

  /* const handleKYCClick = () => {
    onSectionChange("Settings");
    if (onKYCClick) onKYCClick();
  };

  const handleProfileClick = () => {
    onSectionChange("Settings");
    if (onProfileClick) onProfileClick();
  }; */

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-3 py-1.5 md:px-6 md:py-3 flex items-center justify-between">
          {/* Page Title (Desktop) */}
          <span className="hidden lg:inline text-lg font-semibold text-gray-900">
            {activeSection}
          </span>

          {/* Right Side Icons */}
          <div className="lg:hidden flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={VeriplotLogo}
                alt="Veriplot logo"
                className="h-3.5 w-auto md:h-5"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div
              onClick={() => onSectionChange("Transactions")}
              className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-purple-50 text-green-700 rounded-lg hover:bg-purple-100 text-xs md:text-base cursor-pointer select-none transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="max-w-[92px] truncate font-medium">
                {isBalanceVisible ? formatCurrency(currentBalance) : "****"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBalanceVisible(!isBalanceVisible);
                }}
                className="ml-1 p-0.5 hover:bg-purple-200 rounded-full focus:outline-none transition-colors"
                title={isBalanceVisible ? "Hide balance" : "Show balance"}
              >
                {isBalanceVisible ? (
                  <EyeOff className="w-3 h-3 md:w-3.5 md:h-3.5" />
                ) : (
                  <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                )}
              </button>
            </div>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full relative"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Profile Avatar - Integrated with Supabase */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hidden md:block w-8 h-8 rounded-full overflow-hidden border border-gray-200"
            >
              <img
                src={user?.avatar_url || fallbackProfile} // Dynamic avatar from Supabase user profile
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-full"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <MobileMenuModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onNotificationClick={() => setIsNotificationOpen(true)}
        onHelpCenterClick={onHelpCenterClick}
        onKYCClick={onKYCClick}
        onLogout={async () => {
          await authService.signOut();
          authManager.clearUser();
          authManager.clearSession();
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={async () => {
          await authService.signOut();
          authManager.clearUser();
          authManager.clearSession();
        }}
        onProfileClick={() => {
          setIsProfileOpen(false);
          if (onProfileClick) {
            onProfileClick();
          }
        }}
      />

      {/* Page Title (Mobile) */}
      <div className="mx-3 my-2 md:m-4">
        <span className="md:hidden text-base font-semibold text-gray-900">
          {activeSection}
        </span>
      </div>
    </>
  );
};

export default Header;
