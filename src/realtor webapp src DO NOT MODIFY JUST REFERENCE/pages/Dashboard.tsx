import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";
import Header from "../components/Dashboard components/Header.tsx";
import { useUser } from "../context/UserContext";

// Icons
import PropertiesIcon from "../components/icons/PropertiesIcon.tsx";
import ReceiptsIcon from "../components/icons/ReceiptsIcon.tsx";
import TransactionsIcon from "../components/icons/TransactionsIcon.tsx";
import ReferralsIcon from "../components/icons/ReferralsIcon.tsx";
import LearnIcon from "../components/icons/LearnIcon.tsx";
import SettingIcon from "../components/icons/SettingIcon.tsx";

// Each section
import DashboardProperties from "../components/Dashboard components/Dashboard Property component/DashboardProperties.tsx";
import DashboardReceipts from "../components/Dashboard components/Dashboard receipts/DashboardReceipts.tsx";
import DashboardTransactions from "../components/Dashboard components/Dashboard transactions/DashboardTransactions.tsx";
import DashboardReferrals from "../components/Dashboard components/Dashboard referrals/DashboardReferrals.tsx";
import DashboardLearn from "../components/Dashboard components/Dashboard Learn/DashboardLearn.tsx";
import DashboardSettings from "../components/Dashboard components/Dashboard settings/DashboardSettings.tsx";
import HelpCenterPopup from "../components/Dashboard components/HelpCenterPopup.tsx";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("tab") || "Properties";
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user, loading } = useUser();

  const setActiveSection = (section: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", section);
      return newParams;
    });
  };

  const handleKYCClick = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", "Settings");
      newParams.set("settingsTab", "KYC");
      return newParams;
    });
  };

  const handleProfileClick = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", "Settings");
      newParams.set("settingsTab", "Profile");
      return newParams;
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Properties":
        return <DashboardProperties />;
      case "Receipts":
        return (
          <DashboardReceipts
            onGoToProperties={() => setActiveSection("Properties")}
          />
        );
      case "Transactions":
        return <DashboardTransactions />;
      case "Referrals":
        return <DashboardReferrals />;
      case "Learn":
        return <DashboardLearn />;
      case "Settings":
        return <DashboardSettings />;
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
      case "Properties":
        return <PropertiesIcon {...iconProps} />;
      case "Receipts":
        return <ReceiptsIcon {...iconProps} />;
      case "Transactions":
        return <TransactionsIcon {...iconProps} />;
      case "Referrals":
        return <ReferralsIcon {...iconProps} />;
      case "Learn":
        return <LearnIcon {...iconProps} />;
      case "Settings":
        return <SettingIcon {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-gray-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-[270px] bg-white border-r border-gray-100 p-6">
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
              "Properties",
              "Receipts",
              "Transactions",
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
        <div className="mt-auto flex flex-col items-center space-y-6 pb-6">
          {!loading && !user?.id_document_url && (
            <div className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-2xl shadow px-6 py-6 text-center">
              <p className="text-[#0A1B39] font-bold text-sm mb-2">
                Complete your KYC
              </p>
              <p className="text-[#83899F] text-sm mb-4">
                You need to complete your KYC registration
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleKYCClick}
                  className="w-[200px] h-10 bg-white border border-[#E6E7EC] rounded-xl text-[#0A1B39] text-sm font-medium hover:bg-gray-50 transition"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-xl py-4 px-3 shadow">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.9993 9.7998V12.5998C20.9993 14.085 20.4093 15.5094 19.3591 16.5596C18.3089 17.6098 16.8845 18.1998 15.3993 18.1998H13.7585L11.2861 20.6736C11.6781 20.8822 12.1247 20.9998 12.5993 20.9998H15.3993L19.5993 25.1998V20.9998H22.3993C23.1419 20.9998 23.8541 20.7048 24.3792 20.1797C24.9043 19.6546 25.1993 18.9424 25.1993 18.1998V12.5998C25.1993 11.8572 24.9043 11.145 24.3792 10.6199C23.8541 10.0948 23.1419 9.7998 22.3993 9.7998H20.9993Z"
                  fill="#799AD6"
                />
                <path
                  d="M2.7998 7.0002C2.7998 6.25759 3.0948 5.5454 3.61991 5.0203C4.14501 4.49519 4.8572 4.2002 5.5998 4.2002H15.3998C16.1424 4.2002 16.8546 4.49519 17.3797 5.0203C17.9048 5.5454 18.1998 6.25759 18.1998 7.0002V12.6002C18.1998 13.3428 17.9048 14.055 17.3797 14.5801C16.8546 15.1052 16.1424 15.4002 15.3998 15.4002H12.5998L8.3998 19.6002V15.4002H5.5998C4.8572 15.4002 4.14501 15.1052 3.61991 14.5801C3.0948 14.055 2.7998 13.3428 2.7998 12.6002V7.0002Z"
                  fill="#317BFF"
                />
              </svg>
            </div>
            <div className="flex flex-col ml-3 text-left">
              <p className="text-[#0A1B39] font-bold text-sm leading-[21px]">
                Help Center
              </p>

              <p className="text-[#83899F] text-sm leading-[21px]">
                Answers here
              </p>
            </div>
            <button onClick={() => setShowHelpCenter(true)}>
              <ChevronRight className="ml-auto w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1">
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onHelpCenterClick={() => setShowHelpCenter(true)}
          onKYCClick={handleKYCClick}
          onProfileClick={handleProfileClick}
        />
        <div className="p-0">{renderSection()}</div>
      </main>
      {/* Help Center Popup */}
      <HelpCenterPopup
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />
    </div>
  );
};

export default Dashboard;
