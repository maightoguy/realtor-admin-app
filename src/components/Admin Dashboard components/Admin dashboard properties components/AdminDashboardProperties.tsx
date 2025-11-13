import { useState } from "react";
import AdminPropertyCard from "./AdminPropertyCard.tsx";
import AdminSearchBar from "../../AdminSearchBar.tsx";
import AdminPagination from "../../AdminPagination.tsx";
import BuildingsIcon from "../../icons/BuildingsIcon.tsx";
import IslandIcon from "../../icons/IslandIcon.tsx";
import SoldOutIcon from "../../icons/SoldOutIcon.tsx";
import AllIcon from "../../icons/AllIcon.tsx";
import RealtorsIcon from "../../icons/RealtorsIcon.tsx";
import AddPropertyForm from "./AddPropertyForm.tsx";
import {
  propertiesMetricsData,
  sampleProperties,
} from "./adminDashboardPropertiesData";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconStrokeColor: string;
  iconFgColor: string;
  valueTextColor: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconStrokeColor,
  valueTextColor,
}: MetricCardProps) => (
  <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-5 flex flex-col gap-4 w-full transition duration-300 hover:shadow-lg">
    {/* Top Row - Icon and Title */}
    <div className="flex items-center gap-3">
      {/* SVG Icon Wrapper */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="30" height="30" rx="15" fill={iconBgColor} />
        <rect
          x="3"
          y="3"
          width="30"
          height="30"
          rx="15"
          stroke={iconStrokeColor}
          strokeWidth="4.5"
        />
        <foreignObject x="3" y="3" width="30" height="30" rx="15">
          <div className="w-full h-full flex items-center justify-center">
            {icon}
          </div>
        </foreignObject>
      </svg>

      <p
        className="text-sm font-medium truncate"
        style={{ color: valueTextColor }}
      >
        {title}
      </p>
    </div>

    {/* Value Row */}
    <div
      className="flex flex-col gap-3 min-w-0"
      style={{ color: valueTextColor }}
    >
      <p
        className="text-[24px] leading-9 font-medium wrap-break-word max-w-full"
        style={{ color: valueTextColor }}
      >
        {value}
      </p>
    </div>
  </div>
);

interface Property {
  id: number;
  image: string;
  title: string;
  price: number;
  location: string;
  isSoldOut: boolean;
  category?: string;
  description?: string;
  developer?: string;
}

interface AdminDashboardPropertiesProps {
  onAddFormStateChange?: (isActive: boolean) => void;
}

const AdminDashboardProperties = ({
  onAddFormStateChange,
}: AdminDashboardPropertiesProps) => {
  const [activeTab, setActiveTab] = useState<"Properties" | "Developers">(
    "Properties"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [properties, setProperties] = useState<Property[]>(sampleProperties);
  const itemsPerPage = 8;

  // Notify parent when form state changes
  const handleFormStateChange = (isActive: boolean) => {
    setShowAddForm(isActive);
    onAddFormStateChange?.(isActive);
  };

  const handleSearch = (query: string) => {
    // Handle search functionality
    console.log("Search query:", query);
    // Reset to page 1 when searching
    setCurrentPage(1);
  };

  const handleFilterClick = () => {
    // Handle filter click
    console.log("Filter clicked");
  };

  const handleViewDetails = (propertyId: number) => {
    // Handle view details
    console.log("View details for property:", propertyId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddProperty = (newProperty: {
    image: string;
    title: string;
    price: number;
    location: string;
    isSoldOut: boolean;
    category?: string;
    description?: string;
    developer?: string;
  }) => {
    const propertyWithId: Property = {
      ...newProperty,
      id:
        properties.length > 0
          ? Math.max(...properties.map((p) => p.id)) + 1
          : 1,
    };
    setProperties([...properties, propertyWithId]);
    handleFormStateChange(false);
    // Reset to first page to see the new property
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalItems = properties.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Metric Cards */}
      {!showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Total properties"
            value={propertiesMetricsData.totalProperties}
            icon={<BuildingsIcon color="#5E17EB" className="w-5 h-5" />}
            iconBgColor="#F0E6F7"
            iconStrokeColor="#F0E6F7"
            iconFgColor="#5E17EB"
            valueTextColor="#101828"
          />
          <MetricCard
            title="Active properties"
            value={propertiesMetricsData.activeProperties}
            icon={<IslandIcon color="#22C55E" className="w-5 h-5" />}
            iconBgColor="#E9F9EF"
            iconStrokeColor="#E9F9EF"
            iconFgColor="#22C55E"
            valueTextColor="#101828"
          />
          <MetricCard
            title="Sold out properties"
            value={propertiesMetricsData.soldOutProperties}
            icon={<SoldOutIcon color="#EF4444" className="w-5 h-5" />}
            iconBgColor="#FAC5C5"
            iconStrokeColor="#FAC5C5"
            iconFgColor="#EF4444"
            valueTextColor="#101828"
          />
        </div>
      )}

      {/* Filter and Action Bar */}
      {!showAddForm && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("Properties")}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === "Properties"
                  ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                  : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA] hover:border-[#CFB0E5] hover:text-[#6500AC]"
              }`}
            >
              <AllIcon
                color={activeTab === "Properties" ? "#6500AC" : "#9CA1AA"}
              />
              Properties
            </button>
            <button
              onClick={() => setActiveTab("Developers")}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === "Developers"
                  ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
                  : "bg-[#FAFAFA] border-[#F0F1F2] text-[#9CA1AA] hover:border-[#CFB0E5] hover:text-[#6500AC]"
              }`}
            >
              <RealtorsIcon
                color={activeTab === "Developers" ? "#6500AC" : "#9CA1AA"}
              />
              Developers
            </button>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <AdminSearchBar
              onSearch={handleSearch}
              onFilterClick={handleFilterClick}
              className="flex-1 sm:flex-initial"
              placeholder="Search"
            />
          </div>
        </div>
      )}

      {/* Add Property Form */}
      {showAddForm && (
        <AddPropertyForm
          onClose={() => handleFormStateChange(false)}
          onSave={handleAddProperty}
        />
      )}

      {/* Properties Grid */}
      {!showAddForm && (
        <div className="mb-6">
          <div className="flex flex-row justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">
              All properties
            </h2>
            <button
              onClick={() => handleFormStateChange(!showAddForm)}
              className="bg-[#5E17EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors whitespace-nowrap"
            >
              {showAddForm ? "Cancel" : "Add new property"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentProperties.map((property) => (
              <AdminPropertyCard
                key={property.id}
                image={property.image}
                title={property.title}
                price={property.price}
                location={property.location}
                isSoldOut={property.isSoldOut}
                onViewDetails={() => handleViewDetails(property.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!showAddForm && (
        <AdminPagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AdminDashboardProperties;
