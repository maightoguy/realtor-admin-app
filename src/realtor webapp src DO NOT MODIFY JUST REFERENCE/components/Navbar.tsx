import { Link } from "react-router-dom";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";
import { Menu } from "lucide-react";
import { useState } from "react";
import LandingMobileMenuModal from "./LandingMobileMenuModal";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <nav
      className="
        flex items-center justify-between
        px-4 py-4 md:px-28
       bg-white shadow-md
        fixed top-0 left-0 w-full z-50
      "
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link to="/">
          <img
            src={VeriplotLogo}
            alt="Veriplot logo"
            className="h-8 w-auto md:h-9"
          />
        </Link>
      </div>

      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden text-gray-700 hover:text-gray-900 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Render the Landing Mobile Menu Modal */}
      <LandingMobileMenuModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="hidden md:flex items-center gap-6">
        {/* Login + Create Account buttons */}

        <div className="flex items-center gap-3 ml-6">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 bg-[#6500AC] text-white rounded-lg shadow hover:bg-purple-800 font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800 transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
