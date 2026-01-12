import { useState } from "react";
import {
  AllIcon,
  LandsIcon,
  BuildingsIcon,
  FavoriteIcon,
  SoldOutIcon,
} from "../../icons";

interface FilterTabsProps {
  onFilterChange: (filter: string) => void;
}

const FilterTabs = ({ onFilterChange }: FilterTabsProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onFilterChange(id);
  };

  const getIconColor = (id: string) =>
    activeTab === id ? "#6500AC" : "#9CA1AA";

  const tabs = [
    {
      id: "all",
      label: "All",
      icon: (color: string) => <AllIcon color={color} />,
    },
    {
      id: "lands",
      label: "Lands",
      icon: (color: string) => <LandsIcon color={color} />,
    },
    {
      id: "buildings",
      label: "Buildings",
      icon: (color: string) => <BuildingsIcon color={color} />,
    },
    {
      id: "favorite",
      label: "My favorite",
      icon: (color: string) => <FavoriteIcon color={color} />,
    },
    {
      id: "sold",
      label: "Sold out",
      icon: (color: string) => <SoldOutIcon color={color} />,
    },
  ];

  return (
    <div
      className="
        flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide
        lg:flex-wrap lg:overflow-visible
        -mx-3 px-3 md:-mx-4 md:px-4
      "
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 border rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
              : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA] hover:border-[#CFB0E5] hover:text-[#6500AC]"
          }`}
        >
          {tab.icon(getIconColor(tab.id))}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
