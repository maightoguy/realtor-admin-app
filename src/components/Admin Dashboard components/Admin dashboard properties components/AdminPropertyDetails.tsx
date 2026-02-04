import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Check } from "lucide-react";
import MapViewer from "../../MapViewer";
import ImageViewerModal from "./ImageViewerModal";
import IslandIcon from "../../icons/IslandIcon";
import {
  propertyImages,
  type SalesStatistics,
} from "./adminDashboardPropertiesData";
import ReceiptsIcon from "../../icons/ReceiptsIcon";
import { logger } from "../../../utils/logger";
import {
  propertyMediaService,
  receiptService,
} from "../../../services/apiService";
import type { Developer } from "../../../services/types";

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
  contractDocs?: string[];
}

interface AdminPropertyDetailsProps {
  property: Property;
  developers?: Developer[];
  onBack: () => void;
  onEdit?: (propertyId: string) => void;
  onMarkSoldOut?: (propertyId: string) => void;
}

const AdminPropertyDetails = ({
  property,
  developers,
  onBack,
  onEdit,
  onMarkSoldOut,
}: AdminPropertyDetailsProps) => {
  const [activeTab, setActiveTab] = useState<"Property Info" | "Statistics">(
    "Property Info"
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [locationCoordinates, setLocationCoordinates] = useState<
    [number, number]
  >([6.5244, 3.3792]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [receiptStats, setReceiptStats] = useState<{
    totalUploaded: number;
    totalApproved: number;
    totalRejected: number;
  }>({ totalUploaded: 0, totalApproved: 0, totalRejected: 0 });
  const [salesChartData, setSalesChartData] = useState<number[]>(
    Array.from({ length: 12 }, () => 0)
  );
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const idSeed = Array.from(property.id).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );

  const propertyImagesList =
    property.images && property.images.length > 0
      ? property.images
      : (() => {
          const seed = idSeed;
          const shuffled = [...propertyImages];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = (seed + i) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const numImages = 4 + (seed % 3);
          return [property.image, ...shuffled.slice(0, numImages - 1)];
        })();

  // Geocoding function to convert location name to coordinates
  const geocodeLocation = async (
    locationName: string
  ): Promise<[number, number] | null> => {
    if (!locationName || locationName.trim() === "") {
      return null;
    }

    try {
      setIsGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "RealtorAdminApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }

      return null;
    } catch (error) {
      logger.error("[ADMIN][PROPERTY DETAILS] Geocoding failed", {
        locationName,
        error,
      });
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  // Geocode location on mount
  useEffect(() => {
    if (property.location) {
      geocodeLocation(property.location).then((coordinates) => {
        if (coordinates) {
          setLocationCoordinates(coordinates);
        }
      });
    }
  }, [property.location]);

  const getFallbackSalesChartData = useCallback((): number[] => {
    const developer =
      (property.developerId
        ? developers?.find((d) => d.id === property.developerId)
        : undefined) ??
      (property.developer
        ? developers?.find((d) => d.name === property.developer)
        : undefined);

    const salesStats: SalesStatistics = (
      developer as unknown as { salesStatistics?: SalesStatistics }
    )?.salesStatistics || {
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
    };

    return [
      salesStats.jan,
      salesStats.feb,
      salesStats.mar,
      salesStats.apr,
      salesStats.may,
      salesStats.jun,
      salesStats.jul,
      salesStats.aug,
      salesStats.sep,
      salesStats.oct,
      salesStats.nov,
      salesStats.dec,
    ];
  }, [developers, property.developer, property.developerId]);

  useEffect(() => {
    if (activeTab !== "Statistics") return;

    let cancelled = false;

    const load = async () => {
      setIsStatsLoading(true);
      setStatsError(null);

      try {
        const receipts = await receiptService.getAll({
          propertyId: property.id,
          limit: 5000,
        });

        if (cancelled) return;

        const totalUploaded = receipts.length;
        const totalApproved = receipts.filter(
          (receipt) => receipt.status === "approved"
        ).length;
        const totalRejected = receipts.filter(
          (receipt) => receipt.status === "rejected"
        ).length;

        setReceiptStats({
          totalUploaded,
          totalApproved,
          totalRejected,
        });

        const currentYear = new Date().getFullYear();
        const monthlyTotals = Array.from({ length: 12 }, () => 0);

        for (const receipt of receipts) {
          if (receipt.status !== "approved") continue;
          if (!receipt.created_at) continue;
          const createdAt = new Date(receipt.created_at);
          if (Number.isNaN(createdAt.getTime())) continue;
          if (createdAt.getFullYear() !== currentYear) continue;
          const monthIndex = createdAt.getMonth();
          const amount = Number(receipt.amount_paid);
          if (!Number.isFinite(amount)) continue;
          monthlyTotals[monthIndex] += amount;
        }

        const hasAnySales = monthlyTotals.some((value) => value > 0);
        setSalesChartData(
          hasAnySales ? monthlyTotals : getFallbackSalesChartData()
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load statistics";
        logger.error("[ADMIN][PROPERTY DETAILS] Failed to load statistics", {
          propertyId: property.id,
          error: message,
        });
        if (!cancelled) {
          setReceiptStats({
            totalUploaded: 0,
            totalApproved: 0,
            totalRejected: 0,
          });
          setSalesChartData(getFallbackSalesChartData());
          setStatsError(message);
        }
      } finally {
        if (!cancelled) {
          setIsStatsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab, developers, getFallbackSalesChartData, property.id]);

  const handleImageClick = (index: number) => {
    setViewerImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  //--------
  const parseCommission = (text: string): string | null => {
    const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (!match) return null;
    return `${match[1]}%`;
  };

  const { documentTypeItems, uploadedFileItems } = (() => {
    const input = Array.isArray(property.contractDocs)
      ? property.contractDocs
      : [];
    const typeUnique = new Map<string, { name: string }>();
    const fileUnique = new Map<string, { name: string; url: string }>();

    const getLabel = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return "";
      if (/^https?:\/\//i.test(trimmed)) {
        try {
          const url = new URL(trimmed);
          const last = url.pathname.split("/").filter(Boolean).pop();
          return last ? decodeURIComponent(last) : trimmed;
        } catch {
          return trimmed;
        }
      }
      if (trimmed.includes("/")) {
        const last = trimmed.split("/").filter(Boolean).pop();
        return last || trimmed;
      }
      return trimmed;
    };

    const isLikelyFilePath = (value: string) =>
      value.includes("/") || /\.[a-z0-9]{2,6}$/i.test(value);

    for (const raw of input) {
      if (typeof raw !== "string") continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const isUrl = /^https?:\/\//i.test(trimmed);
      const isFilePath = isLikelyFilePath(trimmed);

      if (isUrl || isFilePath) {
        const name = getLabel(trimmed);
        if (!name) continue;
        const url = isUrl
          ? trimmed
          : propertyMediaService.getPublicUrl(trimmed);
        fileUnique.set(url, { name, url });
        continue;
      }

      const name = getLabel(trimmed);
      if (!name) continue;
      typeUnique.set(name.toLowerCase(), { name });
    }

    return {
      documentTypeItems: Array.from(typeUnique.values()),
      uploadedFileItems: Array.from(fileUnique.values()),
    };
  })();

  const propertyDetails = {
    description:
      property.description || "No description available for this property",
    documents: documentTypeItems,
    features: {
      landSize:
        typeof property.landSizeSqm === "number" &&
        Number.isFinite(property.landSizeSqm)
          ? `${property.landSizeSqm}sqms`
          : "—",
      security: property.security || "—",
      accessibility: property.accessibility || "—",
      topography: property.topography || "—",
    },
    commission:
      typeof property.commissionPercent === "number" &&
      Number.isFinite(property.commissionPercent)
        ? `${property.commissionPercent}%`
        : parseCommission(property.description ?? ""),
    uploadedForms: uploadedFileItems.map((doc) => ({
      name: doc.name,
      url: doc.url,
      date: "",
      size: "",
    })),
  };

  const formattedPrice =
    typeof property.price === "number"
      ? `₦${property.price.toLocaleString()}`
      : property.price;

  return (
    <div className="p-4 sm:p-6 bg-[#FCFCFC] w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Properties</span>
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-medium text-gray-900">
          Property details
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("Property Info")}
          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
            activeTab === "Property Info"
              ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
              : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
          }`}
        >
          Property Info
        </button>
        <button
          onClick={() => setActiveTab("Statistics")}
          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
            activeTab === "Statistics"
              ? "bg-[#F0E6F7] border-[#CFB0E5] text-[#6500AC]"
              : "bg-white border-[#F0F1F2] text-gray-600 hover:border-[#CFB0E5]"
          }`}
        >
          Statistics
        </button>
      </div>

      {activeTab === "Property Info" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                <button
                  onClick={() => handleImageClick(currentImageIndex)}
                  className="w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <img
                    src={propertyImagesList[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </button>
                {propertyDetails.commission && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-md">
                    {propertyDetails.commission} commission
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {propertyImagesList.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      handleImageClick(index);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
                      index === currentImageIndex ? "ring-2 ring-[#6500AC]" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Property view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && propertyImagesList.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          View all Images
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Title and Price */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <div className="text-left sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-[#6D00C2]">
                    {formattedPrice}
                  </p>
                </div>
              </div>

              {/* Developer Info */}
              {(() => {
                const developer =
                  (property.developerId
                    ? developers?.find((d) => d.id === property.developerId)
                    : undefined) ??
                  (property.developer
                    ? developers?.find((d) => d.name === property.developer)
                    : undefined);
                const name = developer?.name ?? property.developer;
                if (!name) return null;
                return (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Developer:
                    </p>
                    <p className="text-sm text-gray-600">{name}</p>
                    {developer?.email && (
                      <p className="text-sm text-gray-600">{developer.email}</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                About this Property
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                {propertyDetails.description}
              </p>
            </div>

            {/* Documents Section */}
            {propertyDetails.documents.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Documents for this Property
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  {propertyDetails.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Grid */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Features
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      <IslandIcon color="#808080" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {propertyDetails.features.landSize}
                      </p>
                      <p className="text-sm text-gray-600">Land size</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 12.5C7 9.7385 9.2385 7.5 12 7.5C14.7615 7.5 17 9.7385 17 12.5V20.5H7V12.5Z"
                          fill="#9CA1AA"
                          stroke="#9CA1AA"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.0001 2.5V4M17.9461 4.664L16.9816 5.813M21.1096 10.1435L19.6321 10.404M2.89062 10.1435L4.36812 10.404M6.05463 4.664L7.01862 5.813M3.00012 20.5H21.5001"
                          stroke="#9CA1AA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {propertyDetails.features.security}
                      </p>
                      <p className="text-sm text-gray-600">Security</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_19497_27245)">
                          <path
                            d="M10.4954 1.5H6.92349C5.54536 1.5 4.34067 2.44219 4.01255 3.77812L0.0656742 19.7109C-0.285888 21.1266 0.787549 22.5 2.25005 22.5H10.4954V19.5C10.4954 18.6703 11.1657 18 11.9954 18C12.825 18 13.4954 18.6703 13.4954 19.5V22.5H21.75C23.2125 22.5 24.286 21.1266 23.9344 19.7109L19.9922 3.77812C19.6594 2.44219 18.4594 1.5 17.0766 1.5H13.4954V4.5C13.4954 5.32969 12.825 6 11.9954 6C11.1657 6 10.4954 5.32969 10.4954 4.5V1.5ZM13.4954 10.5V13.5C13.4954 14.3297 12.825 15 11.9954 15C11.1657 15 10.4954 14.3297 10.4954 13.5V10.5C10.4954 9.67031 11.1657 9 11.9954 9C12.825 9 13.4954 9.67031 13.4954 10.5Z"
                            fill="#9CA1AA"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_19497_27245">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {propertyDetails.features.accessibility}
                      </p>
                      <p className="text-sm text-gray-600">Accessible</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.87312 15.708L6.45012 12.248C6.53079 12.1407 6.62845 12.06 6.74312 12.006C6.85779 11.952 6.97545 11.925 7.09612 11.925C7.21679 11.925 7.33478 11.9517 7.45012 12.005C7.56412 12.0597 7.66145 12.1407 7.74212 12.248L10.2581 15.6C10.3595 15.7334 10.4775 15.8334 10.6121 15.9C10.7468 15.9667 10.8985 16 11.0671 16C11.4891 16 11.7921 15.8127 11.9761 15.438C12.1601 15.0634 12.1271 14.709 11.8771 14.375L10.8341 12.985C10.7268 12.8357 10.6731 12.673 10.6731 12.497C10.6731 12.321 10.7271 12.1604 10.8351 12.015L13.4501 8.51702C13.5308 8.40969 13.6285 8.32902 13.7431 8.27502C13.8578 8.22102 13.9755 8.19435 14.0961 8.19502C14.2168 8.19569 14.3348 8.22235 14.4501 8.27502C14.5655 8.32769 14.6628 8.40835 14.7421 8.51702L20.1271 15.707C20.3258 15.977 20.3515 16.26 20.2041 16.556C20.0568 16.852 19.8158 17 19.4811 17H4.52912C4.18245 17 3.93679 16.852 3.79212 16.556C3.64745 16.26 3.67445 15.9774 3.87312 15.708Z"
                          fill="#9CA1AA"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {propertyDetails.features.topography}
                      </p>
                      <p className="text-sm text-gray-600">Topography</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms and Location */}
          <div className="space-y-6">
            {/* Uploaded Forms */}
            {propertyDetails.uploadedForms.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Uploaded forms
                </h3>
                <div className="space-y-2">
                  {propertyDetails.uploadedForms.map((form, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg overflow-auto"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-green-500 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="min-w-0 flex-1">
                          {form.url ? (
                            <a
                              href={form.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-gray-900 truncate hover:underline block"
                            >
                              {form.name}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {form.name}
                            </p>
                          )}
                          {(() => {
                            const meta = [form.date, form.size]
                              .filter(Boolean)
                              .join(" • ");
                            if (!meta) return null;
                            return (
                              <p className="text-xs text-gray-500">{meta}</p>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {property.location && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property.location}
                  </h3>
                </div>
                <div className="w-full h-64 relative rounded-lg overflow-hidden">
                  {isGeocoding && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6500AC] mb-2"></div>
                        <p className="text-sm text-gray-600">
                          Finding location...
                        </p>
                      </div>
                    </div>
                  )}
                  <MapViewer
                    locationName={property.location}
                    defaultCenter={locationCoordinates}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => onEdit?.(property.id)}
                className="w-full bg-[#6500AC] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#4A14C7] transition-colors"
              >
                Edit property details
              </button>
              <button
                onClick={() => onMarkSoldOut?.(property.id)}
                className={`w-full bg-white border-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  property.isSoldOut
                    ? "border-[#22C55E] text-[#22C55E] hover:bg-green-50"
                    : "border-red-500 text-red-500 hover:bg-red-50"
                }`}
              >
                {property.isSoldOut ? "Mark as available" : "Mark as sold-out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Statistics" &&
        (() => {
          // MetricCard component (matching AdminDashboardProperties pattern)
          interface MetricCardProps {
            title: string;
            value: string | number;
            icon: React.ReactNode;
            iconBgColor: string;
            iconStrokeColor: string;
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
                  <rect
                    x="3"
                    y="3"
                    width="30"
                    height="30"
                    rx="15"
                    fill={iconBgColor}
                  />
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

          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const chartData = salesChartData;

          const maxValue = Math.max(...chartData);

          // Calculate Y-axis labels based on max value
          const getYAxisLabels = () => {
            if (maxValue === 0) return ["₦0", "₦0", "₦0", "₦0"];

            // Round max value to nearest million or appropriate scale
            let scale = 1000000; // Start with millions
            let roundedMax = Math.ceil(maxValue / scale) * scale;

            // If max is less than 1M, use thousands
            if (maxValue < 1000000) {
              scale = 1000;
              roundedMax = Math.ceil(maxValue / scale) * scale;
              return [
                `₦${(roundedMax / 1000).toFixed(0)}K`,
                `₦${((roundedMax * 0.75) / 1000).toFixed(0)}K`,
                `₦${((roundedMax * 0.5) / 1000).toFixed(0)}K`,
                `₦${((roundedMax * 0.25) / 1000).toFixed(0)}K`,
                "₦0",
              ];
            }

            // Use millions
            const maxM = roundedMax / 1000000;
            return [
              `₦${maxM.toFixed(0)}M`,
              `₦${(maxM * 0.75).toFixed(0)}M`,
              `₦${(maxM * 0.5).toFixed(0)}M`,
              `₦${(maxM * 0.25).toFixed(0)}M`,
              "₦0",
            ];
          };

          const yAxisLabels = getYAxisLabels();
          // Calculate chart max value based on the scale used
          const chartMaxValue =
            maxValue === 0
              ? 1
              : maxValue < 1000000
              ? Math.ceil(maxValue / 1000) * 1000
              : Math.ceil(maxValue / 1000000) * 1000000;

          // Get current month index (0-based, where 0 = Jan)
          const currentDate = new Date();
          const currentMonthIndex = currentDate.getMonth();

          return (
            <div className="space-y-6">
              {statsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {statsError}
                </div>
              )}
              {/* Receipt Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Receipt Uploaded */}
                <MetricCard
                  title="Total Receipt uploaded"
                  value={isStatsLoading ? "—" : receiptStats.totalUploaded}
                  icon={<ReceiptsIcon color="#6500AC" />}
                  iconBgColor="#F0E6F7"
                  iconStrokeColor="#F0E6F7"
                  valueTextColor="#101828"
                />

                {/* Total Receipt Approved */}
                <MetricCard
                  title="Total Receipt Approved"
                  value={isStatsLoading ? "—" : receiptStats.totalApproved}
                  icon={<ReceiptsIcon color="#22C55E" />}
                  iconBgColor="#D1FAE5"
                  iconStrokeColor="#D1FAE5"
                  valueTextColor="#101828"
                />

                {/* Total Receipt Rejected */}
                <MetricCard
                  title="Total Receipt Rejected"
                  value={isStatsLoading ? "—" : receiptStats.totalRejected}
                  icon={<ReceiptsIcon color="#EF4444" />}
                  iconBgColor="#FEE2E2"
                  iconStrokeColor="#FEE2E2"
                  valueTextColor="#101828"
                />
              </div>

              {/* Sales Statistics Chart */}
              <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Sales Statistics
                </h3>

                {/* Chart */}
                <div
                  className="overflow-x-auto overflow-y-hidden scrollbar-hide"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="min-w-[560px] sm:min-w-0 relative h-64">
                    <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[10px] sm:text-xs text-gray-500 pr-3 w-12">
                      {yAxisLabels.map((label, index) => (
                        <span key={`y-label-${index}`}>{label}</span>
                      ))}
                    </div>

                    <div className="ml-12 pr-4 relative h-full">
                      <div className="absolute inset-0 flex flex-col justify-between pb-12">
                        <div className="w-full h-px bg-gray-200"></div>
                        <div className="w-full h-px bg-gray-200"></div>
                        <div className="w-full h-px bg-gray-200"></div>
                        <div className="w-full h-px bg-gray-200"></div>
                      </div>

                      <div className="relative">
                        <div className="relative h-48 flex items-end justify-between gap-1.5 mb-2">
                          {chartData.map((value, index) => {
                            const height = (value / chartMaxValue) * 100;
                            const isCurrentMonth = index === currentMonthIndex;
                            return (
                              <div
                                key={`bar-${index}`}
                                className="flex-1 flex flex-col items-center h-full justify-end relative"
                              >
                                {isCurrentMonth && (
                                  <div className="absolute -inset-x-1 -top-2 -bottom-8 bg-gray-100 rounded-lg"></div>
                                )}
                                <div
                                  className={`w-full rounded-t transition-all relative z-10 ${
                                    isCurrentMonth
                                      ? "bg-green-500"
                                      : "bg-[#6500AC]"
                                  }`}
                                  style={{
                                    height: `${height}%`,
                                    minHeight: height > 0 ? "4px" : "0",
                                  }}
                                />
                                <div
                                  className="absolute w-px bg-gray-200 z-0"
                                  style={{
                                    bottom: "-20px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    height: "20px",
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between gap-1.5 mt-2">
                          {months.map((month, index) => {
                            const isCurrentMonth = index === currentMonthIndex;
                            return (
                              <div
                                key={`label-${index}`}
                                className="flex-1 flex justify-center relative"
                              >
                                {isCurrentMonth && (
                                  <div className="absolute -top-8 bottom-0 -left-1 -right-1 bg-gray-100 rounded-b-lg"></div>
                                )}
                                <span
                                  className={`text-[10px] sm:text-xs whitespace-nowrap relative z-10 ${
                                    isCurrentMonth
                                      ? "text-gray-900 font-medium"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {month}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={handleCloseImageViewer}
        images={propertyImagesList}
        initialIndex={viewerImageIndex}
      />
    </div>
  );
};

export default AdminPropertyDetails;
