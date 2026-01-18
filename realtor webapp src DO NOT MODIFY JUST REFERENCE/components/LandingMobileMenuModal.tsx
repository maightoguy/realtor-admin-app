import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";

interface LandingMobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LandingMobileMenuModal = ({
  isOpen,
  onClose,
}: LandingMobileMenuModalProps) => {
  const { user } = useUser();

  if (!isOpen) return null;

  const navigationItems = [
    { label: "Home", href: "/", isHash: false },
    { label: "About", href: "#about", isHash: true },
    { label: "Contact", href: "#contact", isHash: true },
  ];

  const handleLinkClick = (href: string, isHash: boolean) => {
    onClose();

    if (isHash) {
      // For hash links, scroll to the section
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100); // Small delay to ensure modal is closed
    }
  };

  const handleAuthClick = () => {
    onClose();
  };

  const handleLogoClick = () => {
    onClose();

    setTimeout(() => {
      const target = document.getElementById("home");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.location.hash !== "#home") {
          window.history.replaceState(null, "", "#home");
        }
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button type="button" onClick={handleLogoClick}>
              <img
                src={VeriplotLogo}
                alt="Veriplot logo"
                className="h-8 w-auto"
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) =>
                item.isHash ? (
                  <button
                    key={item.label}
                    onClick={() => handleLinkClick(item.href, item.isHash)}
                    className="text-left px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-[#5E17EB]"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => handleLinkClick(item.href, item.isHash)}
                    className="text-left px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-[#5E17EB]"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {/* Footer - Auth Buttons */}
          <div className="p-6 border-t border-gray-200 space-y-4">
            {user ? (
              <Link
                to="/dashboard"
                onClick={handleAuthClick}
                className="w-full block px-5 py-3 bg-[#6500AC] text-white rounded-lg shadow font-semibold text-center hover:bg-purple-800 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={handleAuthClick}
                  className="w-full block px-5 py-3 border border-gray-200 rounded-lg text-gray-600 font-semibold text-center hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={handleAuthClick}
                  className="w-full block px-5 py-3 bg-purple-700 text-white rounded-lg shadow font-semibold text-center hover:bg-purple-800 transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingMobileMenuModal;
