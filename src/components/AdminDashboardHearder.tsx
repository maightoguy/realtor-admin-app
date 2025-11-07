import { Menu, Calendar, Bell } from "lucide-react";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";
import ProfilePic from "../assets/Profile 1.jpg";
import { Link } from "react-router-dom";

interface HeaderProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
  onProfileClick?: () => void;
}

const AdminDashboardHeader = ({
  activeSection,
  onProfileClick,
}: HeaderProps) => {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="flex justify-between items-center px-6 py-5 bg-white shadow-sm relative z-10">
        {/* Left - Welcome message */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-900">
            Welcome back, Admin
          </span>
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
            <button className="text-gray-600 hover:text-gray-800 relative">
              <Bell className="w-5 h-5" />
              {/* Unread notification dot */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button
              onClick={onProfileClick}
              className="rounded-full overflow-hidden border border-gray-200 w-8 h-8 hover:ring-2 hover:ring-gray-300 transition-all"
            >
              <img
                src={ProfilePic}
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
    </>
  );
};

export default AdminDashboardHeader;
