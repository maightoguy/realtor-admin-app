import type { FC } from "react";
import { useState } from "react";
import { Range } from "react-range";

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_PRICE = 100_000_000;
const MIN_PRICE = 100_000;

const SearchFilterModal: FC<SearchFilterModalProps> = ({ isOpen, onClose }) => {
  const [showPropertyType, setShowPropertyType] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [price, setPrice] = useState<number[]>([MIN_PRICE, MAX_PRICE]);
  const [dragged, setDragged] = useState<number | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Select location");

  const formatCurrency = (val: number) =>
    `₦${Math.round(val).toLocaleString()}`;

  const propertyTypes = [
    "Land for Rent",
    "Land for Sale",
    ...(showMoreCategories
      ? ["Industrial Land", "Commercial Land", "Residential Plot"]
      : []),
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:w-[400px] xl:w-[347px] h-full flex flex-col rounded-2xl shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="relative border-b border-[#F0F1F2] px-6 pt-6 pb-4 bg-white">
          <div className="flex flex-col gap-1">
            <h2 className="font-poppins font-bold text-[16px] text-black">
              Filter
            </h2>
            <p className="text-[14px] text-[#6B7280]">
              Set the Preference for the type of Property you want to see
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <span className="text-[#717680] text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 flex flex-col gap-6 font-poppins">
          {/* Property Type */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setShowPropertyType((v) => !v);
                if (showPropertyType) setShowMoreCategories(false);
              }}
              className="flex justify-between items-center w-full text-left"
            >
              <span className="font-semibold text-[12px] text-[#3B3F46] uppercase">
                Property Type
              </span>
              <span
                className={`transition-transform text-[#6500AC] ${
                  showPropertyType ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {showPropertyType && (
              <div className="border-t border-[#F0F1F2] mt-2">
                {propertyTypes.map((type, i) => (
                  <label
                    key={i}
                    className="flex justify-between items-center py-2 text-[#898E99] text-[14px]"
                  >
                    <span>{type}</span>
                    <input
                      type="radio"
                      name="type"
                      className="accent-[#6500AC]"
                    />
                  </label>
                ))}
                {!showMoreCategories && (
                  <button
                    className="flex items-center gap-1 text-[#6500AC] text-[14px] mt-1"
                    onClick={() => setShowMoreCategories(true)}
                  >
                    <span>More categories</span>
                    <span>▼</span>
                  </button>
                )}
                {showMoreCategories && (
                  <button
                    className="flex items-center gap-1 text-[#6500AC] text-[14px] mt-1"
                    onClick={() => setShowMoreCategories(false)}
                  >
                    <span>Hide categories</span>
                    <span>▲</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-[14px] text-[#6B7280]">
              Location
            </span>
            <select
              className="border border-[#F0F1F2] bg-white rounded-md p-3 text-[14px] text-[#6B7280] w-full focus:outline-none"
              value={selectedLocation}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "--Manually select location--") {
                  setManualModalOpen(true);
                } else {
                  setSelectedLocation(value);
                }
              }}
            >
              <option>Select location</option>
              <option>--Manually select location--</option>
              <option>Ikorodu, Lagos</option>
              <option>Apapa, Lagos</option>
              <option>Cement, Lagos</option>
              <option>Ikeja, Lagos</option>
            </select>

            <ManualLocationModal
              isOpen={manualModalOpen}
              onClose={() => setManualModalOpen(false)}
              onApply={(loc) => setSelectedLocation(loc)}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-4">
            <span className="font-medium text-[14px] text-[#6B7280]">
              Price (₦)
            </span>
            <Range
              step={100000}
              min={MIN_PRICE}
              max={MAX_PRICE}
              values={price}
              onChange={setPrice}
              onFinalChange={() => setDragged(null)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className="w-full h-2 bg-[#F0E6F7] rounded-full relative"
                >
                  <div
                    className="absolute h-2 bg-[#6500AC] rounded-full"
                    style={{
                      left: `${
                        ((price[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
                      }%`,
                      width: `${
                        ((price[1] - price[0]) / (MAX_PRICE - MIN_PRICE)) * 100
                      }%`,
                    }}
                  />
                  {children}
                </div>
              )}
              renderThumb={({ props, index }) => (
                <div
                  {...props}
                  onMouseDown={() => setDragged(index)}
                  onTouchStart={() => setDragged(index)}
                  className="w-6 h-6 bg-white border border-[#6500AC] rounded-full shadow focus:outline-none"
                />
              )}
            />

            {/* Min / Max Labels */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#F0F1F2] rounded-md p-4 text-sm">
                {formatCurrency(price[0])}
              </div>
              <div className="bg-white border border-[#F0F1F2] rounded-md p-4 text-sm">
                {formatCurrency(price[1])}
              </div>
            </div>
          </div>

          {/* Active Price */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-[#6B7280]">
              Filter Title here
            </span>
            <span className="text-[14px] font-medium text-[#6B7280]">
              Sub-filter title
            </span>
            <div className="border border-[#F0F1F2] bg-white rounded-md p-3 h-[56px] flex items-center text-[14px] text-black font-medium">
              {dragged !== null ? formatCurrency(price[dragged]) : "—"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_25px_rgba(0,0,0,0.05)] flex flex-col gap-3">
          <button
            onClick={onClose}
            className="bg-[#6500AC] text-white py-3 rounded-lg font-medium text-[16px] shadow"
          >
            Apply Filter
          </button>
          <button className="bg-white border border-[#D5D7DA] py-3 rounded-lg font-medium text-[#414651] text-[16px] shadow-sm">
            Reset to default
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterModal;
