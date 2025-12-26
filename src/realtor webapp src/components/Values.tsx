import { Link } from "react-router-dom";
import {
  IntegrityIcon,
  InnovationIcon,
  TrustIcon,
  AccessibilityIcon,
  PartnershipIcon,
} from "../modules/ValueIcons";

const ValuesSection = () => {
  return (
    <section
      id="values"
      className="relative z-20 bg-[#6500AC] py-12 px-6 md:py-16"
    >
      {/* Section Header */}
      <div className="max-w-md mx-auto text-center mb-10 md:max-w-2xl md:mb-12">
        <h2 className="text-white font-bold text-lg md:text-2xl">
          Our core Values
        </h2>
        <p className="text-gray-200 text-sm md:text-base">
          Our values guide everything we do, They are the foundation of our
          community
        </p>
      </div>

      {/* Values List */}
      <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-6 md:max-w-[1204px] md:mx-auto">
        {/* Column 1 */}
        <div className="flex flex-col gap-6">
          {/* Integrity */}
          <div className="bg-[#38005F] rounded-2xl p-8 flex flex-col gap-4 md:h-[282px] justify-between h-[282px]">
            <div className="flex flex-col gap-4">
              <IntegrityIcon />
              <h3 className="text-white text-2xl font-medium">Integrity</h3>
            </div>
            <div>
              <p className="text-gray-200 text-sm">
                We ensure every listing is verified, and every process is
                transparent, so agents and clients can transact with confidence.
              </p>
            </div>
          </div>

          {/* Innovation */}
          <div className="bg-[#38005F] rounded-2xl p-8 flex flex-col gap-4 md:h-[140px]">
            <InnovationIcon />
            <h3 className="text-white text-2xl font-medium">Innovation</h3>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6">
          {/* Accessibility */}
          <div className="bg-[#38005F] rounded-2xl p-8 flex flex-col gap-4 md:h-[140px]">
            <AccessibilityIcon />
            <h3 className="text-white text-2xl font-medium">Accessibility</h3>
          </div>

          {/* Trust */}
          <div className="bg-[#38005F] rounded-2xl p-8 flex flex-col gap-4 md:h-[282px] justify-between h-[282px]">
            <div className="flex flex-col gap-4">
              <TrustIcon />
              <h3 className="text-white text-2xl font-medium">Trust</h3>
            </div>
            <div>
              <p className="text-gray-200 text-sm">
                Every property, agent, and referral goes through validation,
                building a safe and reliable ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="bg-[#38005F] rounded-2xl p-8 flex flex-col gap-6 md:justify-between md:h-[434px]">
          <div className="flex flex-col gap-4">
            <PartnershipIcon />
            <h3 className="text-white text-2xl font-medium">Partnership</h3>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-gray-200 text-sm">
              We create meaningful opportunities that empower realtors,
              developers, and buyers to succeed together.
            </p>
            <Link
              to="/register"
              className="w-[150px] text-center bg-white text-[#6500AC] font-semibold text-sm py-2 px-6 rounded-lg shadow hover:bg-gray-100"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
