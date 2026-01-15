import React from "react";
import VeriplotSvg from "../../modules/HeroWorkObjects";
import { Link } from "react-router-dom";
import heroImage from "../../assets/Hero-background.jpg";
import VeriplotLogo from "../../assets/Veriplot Primary logo 2.svg";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row md:p-6">
      {/* LEFT SIDE (image + tagline) */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src={heroImage}
          alt="Hero banner"
          className="w-full h-full object-cover rounded-3xl"
        />
        <Link to="/" className="absolute top-5 left-5">
          <VeriplotSvg />
        </Link>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold">
            Unlock Real Estate Earnings, One property at a time
          </h2>
          <p className="mt-2 text-gray-200 text-sm">
            Login to access verified property listings, and track your
            commissions, all in one seamless platform.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (form) */}
      <div className="flex-1 flex flex-col items-center py-6 px-2 md:px-16">
        {/* Logo (MOBILE ONLY) */}
        <Link to="/" className="w-full max-w-md mb-6 px-6 md:hidden">
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
