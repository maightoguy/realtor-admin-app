import React from "react";
import Meetingimg from "../assets/Meeting image.jpg";

const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="bg-white px-6 py-12 md:px-28 md:py-16 max-w-[1440px] mx-auto"
    >
      <div className="flex flex-col gap-4 mb-10">
        <h2 className="text-lg md:text-2xl font-bold text-black">About us</h2>
        <p className="text-gray-500 text-sm md:text-base md:leading-6 max-w-[1134px]">
          VeriPlot is a proptech company redefining real estate marketing
          through digital referral systems. We connect realtors and buyers with
          verified property listings, ensuring transparency, trust, and seamless
          transactions. In partnership with reputable developers, we make
          property ownership simpler, safer, and more rewarding for everyone.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="rounded-2xl overflow-hidden md:w-[505px] md:h-[337px] flex-shrink-0">
          <img
            src={Meetingimg}
            alt="People working together"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6 md:w-[590px]">
          <div className="bg-[#F0E6F7] border border-[#CFB0E5] rounded-lg p-4 flex flex-col gap-2">
            <h3 className="text-purple-900 text-base md:text-lg font-bold">
              Our Mission
            </h3>
            <p className="text-gray-600 text-sm md:text-[14px] md:leading-[21px]">
              To simplify real estate marketing by providing a trusted digital
              platform that connects realtors and buyers with verified
              properties, ensuring transparency, speed, and rewarding
              opportunities for all.
            </p>
          </div>

          <div className="bg-[#F0E6F7] border border-[#CFB0E5] rounded-lg p-4 flex flex-col gap-2">
            <h3 className="text-purple-900 text-base md:text-lg font-bold">
              Our Vision
            </h3>
            <p className="text-gray-600 text-sm md:text-base md:leading-6">
              Our vision is to be Nigeria’s leading real estate marketing
              platform, making property investment and home ownership simple,
              transparent, and accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
