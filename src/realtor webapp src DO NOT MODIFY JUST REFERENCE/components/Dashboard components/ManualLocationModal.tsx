import { useState } from "react";

interface ManualLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (location: string) => void;
}

const nigeriaLocations: Record<string, Record<string, string[]>> = {
  Lagos: {
    Ikeja: ["Ikeja", "Ojodu", "Alausa"],
    "Lekki (Eti-Osa)": ["Eti-Osa", "Lekki", "Victoria Island"],
    Ikorodu: ["Ikorodu", "Imota", "Igbogbo-Bayeku"],
    Apapa: ["Apapa", "Ajeromi-Ifelodun"],
    "Surulere (Lagos)": ["Surulere", "Lagos Mainland", "Shomolu"],
    Yaba: ["Yaba", "Lagos Mainland", "Somolu"],
    Badagry: ["Badagry", "Ojo", "Amuwo-Odofin"],
  },
  "FCT - Abuja": {
    Garki: ["AMAC", "Gwagwalada", "Kuje"],
    Wuse: ["AMAC", "Bwari", "Kwali"],
    Maitama: ["AMAC", "Bwari"],
    Gwarinpa: ["Bwari", "AMAC"],
    Jabi: ["AMAC", "Bwari"],
    Kubwa: ["Bwari", "AMAC"],
  },
  Rivers: {
    "Port Harcourt": ["Port Harcourt", "Obio-Akpor"],
    "Eleme (Port Harcourt)": ["Eleme", "Obio-Akpor"],
    Bonny: ["Bonny"],
    Ahoada: ["Ahoada East", "Ahoada West"],
  },
  Oyo: {
    Ibadan: ["Ibadan North", "Ibadan South-West", "Akinyele"],
    Ogbomosho: ["Ogbomosho North", "Ogbomosho South"],
    Oyo: ["Oyo East", "Oyo West", "Atiba"],
  },
  Ogun: {
    Abeokuta: ["Abeokuta North", "Abeokuta South"],
    Ijebu: ["Ijebu Ode", "Ijebu North"],
    Sagamu: ["Sagamu", "Remo North"],
  },
  Kano: {
    Kano: ["Dala", "Fagge", "Nasarawa"],
    Wudil: ["Wudil", "Garko"],
  },
  Enugu: {
    Enugu: ["Enugu North", "Enugu South", "Enugu East"],
    Nsukka: ["Nsukka", "Igbo-Eze South"],
  },
  Kaduna: {
    Kaduna: ["Kaduna North", "Kaduna South"],
    Zaria: ["Zaria", "Sabon Gari"],
    Kafanchan: ["Jema'a", "Kaura"],
  },
  Anambra: {
    Awka: ["Awka South", "Awka North"],
    Onitsha: ["Onitsha North", "Onitsha South"],
    Nnewi: ["Nnewi North", "Nnewi South"],
  },
  Delta: {
    Asaba: ["Oshimili South", "Oshimili North"],
    Warri: ["Warri South", "Warri North"],
    Sapele: ["Sapele", "Okpe"],
  },
  Edo: {
    "Benin City": ["Oredo", "Egor", "Ikpoba-Okha"],
    Auchi: ["Etsako West", "Etsako Central"],
    Ekpoma: ["Esan West", "Esan Central"],
  },
  Imo: {
    Owerri: ["Owerri Municipal", "Owerri North", "Owerri West"],
    Orlu: ["Orlu", "Oru East"],
    Okigwe: ["Okigwe", "Ihitte/Uboma"],
  },
  "Akwa Ibom": {
    Uyo: ["Uyo", "Itu", "Uruan"],
    Eket: ["Eket", "Onna"],
    Ikot: ["Ikot Ekpene", "Essien Udim"],
  },
  Plateau: {
    Jos: ["Jos North", "Jos South", "Jos East"],
    Pankshin: ["Pankshin", "Kanke"],
  },
  "Cross River": {
    Calabar: ["Calabar Municipal", "Calabar South"],
    Ikom: ["Ikom", "Etung"],
  },
  Kwara: {
    Ilorin: ["Ilorin East", "Ilorin West", "Ilorin South"],
    Offa: ["Offa", "Oyun"],
  },
  Borno: {
    Maiduguri: ["Maiduguri", "Jere"],
    Biu: ["Biu", "Hawul"],
  },
  Bayelsa: {
    Yenagoa: ["Yenagoa", "Ogbia"],
    Brass: ["Brass", "Nembe"],
  },
  Katsina: {
    Katsina: ["Katsina", "Batagarawa"],
    Funtua: ["Funtua", "Bakori"],
  },
};

const ManualLocationModal = ({
  isOpen,
  onClose,
  onApply,
}: ManualLocationModalProps) => {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [LGA, setLGA] = useState("");

  if (!isOpen) return null;

  const availableStates = Object.keys(nigeriaLocations);
  const availableCities = state
    ? Object.keys(nigeriaLocations[state] ?? {})
    : [];
  const availableLGAs =
    state && city ? nigeriaLocations[state]?.[city] ?? [] : [];

  const handleApply = () => {
    if (state && city) {
      const parts = [city, state, LGA].filter(Boolean);
      onApply(parts.join(", "));
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[480px] max-w-[90%] rounded-2xl shadow-xl p-6 font-poppins"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-bold text-[16px] text-black">
              Select Location Manually
            </h2>
            <p className="text-[14px] text-[#6B7280]">
              Choose a state and city manually
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[#717680] hover:bg-gray-100 rounded-lg w-10 h-10 flex justify-center items-center"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#6B7280] text-[14px]">State</label>
            <select
              value={state}
              onChange={(e) => {
                const nextState = e.target.value;
                setState(nextState);
                setCity("");
                setLGA("");
              }}
              className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-md p-3 text-[14px] w-full"
            >
              <option value="">Select State</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#6B7280] text-[14px]">City</label>
            <select
              value={city}
              onChange={(e) => {
                const nextCity = e.target.value;
                setCity(nextCity);
                setLGA("");
              }}
              className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-md p-3 text-[14px] w-full"
              disabled={!state}
            >
              <option value="">Select City</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#6B7280] text-[14px]">LGA</label>
            <select
              value={LGA}
              onChange={(e) => setLGA(e.target.value)}
              className="border border-[#F0F1F2] bg-[#FAFAFA] rounded-md p-3 text-[14px] w-full"
              disabled={!state || !city}
            >
              <option value="">Select LGA</option>
              {availableLGAs.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-[#D5D7DA] rounded-lg font-medium text-[#414651]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-3 bg-[#6500AC] text-white rounded-lg font-medium"
          >
            Apply Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualLocationModal;
