import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import MapViewer from "../../MapViewer";
import ImageViewerModal from "./ImageViewerModal";
import IslandIcon from "../../icons/IslandIcon";
import { propertyImages, sampleDevelopers } from "./adminDashboardPropertiesData";

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

interface AdminPropertyDetailsProps {
  property: Property;
  onBack: () => void;
  onEdit?: (propertyId: number) => void;
  onMarkSoldOut?: (propertyId: number) => void;
}

const AdminPropertyDetails = ({
  property,
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
  const [locationCoordinates, setLocationCoordinates] = useState<[number, number]>(
    [6.5244, 3.3792]
  );
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Generate random images for this property (using propertyImages array)
  const propertyImagesList = (() => {
    // Use the property's ID as a seed to get consistent random images per property
    const seed = property.id;
    const shuffled = [...propertyImages];
    // Simple shuffle based on property ID
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Return 4-6 random images, always including the property's main image first
    const numImages = 4 + (seed % 3); // 4, 5, or 6 images
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
      console.error("Error geocoding location:", error);
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

  const handleImageClick = (index: number) => {
    setViewerImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  // Mock property details (in a real app, this would come from the property data)
  const propertyDetails = {
    description:
      property.description ||
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    documents: ["Title of Property", "Governor's consent"],
    features: {
      landSize: "1000sqms",
      security: "Secured",
      accessibility: "Yes",
      topography: "Wetland",
    },
    commission: "10%",
    uploadedForms: [
      { name: "Name of document.pdf", date: "11 Sep, 2023 12:24pm", size: "13MB" },
      { name: "Name of document.pdf", date: "11 Sep, 2023 12:24pm", size: "13MB" },
    ],
  };

  const formattedPrice =
    typeof property.price === "number"
      ? `₦${property.price.toLocaleString()}`
      : property.price;

  return (
    <div className="p-6 bg-[#FCFCFC]">
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
                      index === currentImageIndex ? "ring-2 ring-[#5E17EB]" : ""
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
              {property.developer && (() => {
                const developer = sampleDevelopers.find(
                  (d) => d.name === property.developer
                );
                return (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Developer:
                    </p>
                    <p className="text-sm text-gray-600">{property.developer}</p>
                    {developer && (
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
              <p className="text-gray-600 leading-relaxed">
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
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{doc}</span>
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
                          className="w-5 h-5 text-green-500 flex-shrink-0"
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
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {form.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {form.date} • {form.size}
                          </p>
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
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E17EB] mb-2"></div>
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
                className="w-full bg-[#5E17EB] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#4A14C7] transition-colors"
              >
                Edit property details
              </button>
              <button
                onClick={() => onMarkSoldOut?.(property.id)}
                className="w-full bg-white border-2 border-red-500 text-red-500 py-3 px-4 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Mark as sold-out
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Statistics" && (
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Statistics
          </h3>
          <p className="text-gray-600">
            Statistics for this property will be displayed here.
          </p>
        </div>
      )}

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

