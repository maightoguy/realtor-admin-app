import { useEffect, useMemo, useState } from "react";
import AdminPropertyCard from "./AdminPropertyCard.tsx";
import AdminPropertyDeveloper from "./AdminPropertyDeveloper.tsx";
import AdminSearchBar from "../../AdminSearchBar.tsx";
import AdminPagination from "../../AdminPagination.tsx";
import BuildingsIcon from "../../icons/BuildingsIcon.tsx";
import IslandIcon from "../../icons/IslandIcon.tsx";
import SoldOutIcon from "../../icons/SoldOutIcon.tsx";
import AllIcon from "../../icons/AllIcon.tsx";
import RealtorsIcon from "../../icons/RealtorsIcon.tsx";
import AddPropertyForm from "./AddPropertyForm.tsx";
import DeveloperDetailsSection from "./DeveloperDetailsSection.tsx";
import AdminPropertyDetails from "./AdminPropertyDetails.tsx";
import {
  sampleDevelopers,
  type Developer,
} from "./adminDashboardPropertiesData";
import {
  propertyMediaService,
  propertyService,
} from "../../../services/apiService";
import type {
  Property as DbProperty,
  PropertyStatus,
} from "../../../services/types";
import { logger } from "../../../utils/logger";

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
  id: string;
  image: string;
  title: string;
  price: number;
  location: string;
  isSoldOut: boolean;
  category?: string;
  description?: string;
  developer?: string;
  images?: string[];
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);
  const [activePropertiesCount, setActivePropertiesCount] = useState(0);
  const [soldOutPropertiesCount, setSoldOutPropertiesCount] = useState(0);
  const [developers, setDevelopers] = useState<Developer[]>(sampleDevelopers);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const itemsPerPage = 8;

  const adaptDbProperty = (p: DbProperty): Property => {
    const imgPaths = Array.isArray(p.images) ? p.images : [];
    const urls = imgPaths.map((img) => propertyMediaService.getPublicUrl(img));
    const image = urls[0] || "/placeholder-property.jpg";
    return {
      id: p.id,
      image,
      images: urls.length > 0 ? urls : [image],
      title: p.title,
      price: Number(p.price) || 0,
      location: p.location,
      isSoldOut: p.status === "sold",
      description: p.description ?? undefined,
    };
  };

  const metrics = useMemo(
    () => ({
      totalProperties: totalPropertiesCount.toLocaleString(),
      activeProperties: activePropertiesCount.toLocaleString(),
      soldOutProperties: soldOutPropertiesCount.toLocaleString(),
    }),
    [totalPropertiesCount, activePropertiesCount, soldOutPropertiesCount]
  );

  const refreshMetrics = async () => {
    logger.info("[ADMIN][PROPERTIES] Refresh metrics start");
    const [total, active, sold] = await Promise.all([
      propertyService.countAll(),
      propertyService.countByStatus("available"),
      propertyService.countByStatus("sold"),
    ]);
    setTotalPropertiesCount(total);
    setActivePropertiesCount(active);
    setSoldOutPropertiesCount(sold);
    logger.info("[ADMIN][PROPERTIES] Refresh metrics done", {
      total,
      active,
      sold,
    });
  };

  const fetchPropertiesPage = async (page: number, q: string) => {
    setIsLoadingProperties(true);
    setPropertiesError(null);
    try {
      logger.info("[ADMIN][PROPERTIES] Fetch start", { page, q });
      let rows: DbProperty[] = [];
      if (q.trim().length > 0) {
        rows = await propertyService.search(q.trim(), { limit: 5000 });
      } else {
        rows = await propertyService.getAll({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
        });
      }
      setProperties(rows.map(adaptDbProperty));
      logger.info("[ADMIN][PROPERTIES] Fetch success", { count: rows.length });
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Failed to load properties";
      setPropertiesError(message);
      logger.error("[ADMIN][PROPERTIES] Fetch failed", { message });
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    refreshMetrics().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (activeTab !== "Properties") return;
    if (showAddForm || selectedProperty) return;
    if (searchQuery.trim().length > 0) return;
    fetchPropertiesPage(currentPage, "").catch(() => undefined);
  }, [activeTab, currentPage, searchQuery, showAddForm, selectedProperty]);

  useEffect(() => {
    if (activeTab !== "Properties") return;
    if (showAddForm || selectedProperty) return;
    if (searchQuery.trim().length === 0) return;
    fetchPropertiesPage(1, searchQuery).catch(() => undefined);
  }, [activeTab, searchQuery, showAddForm, selectedProperty]);

  // Notify parent when form state changes
  const handleFormStateChange = (isActive: boolean) => {
    setShowAddForm(isActive);
    onAddFormStateChange?.(isActive);
  };

  const handleSearch = (query: string) => {
    logger.info("[ADMIN][PROPERTIES] Search change", { query });
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterClick = () => {
    logger.info("[ADMIN][PROPERTIES] Filter clicked");
  };

  const handleViewDetails = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
    }
  };

  const handleBackFromPropertyDetails = () => {
    setSelectedProperty(null);
  };

  const handleEditProperty = (propertyId: string) => {
    // Handle edit property
    logger.info("[ADMIN][PROPERTIES] Edit clicked", { propertyId });
  };

  const handleMarkSoldOut = async (propertyId: string) => {
    const current = properties.find((p) => p.id === propertyId);
    if (!current) return;
    const newStatus: PropertyStatus = current.isSoldOut ? "available" : "sold";
    try {
      logger.info("[ADMIN][PROPERTIES] Toggle sold-out start", {
        propertyId,
        newStatus,
      });
      await propertyService.update(propertyId, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isSoldOut: !p.isSoldOut } : p
        )
      );
      refreshMetrics().catch(() => undefined);
      logger.info("[ADMIN][PROPERTIES] Toggle sold-out success", {
        propertyId,
        newStatus,
      });
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Failed to update property";
      logger.error("[ADMIN][PROPERTIES] Toggle sold-out failed", {
        propertyId,
        newStatus,
        message,
      });
      alert(message);
    }
  };

  const handleViewDeveloperDetails = (developerId: number) => {
    // Find and set the selected developer
    const developer = developers.find((d) => d.id === developerId);
    if (developer) {
      setSelectedDeveloper(developer);
      setActiveTab("Properties"); // Switch to Properties tab to show developer's properties
      setCurrentPage(1); // Reset to first page
    }
  };

  const handleBackFromDeveloperDetails = () => {
    setSelectedDeveloper(null);
  };

  const handleEditDeveloper = (developerId: number) => {
    // Handle edit developer
    logger.info("[ADMIN][DEVELOPERS] Edit clicked", { developerId });
  };

  const handleRemoveDeveloper = (developerId: number) => {
    // Handle remove developer
    logger.info("[ADMIN][DEVELOPERS] Remove clicked", { developerId });
    // Optionally remove from list and reset selection
    setDevelopers((prev) => prev.filter((d) => d.id !== developerId));
    setSelectedDeveloper(null);
  };

  const handleAddDeveloper = (developerData: {
    name: string;
    email: string;
    phone: string;
  }) => {
    // Create new developer with default values
    const newDeveloper: Developer = {
      id:
        developers.length > 0
          ? Math.max(...developers.map((d) => d.id)) + 1
          : 1,
      name: developerData.name,
      email: developerData.email,
      phone: developerData.phone,
      totalProperties: 0,
      dateAdded: new Date().toISOString(),
      status: "Active",
    };

    // Add developer to the list
    setDevelopers((prev) => [...prev, newDeveloper]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddProperty = async (newProperty: {
    image: string;
    title: string;
    price: number;
    location: string;
    isSoldOut: boolean;
    category?: string;
    description?: string;
    developer?: string;
    mediaFiles: File[];
  }) => {
    try {
      logger.info("[ADMIN][PROPERTIES] Create start", {
        title: newProperty.title,
        mediaCount: newProperty.mediaFiles.length,
      });
      const uploadedPaths = await propertyMediaService.uploadMany(
        newProperty.mediaFiles
      );

      const type =
        newProperty.category &&
        newProperty.category.toLowerCase().includes("land")
          ? "land"
          : "housing";

      const status: PropertyStatus = newProperty.isSoldOut
        ? "sold"
        : "available";

      await propertyService.create({
        title: newProperty.title,
        location: newProperty.location,
        price: newProperty.price,
        type,
        status,
        description: newProperty.description || null,
        images: uploadedPaths,
      });

      setCurrentPage(1);
      setSearchQuery("");
      await Promise.all([fetchPropertiesPage(1, ""), refreshMetrics()]);
      handleFormStateChange(false);
      logger.info("[ADMIN][PROPERTIES] Create success", {
        title: newProperty.title,
        uploadedCount: uploadedPaths.length,
      });
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Failed to create property";
      logger.error("[ADMIN][PROPERTIES] Create failed", {
        title: newProperty.title,
        message,
      });
      alert(message);
      throw e;
    }
  };

  // Calculate pagination
  const totalItems =
    searchQuery.trim().length > 0 ? properties.length : totalPropertiesCount;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties =
    searchQuery.trim().length > 0
      ? properties.slice(startIndex, endIndex)
      : properties;

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Property Details Section - Shows when a property is selected */}
      {!showAddForm && selectedProperty && (
        <AdminPropertyDetails
          property={selectedProperty}
          onBack={handleBackFromPropertyDetails}
          onEdit={handleEditProperty}
          onMarkSoldOut={handleMarkSoldOut}
        />
      )}

      {/* Developer Details Section - Replaces Metric Cards when a developer is selected */}
      {!showAddForm && !selectedProperty && selectedDeveloper && (
        <DeveloperDetailsSection
          developer={selectedDeveloper}
          onBack={handleBackFromDeveloperDetails}
          onEdit={handleEditDeveloper}
          onRemove={handleRemoveDeveloper}
        />
      )}

      {/* Metric Cards - Only show when no developer or property is selected */}
      {!showAddForm && !selectedDeveloper && !selectedProperty && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Total properties"
            value={metrics.totalProperties}
            icon={<BuildingsIcon color="#6500AC" className="w-5 h-5" />}
            iconBgColor="#F0E6F7"
            iconStrokeColor="#F0E6F7"
            iconFgColor="#6500AC"
            valueTextColor="#101828"
          />
          <MetricCard
            title="Active properties"
            value={metrics.activeProperties}
            icon={<IslandIcon color="#22C55E" className="w-5 h-5" />}
            iconBgColor="#E9F9EF"
            iconStrokeColor="#E9F9EF"
            iconFgColor="#22C55E"
            valueTextColor="#101828"
          />
          <MetricCard
            title="Sold out properties"
            value={metrics.soldOutProperties}
            icon={<SoldOutIcon color="#EF4444" className="w-5 h-5" />}
            iconBgColor="#FAC5C5"
            iconStrokeColor="#FAC5C5"
            iconFgColor="#EF4444"
            valueTextColor="#101828"
          />
        </div>
      )}

      {/* Filter and Action Bar */}
      {!showAddForm && !selectedProperty && (
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

      {/* Content based on active tab */}
      {!showAddForm && !selectedProperty && (
        <>
          {activeTab === "Properties" ? (
            <>
              {/* Properties Grid */}
              <div className="mb-6">
                <div className="flex flex-row justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-600 mb-4">
                    {selectedDeveloper
                      ? "Developer's property"
                      : "All properties"}
                  </h2>
                  <button
                    onClick={() => handleFormStateChange(!showAddForm)}
                    className="bg-[#6500AC] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors whitespace-nowrap"
                  >
                    Add new property
                  </button>
                </div>
                {isLoadingProperties && (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Loading...
                  </div>
                )}
                {propertiesError && (
                  <div className="py-10 text-center text-sm text-red-600">
                    {propertiesError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentProperties.map((property) => (
                    <AdminPropertyCard
                      key={property.id}
                      image={property.image}
                      title={property.title}
                      price={property.price}
                      location={property.location}
                      isSoldOut={property.isSoldOut}
                      description={property.description}
                      onViewDetails={() => handleViewDetails(property.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination for Properties */}
              <AdminPagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <>
              {/* Developers Tab */}
              <AdminPropertyDeveloper
                developers={developers}
                onAddDeveloper={handleAddDeveloper}
                onViewDetails={handleViewDeveloperDetails}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardProperties;
