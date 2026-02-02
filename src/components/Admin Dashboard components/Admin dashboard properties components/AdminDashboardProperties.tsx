import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import AdminPropertyCard from "./AdminPropertyCard.tsx";
import AdminPropertyDeveloper from "./AdminPropertyDeveloper.tsx";
import AdminSearchBar from "../../AdminSearchBar.tsx";
import AdminPagination from "../../AdminPagination.tsx";
import AdminSearchFilterModal from "../../AdminSearchFilterModal.tsx";
import BuildingsIcon from "../../icons/BuildingsIcon.tsx";
import IslandIcon from "../../icons/IslandIcon.tsx";
import SoldOutIcon from "../../icons/SoldOutIcon.tsx";
import AllIcon from "../../icons/AllIcon.tsx";
import RealtorsIcon from "../../icons/RealtorsIcon.tsx";
import AddPropertyForm from "./AddPropertyForm.tsx";
import DeveloperDetailsSection from "./DeveloperDetailsSection.tsx";
import AdminPropertyDetails from "./AdminPropertyDetails.tsx";
import AddDeveloperPopupModal from "./AddDeveloperPopupModal.tsx";
import {
  developerService,
  propertyMediaService,
  propertyService,
} from "../../../services/apiService";
import Loader from "../../Loader.tsx";
import type {
  Developer,
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

interface RemoveDeveloperModalProps {
  isOpen: boolean;
  developerName: string;
  isRemoving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const RemoveDeveloperModal = ({
  isOpen,
  developerName,
  isRemoving,
  error,
  onClose,
  onConfirm,
}: RemoveDeveloperModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <div className="flex flex-col items-start gap-3">
            <div className="w-8 h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1B39]">
              Remove developer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA1AA] hover:text-[#667085] transition-colors"
            disabled={isRemoving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[#667085] text-sm leading-relaxed">
            You are about to remove{" "}
            <span className="text-[#0A1B39] font-medium">{developerName}</span>{" "}
            from the active developers list.
          </p>

          <ul className="space-y-2 text-[#667085] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>The developer will be marked as Removed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] mt-1">•</span>
              <span>Associated properties will remain as-is.</span>
            </li>
          </ul>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[#EAECF0]">
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="px-4 py-2 border border-[#D0D5DD] rounded-lg text-sm font-semibold text-[#344054] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="px-4 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-semibold hover:bg-[#B91C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRemoving ? "Removing..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface Property {
  id: string;
  image: string;
  title: string;
  price: number;
  location: string;
  isSoldOut: boolean;
  category?: string;
  description?: string;
  commissionPercent?: number;
  landSizeSqm?: number;
  security?: string;
  accessibility?: string;
  topography?: string;
  developer?: string;
  developerId?: string;
  images?: string[];
  imagePaths?: string[];
  contractDocs?: string[];
}

interface AdminDashboardPropertiesProps {
  onAddFormStateChange?: (isActive: boolean) => void;
  initialSelectedPropertyId?: string | null;
  onInitialSelectedPropertyConsumed?: () => void;
}

const AdminDashboardProperties = ({
  onAddFormStateChange,
  initialSelectedPropertyId,
  onInitialSelectedPropertyConsumed,
}: AdminDashboardPropertiesProps) => {
  const [activeTab, setActiveTab] = useState<"Properties" | "Developers">(
    "Properties",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesSearchInput, setPropertiesSearchInput] = useState("");
  const [propertiesSearchQuery, setPropertiesSearchQuery] = useState("");
  const [developersSearchInput, setDevelopersSearchInput] = useState("");
  const [developersSearchQuery, setDevelopersSearchQuery] = useState("");
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [hasFetchedPropertiesOnce, setHasFetchedPropertiesOnce] =
    useState(false);
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);
  const [activePropertiesCount, setActivePropertiesCount] = useState(0);
  const [soldOutPropertiesCount, setSoldOutPropertiesCount] = useState(0);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [developerPropertiesCount, setDeveloperPropertiesCount] = useState(0);
  const [developerPropertiesMessage, setDeveloperPropertiesMessage] = useState<
    string | null
  >(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null,
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(
    null,
  );
  const [developerToRemove, setDeveloperToRemove] = useState<Developer | null>(
    null,
  );
  const [isRemoveDeveloperModalOpen, setIsRemoveDeveloperModalOpen] =
    useState(false);
  const [isRemovingDeveloper, setIsRemovingDeveloper] = useState(false);
  const [removeDeveloperError, setRemoveDeveloperError] = useState<
    string | null
  >(null);

  // Filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [propertiesFilters, setPropertiesFilters] = useState<
    Record<string, unknown>
  >({});
  const [developersFilters, setDevelopersFilters] = useState<
    Record<string, unknown>
  >({});

  const itemsPerPage = 8;

  const developersById = useMemo(() => {
    return new Map(developers.map((d) => [d.id, d]));
  }, [developers]);

  useEffect(() => {
    setProperties((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((p) => {
        if (!p.developerId) return p;
        if (p.developer && p.developer.trim().length > 0) return p;
        const name = developersById.get(p.developerId)?.name;
        if (!name) return p;
        changed = true;
        return { ...p, developer: name };
      });
      return changed ? next : prev;
    });
  }, [developersById]);

  const adaptDbProperty = (p: DbProperty): Property => {
    const imgPaths = Array.isArray(p.images) ? p.images : [];
    const urls = imgPaths.map((img) => propertyMediaService.getPublicUrl(img));
    const image = urls[0] || "/placeholder-property.jpg";
    const developerId = p.developer_id ?? undefined;
    const developerName = developerId
      ? developersById.get(developerId)?.name
      : undefined;
    const contractDocs = Array.isArray(p.contract_docs) ? p.contract_docs : [];
    return {
      id: p.id,
      image,
      images: urls.length > 0 ? urls : [image],
      imagePaths: imgPaths,
      title: p.title,
      price: Number(p.price) || 0,
      location: p.location,
      isSoldOut: p.status === "sold",
      description: p.description ?? undefined,
      category: p.category ?? undefined,
      commissionPercent:
        typeof p.commission_percent === "number"
          ? p.commission_percent
          : p.commission_percent != null
            ? Number(p.commission_percent)
            : undefined,
      landSizeSqm:
        typeof p.land_size_sqm === "number"
          ? p.land_size_sqm
          : p.land_size_sqm != null
            ? Number(p.land_size_sqm)
            : undefined,
      security: p.security ?? undefined,
      accessibility: p.accessibility ?? undefined,
      topography: p.topography ?? undefined,
      developerId,
      developer: developerName,
      contractDocs,
    };
  };

  const toUserErrorMessage = (e: unknown, fallback: string) => {
    const obj =
      e && typeof e === "object" ? (e as Record<string, unknown>) : null;
    const messageRaw =
      typeof (obj?.message ?? null) === "string"
        ? String(obj?.message)
        : e instanceof Error
          ? e.message
          : "";
    const code =
      typeof (obj?.code ?? null) === "string" ? String(obj?.code) : "";
    const details =
      typeof (obj?.details ?? null) === "string" ? String(obj?.details) : "";
    const hint =
      typeof (obj?.hint ?? null) === "string" ? String(obj?.hint) : "";
    const combined = `${messageRaw} ${details} ${hint}`.toLowerCase();

    if (
      code === "42501" ||
      combined.includes("row level security") ||
      combined.includes("row-level security") ||
      combined.includes("permission denied") ||
      combined.includes("insufficient_privilege") ||
      combined.includes("update did not return a row")
    ) {
      return "You don't have permission to perform this action. Please sign in with an admin account.";
    }

    if (combined.includes("not authenticated")) {
      return "Your session has expired. Please sign in again.";
    }

    return messageRaw.trim().length > 0 ? messageRaw : fallback;
  };

  const metrics = useMemo(
    () => ({
      totalProperties: totalPropertiesCount.toLocaleString(),
      activeProperties: activePropertiesCount.toLocaleString(),
      soldOutProperties: soldOutPropertiesCount.toLocaleString(),
    }),
    [totalPropertiesCount, activePropertiesCount, soldOutPropertiesCount],
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

  const fetchPropertiesPage = async (
    page: number,
    q: string,
    developerId?: string,
  ) => {
    setIsLoadingProperties(true);
    setPropertiesError(null);
    setDeveloperPropertiesMessage(null);

    // Extract filters
    const priceRange = propertiesFilters["Price (₦)"] as number[] | undefined;
    const minPrice = priceRange?.[0];
    const maxPrice = priceRange?.[1];
    const category = propertiesFilters["Property Type"] as string | undefined;
    const location = propertiesFilters["Location"] as string | undefined;

    try {
      logger.info("[ADMIN][PROPERTIES] Fetch start", {
        page,
        q,
        developerId,
        activeFilters: propertiesFilters,
      });
      let rows: DbProperty[] = [];
      if (q.trim().length > 0) {
        rows = await propertyService.search(q.trim(), {
          limit: 5000,
          developerId,
          minPrice,
          maxPrice,
          category,
          location,
        });
      } else {
        rows = await propertyService.getAll({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          developerId,
          minPrice,
          maxPrice,
          category,
          location,
        });
      }
      setProperties(rows.map(adaptDbProperty));
      logger.info("[ADMIN][PROPERTIES] Fetch success", { count: rows.length });
    } catch (e: unknown) {
      const missingDeveloperColumn = (() => {
        if (!e || typeof e !== "object") return false;
        const anyErr = e as Record<string, unknown>;
        const code = typeof anyErr.code === "string" ? anyErr.code : "";
        const message =
          typeof anyErr.message === "string" ? anyErr.message : "";
        const details =
          typeof anyErr.details === "string" ? anyErr.details : "";
        const combined = `${message} ${details}`.toLowerCase();
        if (code === "42703") return true;
        if (code === "PGRST204" && combined.includes("developer")) return true;
        if (combined.includes("schema cache") && combined.includes("developer"))
          return true;
        return (
          combined.includes("properties.developer") &&
          combined.includes("does not exist")
        );
      })();

      if (developerId && missingDeveloperColumn) {
        setProperties([]);
        setPropertiesError(null);
        setDeveloperPropertiesCount(0);
        setDeveloperPropertiesMessage("This developer has no properties yet.");
        logger.warn("[ADMIN][PROPERTIES] Missing developer link column", {
          developerId,
        });
        return;
      }

      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Failed to load properties";
      setPropertiesError(message);
      logger.error("[ADMIN][PROPERTIES] Fetch failed", { message });
    } finally {
      setIsLoadingProperties(false);
      setHasFetchedPropertiesOnce(true);
    }
  };

  useEffect(() => {
    if (!initialSelectedPropertyId) return;
    if (!hasFetchedPropertiesOnce) return;
    if (isLoadingProperties) return;

    setShowAddForm(false);
    setSelectedDeveloper(null);
    setActiveTab("Properties");
    setPropertiesSearchInput("");
    setPropertiesSearchQuery("");

    const match = properties.find((p) => p.id === initialSelectedPropertyId);
    if (match) {
      setSelectedProperty(match);
    }
    onInitialSelectedPropertyConsumed?.();
  }, [
    hasFetchedPropertiesOnce,
    initialSelectedPropertyId,
    isLoadingProperties,
    onInitialSelectedPropertyConsumed,
    properties,
  ]);

  useEffect(() => {
    refreshMetrics().catch(() => undefined);
  }, []);

  useEffect(() => {
    developerService
      .getAll({ limit: 5000 })
      .then((rows) => {
        setDevelopers((prev) => {
          const prevById = new Map(prev.map((d) => [d.id, d]));
          return rows.map((d) => ({
            ...d,
            totalProperties:
              prevById.get(d.id)?.totalProperties ?? d.totalProperties,
          }));
        });
      })
      .catch((e: unknown) => {
        logger.error("[ADMIN][DEVELOPERS] Prefetch failed", { error: e });
      });
  }, []);

  useEffect(() => {
    if (activeTab !== "Properties") return;
    if (showAddForm || selectedProperty) return;
    if (propertiesSearchQuery.trim().length > 0) return;
    fetchPropertiesPage(currentPage, "", selectedDeveloper?.id).catch(
      () => undefined,
    );
  }, [
    activeTab,
    currentPage,
    propertiesSearchQuery,
    showAddForm,
    selectedProperty,
    selectedDeveloper?.id,
    propertiesFilters,
  ]);

  useEffect(() => {
    if (activeTab !== "Properties") return;
    if (showAddForm || selectedProperty) return;
    if (propertiesSearchQuery.trim().length === 0) return;
    fetchPropertiesPage(1, propertiesSearchQuery, selectedDeveloper?.id).catch(
      () => undefined,
    );
  }, [
    activeTab,
    propertiesSearchQuery,
    showAddForm,
    selectedProperty,
    selectedDeveloper?.id,
    propertiesFilters,
  ]);

  useEffect(() => {
    if (!selectedDeveloper?.id) {
      setDeveloperPropertiesCount(0);
      return;
    }
    propertyService
      .countByDeveloperId(selectedDeveloper.id)
      .then(setDeveloperPropertiesCount)
      .catch(() => setDeveloperPropertiesCount(0));
  }, [selectedDeveloper?.id]);

  useEffect(() => {
    if (activeTab !== "Developers") return;
    developerService
      .getAll({ limit: 5000 })
      .then(async (rows) => {
        const counts = await Promise.all(
          rows.map((d) =>
            propertyService.countByDeveloperId(d.id).catch(() => 0),
          ),
        );
        setDevelopers(
          rows.map((d, idx) => ({ ...d, totalProperties: counts[idx] })),
        );
      })
      .catch((e: unknown) => {
        logger.error("[ADMIN][DEVELOPERS] Fetch failed", { error: e });
        setDevelopers([]);
      });
  }, [activeTab]);

  // Notify parent when form state changes
  const handleFormStateChange = (isActive: boolean) => {
    setShowAddForm(isActive);
    onAddFormStateChange?.(isActive);
  };

  const handleSearch = (query: string) => {
    logger.info("[ADMIN][PROPERTIES] Search change", { query, activeTab });
    if (activeTab === "Developers") {
      setDevelopersSearchInput(query);
    } else {
      setPropertiesSearchInput(query);
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      setPropertiesSearchQuery(propertiesSearchInput);
    }, 400);
    return () => clearTimeout(handle);
  }, [propertiesSearchInput]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDevelopersSearchQuery(developersSearchInput);
    }, 400);
    return () => clearTimeout(handle);
  }, [developersSearchInput]);

  const handleFilterClick = () => {
    logger.info("[ADMIN][PROPERTIES] Filter clicked");
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = (filters: Record<string, unknown>) => {
    logger.info("[ADMIN][PROPERTIES] Filter applied", { filters });
    if (activeTab === "Developers") {
      setDevelopersFilters(filters);
    } else {
      setPropertiesFilters(filters);
    }
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    logger.info("[ADMIN][PROPERTIES] Filter reset");
    if (activeTab === "Developers") {
      setDevelopersFilters({});
    } else {
      setPropertiesFilters({});
    }
    setCurrentPage(1);
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
    const current =
      properties.find((p) => p.id === propertyId) ?? selectedProperty;
    if (!current) return;
    logger.info("[ADMIN][PROPERTIES] Edit clicked", { propertyId });
    setEditingProperty(current);
    setSelectedProperty(null);
    handleFormStateChange(true);
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
          p.id === propertyId ? { ...p, isSoldOut: !p.isSoldOut } : p,
        ),
      );
      setSelectedProperty((prev) =>
        prev?.id === propertyId
          ? { ...prev, isSoldOut: !prev.isSoldOut }
          : prev,
      );
      refreshMetrics().catch(() => undefined);
      logger.info("[ADMIN][PROPERTIES] Toggle sold-out success", {
        propertyId,
        newStatus,
      });
    } catch (e: unknown) {
      const message = toUserErrorMessage(e, "Failed to update property");
      logger.error("[ADMIN][PROPERTIES] Toggle sold-out failed", {
        propertyId,
        newStatus,
        message,
      });
      alert(message);
    }
  };

  const handleViewDeveloperDetails = (developerId: string) => {
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
    setCurrentPage(1);
  };

  const handleEditDeveloper = (developerId: string) => {
    logger.info("[ADMIN][DEVELOPERS] Edit clicked", { developerId });
    const developer =
      developers.find((d) => d.id === developerId) ??
      (selectedDeveloper?.id === developerId ? selectedDeveloper : null);
    if (!developer) return;
    setEditingDeveloper(developer);
  };

  const handleRemoveDeveloper = (developerId: string) => {
    logger.info("[ADMIN][DEVELOPERS] Remove clicked", { developerId });
    const developer =
      developers.find((d) => d.id === developerId) ??
      (selectedDeveloper?.id === developerId ? selectedDeveloper : null);
    if (!developer) return;
    setDeveloperToRemove(developer);
    setRemoveDeveloperError(null);
    setIsRemoveDeveloperModalOpen(true);
  };

  const handleCloseRemoveDeveloperModal = () => {
    if (isRemovingDeveloper) return;
    setIsRemoveDeveloperModalOpen(false);
    setDeveloperToRemove(null);
    setRemoveDeveloperError(null);
  };

  const handleConfirmRemoveDeveloper = async () => {
    if (!developerToRemove) return;
    setIsRemovingDeveloper(true);
    setRemoveDeveloperError(null);
    try {
      const updated = await developerService.update(developerToRemove.id, {
        status: "Removed",
      });
      setDevelopers((prev) =>
        prev.map((d) =>
          d.id === developerToRemove.id
            ? {
                ...d,
                ...updated,
                totalProperties: d.totalProperties,
                dateAdded: d.dateAdded,
              }
            : d,
        ),
      );
      setSelectedDeveloper((prev) =>
        prev?.id === developerToRemove.id
          ? {
              ...prev,
              ...updated,
              totalProperties: prev.totalProperties,
              dateAdded: prev.dateAdded,
            }
          : prev,
      );
      handleCloseRemoveDeveloperModal();
    } catch (e: unknown) {
      logger.error("[ADMIN][DEVELOPERS] Remove failed", {
        developerId: developerToRemove.id,
        error: e,
      });
      setRemoveDeveloperError(
        toUserErrorMessage(e, "Failed to remove developer"),
      );
    } finally {
      setIsRemovingDeveloper(false);
    }
  };

  const handleAddDeveloper = (developerData: {
    name: string;
    email: string;
    phone: string;
  }) => {
    developerService
      .create(developerData)
      .then((created) => {
        setDevelopers((prev) => [{ ...created, totalProperties: 0 }, ...prev]);
      })
      .catch((e: unknown) => {
        logger.error("[ADMIN][DEVELOPERS] Create failed", { error: e });
        alert(toUserErrorMessage(e, "Failed to add developer"));
      });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddProperty = async (newProperty: {
    id?: string;
    image: string;
    title: string;
    price: number;
    location: string;
    isSoldOut: boolean;
    category?: string;
    description?: string;
    commissionPercent?: number;
    landSizeSqm?: number;
    security?: string;
    accessibility?: string;
    topography?: string;
    developerId?: string;
    imageOrder: Array<
      { kind: "existing"; path: string } | { kind: "new"; fileIndex: number }
    >;
    mediaFiles: File[];
    contractDocs: string[];
    existingContractDocs: string[];
    contractFiles: File[];
  }) => {
    try {
      logger.info("[ADMIN][PROPERTIES] Create start", {
        title: newProperty.title,
        mediaCount: newProperty.mediaFiles.length,
      });
      const uploadedPaths = await propertyMediaService.uploadMany(
        newProperty.mediaFiles,
      );
      const uploadedContractPaths = await propertyMediaService.uploadMany(
        newProperty.contractFiles,
      );
      const contractDocs = [
        ...(newProperty.contractDocs ?? []).filter(
          (doc) => typeof doc === "string" && doc.trim().length > 0,
        ),
        ...(newProperty.existingContractDocs ?? []).filter(
          (doc) => typeof doc === "string" && doc.trim().length > 0,
        ),
        ...uploadedContractPaths,
      ];

      const type =
        newProperty.category &&
        newProperty.category.toLowerCase().includes("land")
          ? "land"
          : "housing";

      const status: PropertyStatus = newProperty.isSoldOut
        ? "sold"
        : "available";

      const imagesToSave =
        Array.isArray(newProperty.imageOrder) &&
        newProperty.imageOrder.length > 0
          ? newProperty.imageOrder
              .map((item) =>
                item.kind === "existing"
                  ? item.path
                  : uploadedPaths[item.fileIndex],
              )
              .filter(
                (v): v is string =>
                  typeof v === "string" && v.trim().length > 0,
              )
          : uploadedPaths;

      await propertyService.create({
        title: newProperty.title,
        location: newProperty.location,
        price: newProperty.price,
        type,
        status,
        description: newProperty.description || null,
        images: imagesToSave,
        contract_docs: contractDocs.length > 0 ? contractDocs : null,
        developer_id: newProperty.developerId || null,
        category: newProperty.category || null,
        commission_percent:
          typeof newProperty.commissionPercent === "number" &&
          Number.isFinite(newProperty.commissionPercent)
            ? newProperty.commissionPercent
            : null,
        land_size_sqm:
          typeof newProperty.landSizeSqm === "number" &&
          Number.isFinite(newProperty.landSizeSqm)
            ? newProperty.landSizeSqm
            : null,
        security: newProperty.security?.trim() ? newProperty.security : null,
        accessibility: newProperty.accessibility?.trim()
          ? newProperty.accessibility
          : null,
        topography: newProperty.topography?.trim()
          ? newProperty.topography
          : null,
      });

      setCurrentPage(1);
      setPropertiesSearchInput("");
      setPropertiesSearchQuery("");
      await Promise.all([
        fetchPropertiesPage(1, "", selectedDeveloper?.id),
        refreshMetrics(),
      ]);
      handleFormStateChange(false);
      logger.info("[ADMIN][PROPERTIES] Create success", {
        title: newProperty.title,
        uploadedCount: uploadedPaths.length,
      });
    } catch (e: unknown) {
      const message = toUserErrorMessage(e, "Failed to create property");
      logger.error("[ADMIN][PROPERTIES] Create failed", {
        title: newProperty.title,
        message,
      });
      alert(message);
      throw e;
    }
  };

  const handleUpdateProperty = async (updated: {
    id?: string;
    image: string;
    title: string;
    price: number;
    location: string;
    isSoldOut: boolean;
    category?: string;
    description?: string;
    commissionPercent?: number;
    landSizeSqm?: number;
    security?: string;
    accessibility?: string;
    topography?: string;
    developerId?: string;
    imageOrder: Array<
      { kind: "existing"; path: string } | { kind: "new"; fileIndex: number }
    >;
    mediaFiles: File[];
    contractDocs: string[];
    existingContractDocs: string[];
    contractFiles: File[];
  }) => {
    const propertyId = updated.id ?? editingProperty?.id;
    if (!propertyId) return;
    try {
      logger.info("[ADMIN][PROPERTIES] Update start", {
        propertyId,
        title: updated.title,
        mediaCount: updated.mediaFiles.length,
      });

      const uploadedPaths = await propertyMediaService.uploadMany(
        updated.mediaFiles,
      );
      const uploadedContractPaths = await propertyMediaService.uploadMany(
        updated.contractFiles,
      );

      const imagesToSave =
        Array.isArray(updated.imageOrder) && updated.imageOrder.length > 0
          ? updated.imageOrder
              .map((item) =>
                item.kind === "existing"
                  ? item.path
                  : uploadedPaths[item.fileIndex],
              )
              .filter(
                (v): v is string =>
                  typeof v === "string" && v.trim().length > 0,
              )
          : uploadedPaths;

      const contractDocsToSave = [
        ...(updated.contractDocs ?? []).filter(
          (doc) => typeof doc === "string" && doc.trim().length > 0,
        ),
        ...(updated.existingContractDocs ?? []).filter(
          (doc) => typeof doc === "string" && doc.trim().length > 0,
        ),
        ...uploadedContractPaths,
      ];

      const type =
        updated.category && updated.category.toLowerCase().includes("land")
          ? "land"
          : "housing";
      const status: PropertyStatus = updated.isSoldOut ? "sold" : "available";

      const updatedDb = await propertyService.update(propertyId, {
        title: updated.title,
        location: updated.location,
        price: updated.price,
        type,
        status,
        description: updated.description || null,
        images: imagesToSave.length > 0 ? imagesToSave : null,
        contract_docs:
          contractDocsToSave.length > 0 ? contractDocsToSave : null,
        developer_id: updated.developerId || null,
        category: updated.category || null,
        commission_percent:
          typeof updated.commissionPercent === "number" &&
          Number.isFinite(updated.commissionPercent)
            ? updated.commissionPercent
            : null,
        land_size_sqm:
          typeof updated.landSizeSqm === "number" &&
          Number.isFinite(updated.landSizeSqm)
            ? updated.landSizeSqm
            : null,
        security: updated.security?.trim() ? updated.security : null,
        accessibility: updated.accessibility?.trim()
          ? updated.accessibility
          : null,
        topography: updated.topography?.trim() ? updated.topography : null,
      });

      const updatedUi = adaptDbProperty(updatedDb);
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? updatedUi : p)),
      );
      setSelectedProperty(updatedUi);
      setEditingProperty(null);
      handleFormStateChange(false);
      refreshMetrics().catch(() => undefined);
      logger.info("[ADMIN][PROPERTIES] Update success", { propertyId });
    } catch (e: unknown) {
      const message = toUserErrorMessage(e, "Failed to update property");
      logger.error("[ADMIN][PROPERTIES] Update failed", {
        propertyId,
        message,
      });
      alert(message);
      throw e;
    }
  };

  // Calculate pagination
  const totalItems = (() => {
    if (propertiesSearchQuery.trim().length > 0) return properties.length;
    if (selectedDeveloper) return developerPropertiesCount;
    return totalPropertiesCount;
  })();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties =
    propertiesSearchQuery.trim().length > 0
      ? properties.slice(startIndex, endIndex)
      : properties;

  const filteredDevelopers = useMemo(() => {
    const normalize = (value: string) => value.trim().toLowerCase();
    const tokenize = (value: string) =>
      normalize(value).split(/\s+/).filter(Boolean);
    const includesTokens = (haystack: string, tokens: string[]) => {
      const normalized = normalize(haystack);
      return tokens.every((t) => normalized.includes(t));
    };

    const queryTokens = tokenize(developersSearchQuery);

    const nameFilter = String(developersFilters["Name"] ?? "").trim();
    const emailFilter = String(developersFilters["Email"] ?? "").trim();
    const phoneFilter = String(developersFilters["Phone"] ?? "").trim();
    const statusFilter = String(developersFilters["Status"] ?? "").trim();
    const dateRange = developersFilters["Date Added"];

    const from = Array.isArray(dateRange) ? dateRange[0] : null;
    const to = Array.isArray(dateRange) ? dateRange[1] : null;
    const fromDate =
      typeof from === "string" && from.trim()
        ? new Date(`${from}T00:00:00`)
        : null;
    const toDate =
      typeof to === "string" && to.trim() ? new Date(`${to}T23:59:59`) : null;

    return developers.filter((developer) => {
      if (queryTokens.length > 0) {
        const match =
          includesTokens(developer.name, queryTokens) ||
          includesTokens(developer.email, queryTokens) ||
          includesTokens(developer.phone, queryTokens);
        if (!match) return false;
      }

      if (nameFilter) {
        if (!includesTokens(developer.name, tokenize(nameFilter))) return false;
      }

      if (emailFilter) {
        if (!includesTokens(developer.email, tokenize(emailFilter)))
          return false;
      }

      if (phoneFilter) {
        if (!includesTokens(developer.phone, tokenize(phoneFilter)))
          return false;
      }

      if (statusFilter) {
        if (normalize(developer.status) !== normalize(statusFilter))
          return false;
      }

      if (fromDate || toDate) {
        const added = new Date(developer.dateAdded);
        if (fromDate && added.getTime() < fromDate.getTime()) return false;
        if (toDate && added.getTime() > toDate.getTime()) return false;
      }

      return true;
    });
  }, [developers, developersFilters, developersSearchQuery]);

  return (
    <div className="p-6 bg-[#FCFCFC]">
      <Loader isOpen={isLoadingProperties} text="Loading properties..." />
      {/* Property Details Section - Shows when a property is selected */}
      {!showAddForm && selectedProperty && (
        <AdminPropertyDetails
          property={selectedProperty}
          developers={developers}
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
              onClick={() => {
                setActiveTab("Properties");
                setCurrentPage(1);
              }}
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
              onClick={() => {
                setActiveTab("Developers");
                setCurrentPage(1);
              }}
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
              key={activeTab}
              onSearch={handleSearch}
              onFilterClick={handleFilterClick}
              className="flex-1 sm:flex-initial"
              placeholder={
                activeTab === "Developers" ? "Search developers" : "Search"
              }
            />
          </div>
        </div>
      )}

      {/* Add Property Form */}
      {showAddForm && (
        <AddPropertyForm
          initialProperty={
            editingProperty
              ? {
                  id: editingProperty.id,
                  title: editingProperty.title,
                  price: editingProperty.price,
                  location: editingProperty.location,
                  category: editingProperty.category,
                  description: editingProperty.description,
                  commissionPercent: editingProperty.commissionPercent,
                  landSizeSqm: editingProperty.landSizeSqm,
                  security: editingProperty.security,
                  accessibility: editingProperty.accessibility,
                  topography: editingProperty.topography,
                  developerId: editingProperty.developerId,
                  isSoldOut: editingProperty.isSoldOut,
                  imagePaths: editingProperty.imagePaths,
                  imageUrls: editingProperty.images,
                  contractDocs: editingProperty.contractDocs,
                }
              : undefined
          }
          onClose={() => {
            setEditingProperty(null);
            handleFormStateChange(false);
          }}
          onSave={(payload) =>
            editingProperty
              ? handleUpdateProperty(payload)
              : handleAddProperty(payload)
          }
        />
      )}

      <AddDeveloperPopupModal
        isOpen={!!editingDeveloper}
        onClose={() => setEditingDeveloper(null)}
        title="Edit developer"
        description="Kindly update developer's details below"
        submitLabel="Save changes"
        initialData={
          editingDeveloper
            ? {
                name: editingDeveloper.name,
                email: editingDeveloper.email,
                phone: editingDeveloper.phone,
              }
            : undefined
        }
        onSubmitDeveloper={async (payload) => {
          if (!editingDeveloper) return;
          const existing = editingDeveloper;
          const updated = await developerService.update(existing.id, {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
          });
          setDevelopers((prev) =>
            prev.map((d) =>
              d.id === existing.id
                ? {
                    ...d,
                    ...updated,
                    totalProperties: d.totalProperties,
                    dateAdded: d.dateAdded,
                  }
                : d,
            ),
          );
          setSelectedDeveloper((prev) =>
            prev?.id === existing.id
              ? {
                  ...prev,
                  ...updated,
                  totalProperties: prev.totalProperties,
                  dateAdded: prev.dateAdded,
                }
              : prev,
          );
          setEditingDeveloper(null);
        }}
      />

      {/* Filter Modal */}
      <AdminSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        initialFilters={
          activeTab === "Developers" ? developersFilters : propertiesFilters
        }
        config={
          activeTab === "Developers"
            ? {
                title: "Filter Developers",
                description:
                  "Filter developers by status, date added, or details",
                showPrice: false,
                showPropertyType: false,
                showLocation: false,
                showStatus: true,
                statusOptions: ["Active", "Inactive", "Removed"],
                showDateRange: true,
                dateRangeLabel: "Date Added",
                dateRangeKey: "Date Added",
                textFields: [
                  { label: "Name", placeholder: "Search by name", key: "Name" },
                  {
                    label: "Email",
                    placeholder: "Search by email",
                    key: "Email",
                  },
                  {
                    label: "Phone",
                    placeholder: "Search by phone",
                    key: "Phone",
                  },
                ],
              }
            : {
                title: "Filter Properties",
                description: "Filter properties by price, type, or location",
                showPrice: true,
                showPropertyType: true,
                showLocation: true,
                priceMin: 0,
                priceMax: 10_000_000_000,
                priceStep: 100000,
              }
        }
      />

      {/* Remove Developer Modal */}
      <RemoveDeveloperModal
        isOpen={isRemoveDeveloperModalOpen}
        developerName={developerToRemove?.name ?? ""}
        isRemoving={isRemovingDeveloper}
        error={removeDeveloperError}
        onClose={handleCloseRemoveDeveloperModal}
        onConfirm={handleConfirmRemoveDeveloper}
      />

      {/* Content based on active tab */}
      {!showAddForm && !selectedProperty && (
        <>
          {activeTab === "Properties" ? (
            <>
              {/* Properties Grid */}
              <div className="mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-600">
                    {selectedDeveloper
                      ? "Developer's property"
                      : "All properties"}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingProperty(null);
                      handleFormStateChange(!showAddForm);
                    }}
                    className="bg-[#6500AC] text-white px-3 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-[#4D14C7] transition-colors whitespace-nowrap w-full sm:w-auto"
                  >
                    Add new property
                  </button>
                </div>
                {propertiesError && (
                  <div className="py-10 text-center text-sm text-red-600">
                    {propertiesError}
                  </div>
                )}
                {!isLoadingProperties &&
                  !propertiesError &&
                  selectedDeveloper &&
                  currentProperties.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-500">
                      {propertiesSearchQuery.trim().length > 0
                        ? "No matching properties for this developer."
                        : developerPropertiesMessage ||
                          "This developer has no properties yet."}
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
                developers={filteredDevelopers}
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
