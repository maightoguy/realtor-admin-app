import React from "react";
import { Link } from "react-router-dom";
import VeriplotSvg from "../../modules/Icons/VeriplotIcon";
import heroImage from "../../assets/Hero-background.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Background Image and Branding */}
      <div className="w-2/5 relative bg-cover bg-center bg-no-repeat bg-gray-800">
        <img
          src={heroImage}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Logo */}
        <Link to="/" className="relative z-10 p-8">
          <div className="flex items-center space-x-2">
            {/* TODO: Add logo SVG */}
            <span className="text-white text-xl font-bold">
              <VeriplotSvg />
            </span>
          </div>
        </Link>

        {/* Main content */}
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          {/* Step indicators */}
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

      {/* Right Section - Form Content */}
      <div className="w-3/5 bg-white flex items-center justify-center">
        <div className="w-full max-w-md px-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
