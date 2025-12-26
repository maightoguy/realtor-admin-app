// src/components/Dashboard components/Header.tsx (updated with backend integration only)
import { useEffect, useState } from "react";
import { Menu, Wallet, Bell } from "lucide-react";
import VeriplotLogo from "../../assets/Veriplot Primary logo 2.svg";
import NotificationModal from "./NotificationModal";
import MobileMenuModal from "./MobileMenuModal";
import ProfileModal from "./ProfileModal";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Add this import for Supabase user data
import fallbackProfile from "../../assets/Default Profile pic.png"; // Use existing asset as fallback
import { transactionService } from "../../services/transactionService";
import { notificationService } from "../../services/apiService";

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
  // onKYCClick,
  onProfileClick,
}: HeaderProps) => {
  const { user } = useUser(); // Use context for dynamic user data from Supabase

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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
    // Add a custom event listener for notification refresh if needed
    window.addEventListener("notification:refresh", handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("wallet:refresh", handleRefresh);
      window.removeEventListener("notification:refresh", handleRefresh);
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
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={VeriplotLogo}
              alt="Veriplot logo"
              className="h-6 w-auto"
            />
          </Link>
          {/* Page Title (Desktop) */}
          <span className="hidden sm:inline text-lg font-semibold text-gray-900">
            {activeSection}
          </span>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-green-700 rounded-lg hover:bg-purple-100">
              <Wallet className="w-4 h-4" />
              {formatCurrency(currentBalance)}
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
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
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu className="w-5 h-5 text-gray-600" />
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
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={() => {
          // TODO: Implement logout functionality
        }}
        onProfileClick={() => {
          setIsProfileOpen(false);
          if (onProfileClick) {
            onProfileClick();
          }
        }}
      />

      {/* Page Title (Mobile) */}
      <div className="m-4">
        <span className="md:hidden text-lg font-semibold text-gray-900">
          {activeSection}
        </span>
      </div>
    </>
  );
};

export default Header;
