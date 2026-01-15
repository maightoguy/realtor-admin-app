import VeriplotSvg from "../modules/HeroWorkObjects";
import { Link } from "react-router-dom";
import heroImage from "../assets/Hero-background.jpg";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-[627px] w-full bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})`,
      }}
      aria-hidden="true"
    >
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 h-full">
        {/* Heading with inline SVG */}
        <h1
          className="
    flex flex-col md:flex-row md:items-center md:justify-center
    gap-2 text-white font-poppins font-bold
    text-[18px] md:text-[29px] leading-tight md:leading-[45px]
    max-w-[325px] md:max-w-[769px]
  "
        >
          <span className="flex items-center gap-2">
            Unlock Wealth Through Real Estate with
          </span>
          <VeriplotSvg />
        </h1>

        {/* Subtext */}
        <p
          className="
            mt-3 md:mt-4 text-gray-300 font-poppins
            text-[12px] md:text-[16px]
            leading-snug md:leading-[24px]
            max-w-[325px] md:max-w-[670px]
          "
        >
          Join a growing community of realtors, agents, and marketers who are
          transforming their real estate careers with VeriPlot.
        </p>

        {/* Buttons container */}
        <div className="flex items-center gap-3 mt-5 md:mt-6">
          {/* Secondary Button */}
          <Link
            to="/login"
            className="
              flex justify-center items-center px-4 py-2 md:px-6 md:py-2.5
              rounded-lg 
              bg-[#F0E6F7] border border-[#F0E6F7] 
              shadow-sm font-inter font-semibold
              text-[14px] md:text-[16px] leading-6 text-[#6500AC]
            "
          >
            Login
          </Link>
          {/* Primary Button */}
          <Link
            to="/register"
            className="
              flex justify-center items-center px-4 py-2 md:px-6 md:py-2.5
              rounded-lg 
              bg-[#6500AC] border border-[#6500AC] 
              shadow-sm font-inter font-semibold
              text-[14px] md:text-[16px] leading-6 text-white
            "
          >
            Join us
          </Link>
        </div>
      </div>
    </section>
  );
}
