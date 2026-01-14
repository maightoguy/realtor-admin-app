import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";
import DefaultProfilePic from "../assets/Default Profile pic.png";
import AdminDashboardHeader from "../components/AdminDashboardHearder.tsx";
import { authManager } from "../services/authManager";
import { authService } from "../services/authService";
import type { User } from "../services/types";
import { logger } from "../utils/logger";
import Loader from "../components/Loader";
import { userService } from "../services/apiService";

// Icons
import ReceiptsIcon from "../components/icons/ReceiptsIcon.tsx";
import TransactionsIcon from "../components/icons/TransactionsIcon.tsx";
import ReferralsIcon from "../components/icons/ReferralsIcon.tsx";
import NotificationBellIcon from "../components/icons/NotificationBellIcon.tsx";
import SettingIcon from "../components/icons/SettingIcon.tsx";
import IslandIcon from "../components/icons/IslandIcon.tsx"; // PropertiesIcon
import RealtorIcon from "../components/icons/RealtorsIcon.tsx";

// Each section
import AdminDashboardOverview from "../components/Admin Dashboard components/Admin dashboard overview components/AdminDashboardOverview.tsx";
import AdminDashboardProperties from "../components/Admin Dashboard components/Admin dashboard properties components/AdminDashboardProperties.tsx";
import AdminDashboardReceipts from "../components/Admin Dashboard components/Admin dashboard receipts components/AdminDashboardReceipts.tsx";
import AdminDashboardRealtors from "../components/Admin Dashboard components/Admin dashboard realtors components/AdminDashboardRealtors.tsx";
import AdminDashboardTransactions from "../components/Admin Dashboard components/Admin dashboard transactions components/AdminDashboardTransactions.tsx";
import AdminDashboardNotifications from "../components/Admin Dashboard components/Admin dashboard notifications components/AdminDashboardNotifications.tsx";
import AdminDashboardReferrals from "../components/Admin Dashboard components/Admin dashboard referrals components/AdminDashboardReferrals.tsx";
import AdminDashboardSettings from "../components/Admin Dashboard components/Admin dashboard settings components/AdminDashboardSettings.tsx";

import { Link, useLocation, useNavigate } from "react-router-dom";
import OverviewIcon from "../components/icons/OverviewIcon.tsx";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("Overview");
  const [isAddPropertyFormActive, setIsAddPropertyFormActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    authManager.getUser()
  );
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const refreshInFlightRef = useRef(false);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Use idle timeout hook (15 minutes)
  useIdleTimeout(15 * 60 * 1000);

  const refreshSessionAndUser = useCallback(
    async (reason: string) => {
      if (refreshInFlightRef.current) return;
      refreshInFlightRef.current = true;

      // Only block if we don't have a user cached (optimistic UI)
      if (!authManager.getUser()) {
        setIsCheckingSession(true);
      }

      try {
        logger.info("[ADMIN] Checking session", { reason });
        const { data, error } = await authService.getSession();
        if (error) throw error;
        const sessionUserId = data.session?.user?.id ?? null;
        if (!sessionUserId) {
          authManager.clearUser();
          setCurrentUser(null);
          navigate("/login", { replace: true });
          return;
        }

        const profile = await userService.getById(sessionUserId);
        if (!profile || profile.role !== "admin") {
          await authService.signOut();
          authManager.clearUser();
          setCurrentUser(null);
          navigate("/login", { replace: true });
          return;
        }

        authManager.saveUser(profile);
        setCurrentUser(profile);
      } catch (err) {
        logger.error("[ADMIN] Failed to check session", { reason, err });
      } finally {
        setIsCheckingSession(false);
        refreshInFlightRef.current = false;
      }
    },
    [navigate]
  );

  useEffect(() => {
    // Initial session check on mount
    refreshSessionAndUser("mount").catch(() => {});

    const { data } = authService.onAuthStateChange((event) => {
      // ONLY refresh profile on SIGNED_IN (explicit login)
      if (event === "SIGNED_IN") {
        refreshSessionAndUser(`auth_${event}`).catch(() => {});
      }
      // ONLY clear data on SIGNED_OUT
      if (event === "SIGNED_OUT") {
        authManager.clearUser();
        setCurrentUser(null);
        navigate("/login", { replace: true });
      }
      // Note: TOKEN_REFRESHED and other events are ignored to prevent disrupting active workflows
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [navigate, refreshSessionAndUser]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawSection = params.get("section") ?? "";
    const hasReceipt = Boolean(params.get("receiptId"));
    const hasPayout = Boolean(params.get("payoutId"));
    const hasRealtor = Boolean(params.get("realtorId"));

    const normalizeSection = (value: string) => {
      const v = value.trim().toLowerCase();
      if (v === "overview") return "Overview";
      if (v === "properties") return "Properties";
      if (v === "receipts") return "Receipts";
      if (v === "realtors") return "Realtors";
      if (v === "transactions") return "Transactions";
      if (v === "notifications") return "Notifications";
      if (v === "referrals") return "Referrals";
      if (v === "settings") return "Settings";
      return null;
    };

    const next =
      normalizeSection(rawSection) ??
      (hasReceipt ? "Receipts" : null) ??
      (hasPayout ? "Transactions" : null) ??
      (hasRealtor ? "Realtors" : null);

    if (next && next !== activeSection) {
      setActiveSection(next);
      if (next !== "Properties") setIsAddPropertyFormActive(false);
    }
  }, [location.search, activeSection]);

  const handleProfileClick = () => {
    setActiveSection("Settings");
  };

  const handleLogoutClick = async () => {
    logger.info("[ADMIN] Logout clicked");
    try {
      await authService.signOut();
    } finally {
      authManager.clearUser();
      navigate("/login", { replace: true, state: { loggedOut: true } });
    }
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section !== "Properties") {
      setIsAddPropertyFormActive(false);
    }
  };

  const renderSection = () => {
    let content: ReactNode = null;
    switch (activeSection) {
      case "Overview":
        content = <AdminDashboardOverview />;
        break;
      case "Properties":
        content = (
          <AdminDashboardProperties
            onAddFormStateChange={setIsAddPropertyFormActive}
          />
        );
        break;
      case "Receipts":
        content = <AdminDashboardReceipts />;
        break;
      case "Realtors":
        content = (
          <AdminDashboardRealtors
            onNavigateToProperties={() => handleNavigate("Properties")}
            onNavigateToReceipts={() => handleNavigate("Receipts")}
            onNavigateToTransactions={() => handleNavigate("Transactions")}
            onNavigateToReferrals={() => handleNavigate("Referrals")}
          />
        );
        break;

      case "Transactions":
        content = <AdminDashboardTransactions />;
        break;
      case "Notifications":
        content = <AdminDashboardNotifications />;
        break;
      case "Referrals":
        content = <AdminDashboardReferrals />;
        break;

      case "Settings":
        content = (
          <AdminDashboardSettings
            user={currentUser}
            onUserUpdated={setCurrentUser}
          />
        );
        break;
      default:
        content = null;
    }
    return <div key={activeSection}>{content}</div>;
  };

  const getIconComponent = (
    item: string,
    isActive: boolean,
    isHovered: boolean
  ) => {
    const color = isActive || isHovered ? "#6500AC" : "#9CA1AA";
    const iconProps = { color };

    switch (item) {
      case "Overview":
        return <OverviewIcon {...iconProps} />;
      case "Properties":
        return <IslandIcon {...iconProps} />;
      case "Receipts":
        return <ReceiptsIcon {...iconProps} />;
      case "Realtors":
        return <RealtorIcon {...iconProps} />;
      case "Transactions":
        return <TransactionsIcon {...iconProps} />;
      case "Notifications":
        return <NotificationBellIcon {...iconProps} />;
      case "Referrals":
        return <ReferralsIcon {...iconProps} />;
      case "Settings":
        return <SettingIcon {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-gray-800 flex flex-col lg:flex-row">
      <Loader text="Checking session..." isOpen={isCheckingSession} />
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-[270px] bg-white border-r border-gray-100 p-6 shrink-0">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img
              src={VeriplotLogo}
              alt="Veriplot logo"
              className="h-8 w-auto"
            />
          </Link>

          <nav className="flex flex-col space-y-4 text-gray-600">
            {[
              "Overview",
              "Properties",
              "Receipts",
              "Realtors",
              "Transactions",
              "Notifications",
              "Referrals",
              "Settings",
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveSection(item);
                  if (item !== "Properties") {
                    setIsAddPropertyFormActive(false);
                  }
                }}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center gap-3 text-left group transition-colors duration-200 ${
                  activeSection === item
                    ? "font-semibold text-[#6500AC]"
                    : "hover:text-[#6500AC]"
                }`}
              >
                <span className="transition-colors duration-200">
                  {getIconComponent(
                    item,
                    activeSection === item,
                    hoveredItem === item
                  )}
                </span>
                <span>{item}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="hidden md:flex items-center gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 flex-1">
            <div className="rounded-full overflow-hidden border border-gray-200 w-10 h-10">
              <img
                src={
                  currentUser?.avatar_url
                    ? currentUser.avatar_url
                    : DefaultProfilePic
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {currentUser
                  ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
                  : "Admin"}
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <AdminDashboardHeader
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onProfileClick={handleProfileClick}
          isAddPropertyFormActive={isAddPropertyFormActive}
          user={currentUser}
        />
        <div className="p-0">{renderSection()}</div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
