import { useEffect, useState, useCallback } from "react";
import FilterTabs from "./FilterTabs";
import SearchBar from "../SearchBar";
import PropertyCard from "./PropertyCard";
import Pagination from "../Pagination";
import BankDetailsModal from "../BankDetailsModal";
import PropertyDetails from "./PropertyDetails";
import type { Property } from "../../../modules/Properties";
import SearchFilterModal from "../SearchFilterModal";
import Allicon from "../../../assets/Stackedimg.png";
import {
  propertyService as propertyApiService,
  userService,
} from "../../../services/apiService";
import { favoritesService } from "../../../services/favoritesService";
import type { Property as DbProperty } from "../../../services/types";
import Loader from "../../Loader";
import { storageService } from "../../../services/storageService";
import { useUser } from "../../../context/UserContext";
import { logger } from "../../../utils/logger";

const DashboardProperties = () => {
  const { user, refreshUser } = useUser();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>(
    {}
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [activeSection, setActiveSection] = useState<"list" | "details">(
    "list"
  );
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 8;
  const hasBankDetails =
    Array.isArray(user?.bank_details) && user.bank_details.length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, appliedFilters]);

  // Map DB property type to UI filter type
  const mapDbTypeToUi = (type?: string) => {
    if (!type) return "lands";
    if (type === "land") return "lands";
    if (type === "housing") return "buildings";
    return type;
  };

  // Adapt Supabase property record to UI Property
  const adaptProperty = useCallback((p: DbProperty): Property => {
    const toPublicUrl = (path: string) => {
      if (!path) return Allicon;
      if (/^https?:\/\//i.test(path)) return path;
      return storageService.getPublicUrl("properties", path);
    };

    const firstImage = p.images?.[0];
    const primaryImage = firstImage ? toPublicUrl(firstImage) : Allicon;
    const uiType = mapDbTypeToUi(p.type);
    const images =
      p.images && p.images.length > 0
        ? p.images.map((img) => toPublicUrl(img))
        : [primaryImage];
    const priceStr =
      typeof p.price === "number"
        ? `₦${p.price.toLocaleString()}`
        : String(p.price ?? "");

    const percent = p.commission_percent;
    const commission =
      typeof percent === "number"
        ? `${
            Number.isInteger(percent) ? percent : percent.toFixed(2)
          }% commission`
        : "10% commission";
    return {
      id: p.id,
      title: p.title,
      location: p.location,
      price: priceStr,
      commission,
      commission_percent: percent ?? null,
      description: p.description ?? null,
      contract_docs: p.contract_docs ?? null,
      status: p.status ?? null,
      land_size_sqm: p.land_size_sqm ?? null,
      security: p.security ?? null,
      accessibility: p.accessibility ?? null,
      topography: p.topography ?? null,
      image: primaryImage,
      images,
      type: uiType,
    };
  }, []);

  // Load favorites from Supabase
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return;
      try {
        const favs = await favoritesService.getUserFavorites(user.id);
        const mappedFavs = favs
          .filter((f) => f.property) // Ensure property data exists
          .map((f) => adaptProperty(f.property!));
        setFavorites(mappedFavs);
      } catch (err) {
        logger.error("Failed to load favorites", err);
      }
    };
    fetchFavorites();
  }, [user?.id, adaptProperty]);

  // Fetch properties from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: {
          type?: "land" | "housing";
          status?: "available" | "sold" | "pending";
        } = {};

        if (filter === "lands") filters.type = "land";
        if (filter === "buildings" || filter === "houses")
          filters.type = "housing";
        if (filter === "sold") filters.status = "sold";

        let data: DbProperty[] = [];

        if (searchQuery.trim().length > 0) {
          data = await propertyApiService.search(searchQuery.trim(), {
            type: filters.type,
            status: filters.status,
          });
        } else {
          data = await propertyApiService.getAll(filters);
        }

        if (!isMounted) return;
        const adapted = data.map(adaptProperty);
        setItems(adapted);
      } catch (e: unknown) {
        if (!isMounted) return;
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: string }).message)
            : "Failed to load properties";
        setError(msg);
        setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    // Skip fetching when favorite filter is active (handled client-side)
    if (filter === "favorite") {
      setItems([]); // items will be derived from favorites below
      return;
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [filter, searchQuery, adaptProperty]);

  // Filter + search
  const sourceList = filter === "favorite" ? favorites : items;
  const normalizeTokens = (value: string) =>
    value
      .toLowerCase()
      .split(/[,-]/)
      .map((t) => t.trim())
      .filter(Boolean);

  const getPriceNumber = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const filteredProperties = sourceList.filter((p) => {
    const isSold = (p.status ?? "").toLowerCase() === "sold";
    if (filter === "sold") {
      if (!isSold) return false;
    } else if (filter !== "all") {
      if (isSold) return false;
    }

    if (filter !== "favorite") {
      const typeTabs = new Set(["lands", "buildings"]);
      if (typeTabs.has(filter)) {
        const matchFilter =
          filter === "all" || p.type?.toLowerCase() === filter.toLowerCase();
        if (!matchFilter) return false;
      }
    }

    // Apply search filter
    const matchSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    const selectedType = String(appliedFilters["Property Type"] ?? "").trim();
    const selectedTypeLower = selectedType.toLowerCase();
    if (selectedTypeLower && selectedTypeLower !== "any") {
      const isLand =
        selectedTypeLower.includes("land") ||
        selectedTypeLower.includes("plot");
      const isBuilding =
        selectedTypeLower.includes("house") ||
        selectedTypeLower.includes("apartment") ||
        selectedTypeLower.includes("office") ||
        selectedTypeLower.includes("warehouse");
      const wants = isLand ? "lands" : isBuilding ? "buildings" : "";
      if (wants && (p.type ?? "").toLowerCase() !== wants) return false;
    }

    const selectedLocation = String(appliedFilters["Location"] ?? "").trim();
    if (selectedLocation) {
      const locationTokens = normalizeTokens(selectedLocation);
      const propertyLocation = (p.location ?? "").toLowerCase();
      const matchesAllTokens = locationTokens.every((t) =>
        propertyLocation.includes(t)
      );
      if (!matchesAllTokens) return false;
    }

    const priceRange = appliedFilters["Price (₦)"];
    if (Array.isArray(priceRange) && priceRange.length === 2) {
      const min = Number(priceRange[0]);
      const max = Number(priceRange[1]);
      const priceNum = getPriceNumber(p.price ?? "0");
      if (Number.isFinite(min) && priceNum < min) return false;
      if (Number.isFinite(max) && priceNum > max) return false;
    }

    return true;
  });

  const sortedProperties = (() => {
    const sort = String(appliedFilters["Sort"] ?? "recommended");
    if (sort === "recommended") return filteredProperties;
    const copy = [...filteredProperties];

    const comparePrice = (a: Property, b: Property) =>
      getPriceNumber(a.price ?? "0") - getPriceNumber(b.price ?? "0");
    const compareTitle = (a: Property, b: Property) =>
      String(a.title ?? "").localeCompare(String(b.title ?? ""));

    if (sort === "price-asc") return copy.sort(comparePrice);
    if (sort === "price-desc") return copy.sort((a, b) => comparePrice(b, a));
    if (sort === "title-asc") return copy.sort(compareTitle);
    if (sort === "title-desc") return copy.sort((a, b) => compareTitle(b, a));
    return filteredProperties;
  })();

  const paginated = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFavorite = async (property: Property) => {
    if (!user?.id) {
      logger.warn("User not logged in, cannot toggle favorite");
      return;
    }

    // Optimistic update
    const isAlreadyFavorite = favorites.some((p) => p.id === property.id);

    setFavorites((prev) => {
      if (isAlreadyFavorite) {
        return prev.filter((p) => p.id !== property.id);
      } else {
        return [...prev, property];
      }
    });

    try {
      if (isAlreadyFavorite) {
        await favoritesService.removeFavorite(user.id, property.id);
      } else {
        await favoritesService.addFavorite(user.id, property.id);
      }
    } catch (err) {
      // Revert on error
      logger.error("Failed to update favorite", err);
      setFavorites((prev) => {
        if (isAlreadyFavorite) {
          return [...prev, property];
        } else {
          return prev.filter((p) => p.id !== property.id);
        }
      });
    }
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setActiveSection("details");
  };

  const handleBackToList = () => {
    setActiveSection("list");
    setSelectedProperty(null);
  };

  const handleAddBankAccount = async (bankData: {
    bankName: string;
    accountNo: string;
    accountName: string;
  }) => {
    if (!user) {
      logger.error("Cannot add bank account: No user found");
      return;
    }

    try {
      logger.info("Adding bank account...", bankData);

      // Update via service
      await userService.updateBankDetails(user.id, bankData);

      // Refresh user context to update UI
      await refreshUser();

      setIsModalOpen(false);
      logger.info("Bank account added successfully");
    } catch (error) {
      logger.error("Failed to add bank account:", error);
      // Ideally show a toast notification here
    }
  };

  // Show Property Details if a property is selected
  if (activeSection === "details" && selectedProperty) {
    return (
      <div className="p-6">
        <PropertyDetails
          property={selectedProperty}
          onBack={handleBackToList}
          isFavorited={favorites.some((p) => p.id === selectedProperty.id)}
          onFavorite={() => toggleFavorite(selectedProperty)}
        />
      </div>
    );
  }

  // Show Property List (default view)
  return (
    <div>
      {loading && <Loader text="Loading properties..." />}
      {error && (
        <div className="mx-4 md:mx-6 my-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      {/* 🔔 Alert Banner */}
      {!hasBankDetails && (
        <div className="bg-purple-50 text-purple-700 text-xs md:text-sm py-2 px-3 md:py-3 md:px-4 flex w-full items-center shadow-sm">
          <div className="hidden lg:flex flex-grow items-center justify-center gap-2">
            <span className="text-xs md:text-[14px] text-purple-700">
              Add bank account details to receive earnings
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden lg:flex items-baseline gap-2 text-[#5E17EB] text-[10px] md:text-[12px] hover:underline"
            >
              Add account details
              <span className="text-base md:text-lg text-gray-500">→</span>
            </button>
            <BankDetailsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAddBankAccount={handleAddBankAccount}
            />
          </div>
        </div>
      )}

      {/* 🔍 Filters (search bar & tabs) */}
      <div className="p-2 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
        <FilterTabs onFilterChange={setFilter} />
        {/* UNIFORM SEARCH BAR WRAPPER */}
        <div className="w-full lg:w-[350px]">
          <SearchBar
            className="w-full"
            onSearch={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
          />
        </div>
      </div>

      {/* 🏘 Property Section (Grid + Filter Panel) */}
      <div className="relative px-2 md:px-6">
        {/* Empty State for Favorites */}
        {filter === "favorite" && filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
            {/* Empty State Illustration */}
            <div className="relative mb-4 md:mb-8">
              {/* Stack of property cards illustration */}
              <img
                src={Allicon}
                alt="No favorites icon"
                className="w-16 md:w-[185px]"
              />
            </div>

            {/* Empty State Text */}
            <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 text-center">
              You haven't added any property to favourite
            </h3>
            <p className="text-gray-500 text-[10px] md:text-sm text-center mb-4 md:mb-6 max-w-md">
              Browse through our amazing properties and add your favorites to
              keep track of them
            </p>

            {/* Explore Button */}
            <button
              onClick={() => setFilter("all")}
              className="bg-[#6500AC] hover:bg-[#5E17EB] text-white px-3 py-1.5 md:px-8 md:py-3 rounded-lg font-semibold text-xs md:text-base transition-colors duration-200"
            >
              Explore Properties
            </button>
          </div>
        ) : filter === "buildings" && filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
            {/* Empty State Illustration */}
            <div className="relative mb-4 md:mb-8">
              {/* Stack of property cards illustration */}
              <img
                src={Allicon}
                alt="No buildings icon"
                className="w-16 md:w-[185px]"
              />
            </div>

            {/* Empty State Text */}
            <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 text-center">
              No buildings available
            </h3>
            <p className="text-gray-500 text-[10px] md:text-sm text-center mb-4 md:mb-6 max-w-md">
              There are currently no building properties available. Check back
              later for new listings.
            </p>

            {/* Explore Button */}
            <button
              onClick={() => setFilter("all")}
              className="bg-[#6500AC] hover:bg-[#5E17EB] text-white px-3 py-1.5 md:px-8 md:py-3 rounded-lg font-semibold text-xs md:text-base transition-colors duration-200"
            >
              View All Properties
            </button>
          </div>
        ) : filter === "sold" && filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
            {/* Empty State Illustration */}
            <div className="relative mb-4 md:mb-8">
              {/* Stack of property cards illustration */}
              <img
                src={Allicon}
                alt="No sold properties icon"
                className="w-16 md:w-[185px]"
              />
            </div>

            {/* Empty State Text */}
            <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 text-center">
              No sold properties
            </h3>
            <p className="text-gray-500 text-[10px] md:text-sm text-center mb-4 md:mb-6 max-w-md">
              There are currently no sold properties to display. All properties
              are still available for purchase.
            </p>

            {/* Explore Button */}
            <button
              onClick={() => setFilter("all")}
              className="bg-[#6500AC] hover:bg-[#5E17EB] text-white px-3 py-1.5 md:px-8 md:py-3 rounded-lg font-semibold text-xs md:text-base transition-colors duration-200"
            >
              View Available Properties
            </button>
          </div>
        ) : filter === "lands" && filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
            {/* Empty State Illustration */}
            <div className="relative mb-4 md:mb-8">
              {/* Stack of property cards illustration */}
              <img
                src={Allicon}
                alt="No lands icon"
                className="w-16 md:w-[185px]"
              />
            </div>

            {/* Empty State Text */}
            <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 text-center">
              No land properties available
            </h3>
            <p className="text-gray-500 text-[10px] md:text-sm text-center mb-4 md:mb-6 max-w-md">
              There are currently no land properties available. Check back later
              for new land listings.
            </p>

            {/* Explore Button */}
            <button
              onClick={() => setFilter("all")}
              className="bg-[#6500AC] hover:bg-[#5E17EB] text-white px-3 py-1.5 md:px-8 md:py-3 rounded-lg font-semibold text-xs md:text-base transition-colors duration-200"
            >
              View All Properties
            </button>
          </div>
        ) : filter === "all" && filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
            {/* Empty State Illustration */}
            <div className="relative mb-4 md:mb-8">
              {/* Stack of property cards illustration */}
              <img
                src={Allicon}
                alt="No properties icon"
                className="w-16 md:w-[185px]"
              />
            </div>

            {/* Empty State Text */}
            <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 text-center">
              No properties found
            </h3>
            <p className="text-gray-500 text-[10px] md:text-sm text-center mb-4 md:mb-6 max-w-md">
              We couldn't find any properties matching your search criteria. Try
              adjusting your filters or search terms.
            </p>

            {/* Explore Button */}
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="bg-[#6500AC] hover:bg-[#5E17EB] text-white px-3 py-1.5 md:px-8 md:py-3 rounded-lg font-semibold text-xs md:text-base transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Property Grid */
          <section
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 transition-all duration-300 ${
              isFilterOpen ? "xl:grid-cols-3 xl:pr-[380px]" : "xl:grid-cols-4"
            }`}
          >
            {paginated.map((item) => (
              <PropertyCard
                key={item.id}
                {...item}
                isFavorited={favorites.some((p) => p.id === item.id)}
                onFavorite={() => toggleFavorite(item)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </section>
        )}
      </div>

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <div className="mt-3 mb-4 px-2 md:mt-8 md:mb-12 md:px-6">
          <Pagination
            totalItems={filteredProperties.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <SearchFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={appliedFilters}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setCurrentPage(1);
        }}
        onReset={() => {
          setAppliedFilters({});
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default DashboardProperties;
