import { useState, useRef } from "react";
import { legalSections } from "./LegalData";

const DashboardSettingsLegalTab = () => {
  const [activeSection, setActiveSection] = useState("terms-and-conditions");

  // Create refs for each section
  const sectionRefs = {
    "terms-and-conditions": useRef<HTMLDivElement>(null),
    "terms-of-use": useRef<HTMLDivElement>(null),
    "privacy-policy": useRef<HTMLDivElement>(null),
  } as const;

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);

    // Scroll to the section
    const sectionRef = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const legalTabs = [
    { id: "terms-and-conditions", label: "Terms & Condition" },
    { id: "terms-of-use", label: "Terms of use" },
    { id: "privacy-policy", label: "Privacy Policy" },
  ];

  return (
    <div className="space-y-6">
      {/* Legal Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#0A1B39]">Legal</h2>
        <p className="text-sm text-[#667085]">
          This contains our Terms and condition and other legal terms of use for
          Veriplot
        </p>
      </div>

      {/* Legal Content Container */}
      <div className="bg-white border border-[#EAECF0] rounded-lg p-3 md:p-6">
        {/* Legal Sub-tabs */}
        <div className="border-b border-[#EAECF0] pb-2 md:pb-4 mb-4 md:mb-6">
          <div className="flex overflow-x-auto scrollbar-hide gap-2">
            {legalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSectionClick(tab.id)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeSection === tab.id
                    ? "bg-[#6500AC] text-white"
                    : "bg-[#F9FAFB] text-[#667085] hover:bg-[#F0E6F7] hover:text-[#6500AC]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legal Content */}
        <div className="space-y-6 md:space-y-8 max-h-[600px] overflow-y-auto">
          {legalSections.map((section) => {
            const sectionRef =
              sectionRefs[section.id as keyof typeof sectionRefs];
            return (
              <div key={section.id} ref={sectionRef} className="scroll-mt-4">
                <h3 className="text-lg md:text-xl font-bold text-[#0A1B39] mb-2 md:mb-4 border-b border-[#EAECF0] pb-2">
                  {section.title}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-[#667085] leading-relaxed text-xs md:text-sm">
                    {section.content.trim()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardSettingsLegalTab;
