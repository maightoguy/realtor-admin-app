import { useState } from "react";
import { ChevronRight } from "lucide-react";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";
import ProfilePic from "../assets/Profile 1.jpg";
import AdminDashboardHeader from "../components/AdminDashboardHearder.tsx";

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

import { Link } from "react-router-dom";
import OverviewIcon from "../components/icons/OverviewIcon.tsx";

const AdminDashboardPage = () => {
  const [activeSection, setActiveSection] = useState("Overview");

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleProfileClick = () => {
    setActiveSection("Settings");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Overview":
        return <AdminDashboardOverview />;
      case "Properties":
        return <AdminDashboardProperties />;
      case "Receipts":
        return <AdminDashboardReceipts />;
      case "Realtors":
        return <AdminDashboardRealtors />;

      case "Transactions":
        return <AdminDashboardTransactions />;
      case "Notifications":
        return <AdminDashboardNotifications />;
      case "Referrals":
        return <AdminDashboardReferrals />;

      case "Settings":
        return <AdminDashboardSettings />;
      default:
        return null;
    }
  };

  const getIconComponent = (
    item: string,
    isActive: boolean,
    isHovered: boolean
  ) => {
    const color = isActive || isHovered ? "#5E17EB" : "#9CA1AA";
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
              "Learn",
              "Settings",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item)}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center gap-3 text-left group transition-colors duration-200 ${
                  activeSection === item
                    ? "font-semibold text-[#5E17EB]"
                    : "hover:text-[#5E17EB]"
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
                src={ProfilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Olivia Rhye</p>
              <p className="text-xs text-gray-500">Super-admin</p>
            </div>
          </div>
          <button
            onClick={handleProfileClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <AdminDashboardHeader
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onProfileClick={handleProfileClick}
        />
        <div className="p-0">{renderSection()}</div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
