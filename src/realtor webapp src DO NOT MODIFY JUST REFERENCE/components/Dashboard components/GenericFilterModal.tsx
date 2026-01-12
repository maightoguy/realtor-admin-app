/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from "react";
import { useState } from "react";
import { Range } from "react-range";
import ManualLocationModal from "./ManualLocationModal";

export interface FilterOption {
  label: string;
  value: string;
  type: "radio" | "checkbox";
}

export interface FilterSection {
  title: string;
  type: "dropdown" | "range" | "select" | "text";
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  formatValue?: (value: number) => string;
  collapsible?: boolean;
}

export interface FilterConfig {
  title: string;
  description: string;
  sections: FilterSection[];
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
}

interface GenericFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FilterConfig;
}

const GenericFilterModal: FC<GenericFilterModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [manualModalOpen, setManualModalOpen] = useState(false);
  //const [selectedLocation, setSelectedLocation] = useState("Select location");

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const updateFilterValue = (sectionTitle: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [sectionTitle]: value,
    }));
  };

  const handleApply = () => {
    config.onApply(filterValues);
    onClose();
  };

  const handleReset = () => {
    setFilterValues({});
    config.onReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full md:w-[400px] xl:w-[347px] h-full flex flex-col rounded-2xl shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="relative border-b border-[#F0F1F2] px-4 md:px-6 pt-4 md:pt-6 pb-4 bg-white">
          <div className="flex flex-col gap-1">
            <h2 className="font-poppins font-bold text-sm md:text-base text-black">
              {config.title}
            </h2>
            <p className="text-xs md:text-sm text-[#6B7280]">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <span className="text-[#717680] text-xl md:text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow p-4 md:p-6 flex flex-col gap-4 md:gap-6 font-poppins">
          {config.sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-2 md:gap-3">
              {section.collapsible ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <span className="font-semibold text-xs text-[#3B3F46] uppercase">
                    {section.title}
                  </span>
                  <span
                    className={`transition-transform text-[#6500AC] ${
                      expandedSections[section.title] ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
              ) : (
                <span className="font-medium text-xs md:text-sm text-[#6B7280]">
                  {section.title}
                </span>
              )}

              {(!section.collapsible || expandedSections[section.title]) && (
                <div
                  className={
                    section.collapsible ? "border-t border-[#F0F1F2] mt-2" : ""
                  }
                >
                  {section.type === "dropdown" && section.options && (
                    <div className="space-y-2">
                      {section.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="flex justify-between items-center py-2 text-[#898E99] text-xs md:text-sm"
                        >
                          <span>{option.label}</span>
                          <input
                            type={option.type}
                            name={section.title}
                            className="accent-[#6500AC]"
                            checked={
                              filterValues[section.title] === option.value
                            }
                            onChange={() =>
                              updateFilterValue(section.title, option.value)
                            }
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {section.type === "select" && (
                    <select
                      className="border border-[#F0F1F2] bg-white rounded-md p-2 md:p-3 text-xs md:text-sm text-[#6B7280] w-full focus:outline-none"
                      value={filterValues[section.title] ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "--Manually select location--") {
                          setManualModalOpen(true);
                        } else {
                          updateFilterValue(section.title, value);
                        }
                      }}
                    >
                      <option value="">{section.placeholder || "Select option"}</option>
                      {section.title.toLowerCase().includes("location") && (
                        <option value="--Manually select location--">
                          --Manually select location--
                        </option>
                      )}
                      {section.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {section.type === "range" &&
                    section.min !== undefined &&
                    section.max !== undefined && (
                      <div className="flex flex-col gap-4">
                        <Range
                          step={section.step || 1}
                          min={section.min}
                          max={section.max}
                          values={
                            filterValues[section.title] || [
                              section.min,
                              section.max,
                            ]
                          }
                          onChange={(values) =>
                            updateFilterValue(section.title, values)
                          }
                          renderTrack={({ props, children }) => (
                            <div
                              {...props}
                              className="w-full h-2 bg-[#F0E6F7] rounded-full relative"
                            >
                              <div
                                className="absolute h-2 bg-[#6500AC] rounded-full"
                                style={{
                                  left: `${
                                    (((filterValues[section.title]?.[0] ||
                                      section.min!) -
                                      section.min!) /
                                      (section.max! - section.min!)) *
                                    100
                                  }%`,
                                  width: `${
                                    (((filterValues[section.title]?.[1] ||
                                      section.max!) -
                                      (filterValues[section.title]?.[0] ||
                                        section.min!)) /
                                      (section.max! - section.min!)) *
                                    100
                                  }%`,
                                }}
                              />
                              {children}
                            </div>
                          )}
                          renderThumb={({ props }) => (
                            <div
                              {...props}
                              className="w-5 h-5 md:w-6 md:h-6 bg-white border border-[#6500AC] rounded-full shadow focus:outline-none"
                            />
                          )}
                        />

                        {/* Min / Max Labels */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-[#F0F1F2] rounded-md p-3 md:p-4 text-xs md:text-sm">
                            {section.formatValue
                              ? section.formatValue(
                                  filterValues[section.title]?.[0] ||
                                    section.min!
                                )
                              : filterValues[section.title]?.[0] ||
                                section.min!}
                          </div>
                          <div className="bg-white border border-[#F0F1F2] rounded-md p-3 md:p-4 text-xs md:text-sm">
                            {section.formatValue
                              ? section.formatValue(
                                  filterValues[section.title]?.[1] ||
                                    section.max!
                                )
                              : filterValues[section.title]?.[1] ||
                                section.max!}
                          </div>
                        </div>
                      </div>
                    )}

                  {section.type === "text" && (
                    <input
                      type="text"
                      placeholder={section.placeholder}
                      className="border border-[#F0F1F2] bg-white rounded-md p-2 md:p-3 text-xs md:text-sm text-[#6B7280] w-full focus:outline-none"
                      value={filterValues[section.title] || ""}
                      onChange={(e) =>
                        updateFilterValue(section.title, e.target.value)
                      }
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 md:py-6 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_25px_rgba(0,0,0,0.05)] flex flex-col gap-3">
          <button
            onClick={handleApply}
            className="bg-[#6500AC] text-white py-2 md:py-3 rounded-lg font-medium text-sm md:text-base shadow"
          >
            Apply Filter
          </button>
          <button
            onClick={handleReset}
            className="bg-white border border-[#D5D7DA] py-2 md:py-3 rounded-lg font-medium text-[#414651] text-sm md:text-base shadow-sm"
          >
            Reset to default
          </button>
        </div>

        {/* Manual Location Modal */}
        <ManualLocationModal
          isOpen={manualModalOpen}
          onClose={() => setManualModalOpen(false)}
          onApply={(loc) => {
            updateFilterValue("Location", loc);
          }}
        />
      </div>
    </div>
  );
};

export default GenericFilterModal;
