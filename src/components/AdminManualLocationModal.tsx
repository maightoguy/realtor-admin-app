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
};

const AdminManualLocationModal = ({
  isOpen,
  onClose,
  onApply,
}: ManualLocationModalProps) => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const handleApply = () => {
    if (selectedState && selectedCity && selectedArea) {
      onApply(`${selectedArea}, ${selectedState}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[480px] rounded-xl shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Select Location</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* State Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity("");
                setSelectedArea("");
              }}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6500AC] focus:ring-1 focus:ring-[#6500AC] transition-all appearance-none"
            >
              <option value="">Select state</option>
              {Object.keys(nigeriaLocations).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedArea("");
              }}
              disabled={!selectedState}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6500AC] focus:ring-1 focus:ring-[#6500AC] transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select city</option>
              {selectedState &&
                Object.keys(nigeriaLocations[selectedState]).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>

          {/* Area Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              disabled={!selectedCity}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6500AC] focus:ring-1 focus:ring-[#6500AC] transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select area</option>
              {selectedState &&
                selectedCity &&
                nigeriaLocations[selectedState][selectedCity].map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleApply}
            disabled={!selectedArea}
            className="w-full h-12 bg-[#6500AC] text-white font-medium rounded-lg hover:bg-[#500089] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManualLocationModal;
