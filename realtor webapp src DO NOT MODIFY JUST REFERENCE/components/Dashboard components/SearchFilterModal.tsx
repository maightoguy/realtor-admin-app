import type { FC } from "react";
import { useEffect, useState } from "react";
import { Range } from "react-range";

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: Record<string, unknown>;
  onApply?: (filters: Record<string, unknown>) => void;
  onReset?: () => void;
}

const MAX_PRICE = 10_000_000_000;
const MIN_PRICE = 0;

const BASE_PROPERTY_TYPES = [
  "Land",
  "Residential",
  "Commercial",
  "Industrial",
  "Mixed-Use",
] as const;

const LOCATION_OPTIONS = [
  "Ikorodu, Lagos",
  "Apapa, Lagos",
  "Cement, Lagos",
  "Ikeja, Lagos",
  "Lekki, Lagos",
  "Yaba, Lagos",
  "Surulere, Lagos",
  "Garki, FCT Abuja",
  "Wuse, FCT Abuja",
  "Maitama, FCT Abuja",
  "Port Harcourt, Rivers",
  "Ibadan, Oyo",
  "Abeokuta, Ogun",
  "Benin City, Edo",
  "Enugu, Enugu",
  "Kaduna, Kaduna",
  "Kano, Kano",
];

const SearchFilterModal: FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
  onApply,
  onReset,
}) => {
  const [showPropertyType, setShowPropertyType] = useState(false);
  const defaultPriceMin = MIN_PRICE;
  const defaultPriceMax = MAX_PRICE;
  const [price, setPrice] = useState<number[]>([
    defaultPriceMin,
    defaultPriceMax,
  ]);
  const [didAdjustPrice, setDidAdjustPrice] = useState(false);
  const [priceMinInput, setPriceMinInput] = useState(String(defaultPriceMin));
  const [priceMaxInput, setPriceMaxInput] = useState(String(defaultPriceMax));
  const [dragged, setDragged] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const formatCurrency = (val: number) =>
    `₦${Math.round(val).toLocaleString()}`;

  const clampPrice = (val: number) =>
    Math.min(defaultPriceMax, Math.max(defaultPriceMin, val));

  const syncPrice = (next: number[]) => {
    setPrice(next);
    setPriceMinInput(String(next[0]));
    setPriceMaxInput(String(next[1]));
  };

  const propertyTypes = [...BASE_PROPERTY_TYPES];

  useEffect(() => {
    if (!isOpen) return;

    const initialType = String(initialFilters?.["Property Type"] ?? "").trim();
    setSelectedPropertyType(initialType);
    const initialLocation = String(initialFilters?.["Location"] ?? "").trim();
    setSelectedLocation(initialLocation);

    const initialPrice = initialFilters?.["Price (₦)"];
    if (Array.isArray(initialPrice) && initialPrice.length === 2) {
      const min = Number(initialPrice[0]);
      const max = Number(initialPrice[1]);
      if (Number.isFinite(min) && Number.isFinite(max)) {
        setPrice([min, max]);
        setDidAdjustPrice(min > defaultPriceMin || max < defaultPriceMax);
        setPriceMinInput(String(min));
        setPriceMaxInput(String(max));
      } else {
        setPrice([defaultPriceMin, defaultPriceMax]);
        setDidAdjustPrice(false);
        setPriceMinInput(String(defaultPriceMin));
        setPriceMaxInput(String(defaultPriceMax));
      }
    } else {
      setPrice([defaultPriceMin, defaultPriceMax]);
      setDidAdjustPrice(false);
      setPriceMinInput(String(defaultPriceMin));
      setPriceMaxInput(String(defaultPriceMax));
    }

    setDragged(null);
  }, [isOpen, initialFilters, defaultPriceMin, defaultPriceMax]);

  const handleApply = () => {
    const filters: Record<string, unknown> = {};
    const narrowed = price[0] > defaultPriceMin || price[1] < defaultPriceMax;
    if (didAdjustPrice && narrowed) {
      filters["Price (₦)"] = price;
    }

    if (selectedPropertyType.trim()) {
      filters["Property Type"] = selectedPropertyType.trim();
    }

    if (selectedLocation.trim()) {
      filters["Location"] = selectedLocation.trim();
    }

    onApply?.(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedPropertyType("");
    setSelectedLocation("");
    setPrice([defaultPriceMin, defaultPriceMax]);
    setDidAdjustPrice(false);
    setPriceMinInput(String(defaultPriceMin));
    setPriceMaxInput(String(defaultPriceMax));
    setDragged(null);
    setShowPropertyType(false);
    onReset?.();
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
                      checked={selectedPropertyType === type}
                      onChange={() => setSelectedPropertyType(type)}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-[14px] text-[#6B7280]">
              Location
            </span>
            <input
              list="dashboard-location-options"
              className="border border-[#F0F1F2] bg-white rounded-md p-3 text-[14px] text-[#6B7280] w-full focus:outline-none"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
              }}
              placeholder="Enter location"
            />
            <datalist id="dashboard-location-options">
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-4">
            <span className="font-medium text-xs md:text-sm text-[#6B7280]">
              Price (₦)
            </span>
            <Range
              step={100000}
              min={defaultPriceMin}
              max={defaultPriceMax}
              values={price}
              onChange={(values) => {
                setDidAdjustPrice(true);
                const nextMin = clampPrice(values[0]);
                const nextMax = clampPrice(values[1]);
                const next: number[] =
                  nextMin <= nextMax ? [nextMin, nextMax] : [nextMax, nextMin];
                syncPrice(next);
              }}
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
                        ((price[0] - defaultPriceMin) /
                          (defaultPriceMax - defaultPriceMin)) *
                        100
                      }%`,
                      width: `${
                        ((price[1] - price[0]) /
                          (defaultPriceMax - defaultPriceMin)) *
                        100
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6B7280]">Min</span>
                <input
                  inputMode="numeric"
                  type="number"
                  min={defaultPriceMin}
                  max={defaultPriceMax}
                  step={100000}
                  value={priceMinInput}
                  onChange={(e) => {
                    setDidAdjustPrice(true);
                    const raw = e.target.value;
                    setPriceMinInput(raw);
                    const nextNum = Number(raw);
                    if (!Number.isFinite(nextNum)) return;
                    const nextMin = clampPrice(nextNum);
                    const nextMax = clampPrice(Math.max(nextMin, price[1]));
                    syncPrice([nextMin, nextMax]);
                  }}
                  onBlur={() => {
                    const n = Number(priceMinInput);
                    if (!Number.isFinite(n)) {
                      setPriceMinInput(String(price[0]));
                      return;
                    }
                    const nextMin = clampPrice(n);
                    const nextMax = clampPrice(Math.max(nextMin, price[1]));
                    syncPrice([nextMin, nextMax]);
                  }}
                  className="border border-[#F0F1F2] bg-white rounded-md p-3 md:p-4 text-xs md:text-sm text-black w-full focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6B7280]">Max</span>
                <input
                  inputMode="numeric"
                  type="number"
                  min={defaultPriceMin}
                  max={defaultPriceMax}
                  step={100000}
                  value={priceMaxInput}
                  onChange={(e) => {
                    setDidAdjustPrice(true);
                    const raw = e.target.value;
                    setPriceMaxInput(raw);
                    const nextNum = Number(raw);
                    if (!Number.isFinite(nextNum)) return;
                    const nextMax = clampPrice(nextNum);
                    const nextMin = clampPrice(Math.min(nextMax, price[0]));
                    syncPrice([nextMin, nextMax]);
                  }}
                  onBlur={() => {
                    const n = Number(priceMaxInput);
                    if (!Number.isFinite(n)) {
                      setPriceMaxInput(String(price[1]));
                      return;
                    }
                    const nextMax = clampPrice(n);
                    const nextMin = clampPrice(Math.min(nextMax, price[0]));
                    syncPrice([nextMin, nextMax]);
                  }}
                  className="border border-[#F0F1F2] bg-white rounded-md p-3 md:p-4 text-xs md:text-sm text-black w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Active Price */}
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-medium text-[#6B7280]">
              Price Preview
            </span>
            <div className="border border-[#F0F1F2] bg-white rounded-md p-2 md:p-3 h-[48px] md:h-[56px] flex items-center text-xs md:text-sm text-black font-medium">
              {dragged !== null ? formatCurrency(price[dragged]) : "—"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 md:px-6 md:py-6 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_25px_rgba(0,0,0,0.05)] flex flex-col gap-3">
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
      </div>
    </div>
  );
};

export default SearchFilterModal;
