import BackgroundPattern from "../modules/ServicesBackgroundPattern";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";

export default function Services() {
  return (
    <section id="services" className="relative bg-[#FAFAFA] py-12 flex flex-col items-center md:h-[894px]">
      {/* Background Pattern */}
      <BackgroundPattern
        aria-label="Veriplot Pattern"
        className="w-full h-24 absolute -bottom-5 left-0 md:hidden"
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center md:mt-[50px]">
        {/* Heading */}
        <div className="flex flex-col items-center gap-2 w-[315px] text-center md:w-[594px] md:gap-[10px]">
          <h2 className="font-poppins font-bold text-[16px] leading-[24px] text-black md:text-[24px] md:leading-[36px]">
            What you stand to Gain
          </h2>
          <p className="font-poppins text-[12px] leading-[18px] text-gray-500 md:text-[16px] md:leading-[24px]">
            Join a growing community of realtors, agents, and marketers who are
            transforming their real estate careers with VeriPlot.
          </p>
        </div>

        {/* Cards */}
        <div
          className="
            mt-12 mb-1 flex flex-col gap-5 w-[290px]
            md:grid md:grid-cols-2 md:gap-x-[32px] md:gap-y-[32px]
            md:mt-[119px] md:w-[1050px]
          "
        >
          {/* Card 1 */}
          <div className="bg-white border border-[#F0E6F7] rounded-[10px] p-[14px] flex flex-col gap-2 md:w-[505px] md:h-[104px] md:justify-center">
            <h3 className="font-poppins font-bold text-[14px] leading-[21px] text-center text-black md:text-[16px] md:leading-[24px]">
              Free Training & Resources
            </h3>
            <p className="font-poppins text-[12px] leading-[18px] text-center text-gray-500 md:text-[14px] md:leading-[21px]">
              Gain access to exclusive real estate insights, digital marketing
              guides, and specialized training to scale your earnings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#F0E6F7] rounded-[10px] p-[14px] flex flex-col gap-2 md:w-[505px] md:h-[104px] md:justify-center">
            <h3 className="font-poppins font-bold text-[14px] leading-[21px] text-center text-black md:text-[16px] md:leading-[24px]">
              Zero Capital Required
            </h3>
            <p className="font-poppins text-[12px] leading-[18px] text-center text-gray-500 md:text-[14px] md:leading-[21px]">
              Start your real estate journey without upfront investment. All you
              need is your drive, and VeriPlot gives you the platform.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#F0E6F7] rounded-[10px] p-[14px] flex flex-col gap-2 md:w-[505px] md:h-[104px] md:justify-center">
            <h3 className="font-poppins font-bold text-[14px] leading-[21px] text-center text-black md:text-[16px] md:leading-[24px]">
              Transparent Passive Income
            </h3>
            <p className="font-poppins text-[12px] leading-[18px] text-center text-gray-500 md:text-[14px] md:leading-[21px]">
              Earn commissions seamlessly through our verified referral system —
              track your rewards in real time, stress-free.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#F0E6F7] rounded-[10px] p-[14px] flex flex-col gap-2 md:w-[505px] md:h-[104px] md:justify-center">
            <h3 className="font-poppins font-bold text-[14px] leading-[21px] text-center text-black md:text-[16px] md:leading-[24px]">
              Exclusive Incentives
            </h3>
            <p className="font-poppins text-[12px] leading-[18px] text-center text-gray-500 md:text-[14px] md:leading-[21px]">
              Qualify for exciting rewards, from all-expense-paid trips to
              bonuses that celebrate your success.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <img
          src={VeriplotLogo}
          alt="Veriplot logo"
          className="hidden md:block h-8 w-auto mb-19 absolute bottom-0 left-1/2 -translate-x-1/2 "
        />
      </div>
    </section>
  );
}
