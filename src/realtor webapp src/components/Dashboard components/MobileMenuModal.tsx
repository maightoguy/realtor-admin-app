import { X, ChevronRight } from "lucide-react";
import VeriplotLogo from "../../assets/Veriplot Primary logo 2.svg";
import { useUser } from "../../context/UserContext"; // Add this import
import fallbackProfile from "../../assets/Default Profile pic.png"; // Use existing asset as fallback

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNotificationClick: () => void;
  onHelpCenterClick?: () => void;
  onKYCClick?: () => void;
}

const MobileMenuModal = ({
  isOpen,
  onClose,
  activeSection,
  onSectionChange,
  onHelpCenterClick,
  onKYCClick,
}: MobileMenuModalProps) => {
  const { user, loading } = useUser(); // Use context

  if (!isOpen) return null;
  if (loading) return <div>Loading...</div>; // Or skeleton

  const handleSectionClick = (section: string) => {
    onSectionChange(section);
    onClose();
  };

  const navigationItems = [
    "Properties",
    "Receipts",
    "Transactions",
    "Referrals",
    "Learn",
    "Settings",
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal - slides in from left */}
      <div
        className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl overflow-hidden transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <img
              src={VeriplotLogo}
              alt="Veriplot logo"
              className="h-8 w-auto"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Profile Section */}

          <div className="flex items-center gap-3 p-4 ml-2 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img
                src={user?.avatar_url || fallbackProfile} // Dynamic avatar
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                {user ? `${user.first_name} ${user.last_name}` : "John Doe"}{" "}
                {/* Dynamic name */}
              </p>
              <p className="text-sm text-gray-500">
                {user?.email || "ookon@veriplot.com"} {/* Dynamic email */}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSectionClick(item)}
                  className={`text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item
                      ? "bg-[#F0E6F7] text-[#5E17EB] font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#5E17EB]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-6">
            {/* KYC Card */}
            {!user?.id_document_url && (
              <div className="bg-[#FAFAFA] border border-[#F0F1F2] rounded-2xl px-6 py-6 text-center">
                <p className="text-[#0A1B39] font-bold text-sm mb-2">
                  Complete your KYC
                </p>
                <p className="text-[#83899F] text-sm mb-4">
                  You need to complete your KYC registration
                </p>
                <button
                  onClick={onKYCClick}
                  className="w-full h-10 bg-white border border-[#E6E7EC] rounded-xl text-[#0A1B39] text-sm font-medium hover:bg-gray-50 transition"
                >
                  Proceed
                </button>
              </div>
            )}

            {/* Help Center */}
            <button
              onClick={onHelpCenterClick}
              className="w-full flex items-center bg-[#FAFAFA] border border-[#F0F1F2] rounded-xl px-5 py-4 hover:bg-gray-50 transition-colors"
            >
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
              <div className="flex flex-col ml-3 flex-1 text-left">
                <p className="text-[#0A1B39] font-bold text-sm leading-[21px]">
                  Help Center
                </p>
                <p className="text-[#83899F] text-sm leading-[21px]">
                  Answers here
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuModal;
