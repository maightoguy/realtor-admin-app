import React from "react";
import { Link } from "react-router-dom";
import VeriplotSvg from "../icons/VeriplotIcon";
import heroImage from "../../assets/Hero-background.png";
import VeriplotLogo from "../../assets/Veriplot Primary logo 2.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row md:p-6">
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src={heroImage}
          alt="Hero background"
          className="w-full h-full object-cover rounded-3xl"
        />
        <Link to="/" className="absolute top-5 left-5">
          <VeriplotSvg />
        </Link>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <div className="flex space-x-2 mb-6">
            <div className="w-8 h-1 bg-purple-500 rounded"></div>
            <div className="w-8 h-1 bg-white rounded"></div>
            <div className="w-8 h-1 bg-white rounded"></div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Manage all properties and users on this Veriplot
          </h1>
          <p className="mt-2 text-gray-200 text-sm">
            Login to access property listings, and track your platform
            analytics.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center md:justify-center py-6 px-3 md:px-16">
        <Link to="/" className="w-full max-w-md mb-6 px-3 md:hidden">
          <img
            src={VeriplotLogo}
            alt="Veriplot logo"
            className="h-8 w-auto md:h-9 mb-3"
          />
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
