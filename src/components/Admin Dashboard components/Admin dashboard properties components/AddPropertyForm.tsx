import { useState, useRef, useEffect } from "react";
import IslandIcon from "../../icons/IslandIcon";

import MapViewer from "../../MapViewer"; // <--- ADD THIS

interface AddPropertyFormProps {
  onClose: () => void;
  onSave: (property: {
    image: string;
    title: string;
    price: number;
    location: string;
    isSoldOut: boolean;
    category?: string;
    description?: string;
    developer?: string;
  }) => void;
}

const STEPS = [
  { number: 1, label: "Basic details" },
  { number: 2, label: "Additional info" },
  { number: 3, label: "Preview" },
];

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isThumbnail: boolean;
}

const AddPropertyForm = ({ onClose, onSave }: AddPropertyFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    startingPrice: "",
    commission: "",
    location: "",
    category: "",
    description: "",
    developer: "",
    documentOnProperty: [] as string[],
    landSize: "",
    security: "",
    accessibility: "",
    topography: "",
    isSoldOut: false,
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploadedForms, setUploadedForms] = useState<
    Array<{ name: string; size: string; date: string }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<
    [number, number]
  >([6.5244, 3.3792]); // Default to Lagos, Nigeria
  const [isGeocoding, setIsGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ImageFile = {
            id: Date.now().toString() + Math.random().toString(36),
            file,
            preview: reader.result as string,
            isThumbnail: images.length === 0, // First image is thumbnail by default
          };
          setImages((prev) => {
            const updated = [...prev, newImage];
            // Ensure only one thumbnail
            if (updated.length === 1) {
              updated[0].isThumbnail = true;
            }
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // If we removed the thumbnail and there are other images, make the first one thumbnail
      const removedWasThumbnail = prev.find(
        (img) => img.id === id
      )?.isThumbnail;
      if (removedWasThumbnail && updated.length > 0) {
        updated[0].isThumbnail = true;
      }
      return updated;
    });
  };

  const handleSetThumbnail = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isThumbnail: img.id === id,
      }))
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentAdd = (document: string) => {
    if (document.trim() && !formData.documentOnProperty.includes(document)) {
      setFormData((prev) => ({
        ...prev,
        documentOnProperty: [...prev.documentOnProperty, document],
      }));
    }
  };

  const handleDocumentRemove = (document: string) => {
    setFormData((prev) => ({
      ...prev,
      documentOnProperty: prev.documentOnProperty.filter((d) => d !== document),
    }));
  };

  const handleFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newForm = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(0)}MB`,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setUploadedForms((prev) => [...prev, newForm]);
    }
  };

  const handleRemoveForm = (index: number) => {
    setUploadedForms((prev) => prev.filter((_, i) => i !== index));
  };

  // Geocoding function to convert location name to coordinates
  const geocodeLocation = async (
    locationName: string
  ): Promise<[number, number] | null> => {
    if (!locationName || locationName.trim() === "") {
      return null;
    }

    try {
      setIsGeocoding(true);
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "RealtorAdminApp/1.0", // Required by Nominatim
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

  // Geocode location when it changes (with debouncing)
  useEffect(() => {
    // Clear previous timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // Only geocode if location is not empty
    if (!formData.location || formData.location.trim() === "") {
      return;
    }

    // Debounce geocoding to avoid too many API calls
    geocodeTimeoutRef.current = setTimeout(async () => {
      const coordinates = await geocodeLocation(formData.location);
      if (coordinates) {
        setLocationCoordinates(coordinates);
      }
    }, 1000); // Wait 1 second after user stops typing

    // Cleanup function
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [formData.location]);

  const handleSave = () => {
    const thumbnailImage = images.find((img) => img.isThumbnail);
    const newProperty = {
      image:
        thumbnailImage?.preview ||
        images[0]?.preview ||
        "/placeholder-property.jpg",
      title: formData.title,
      price: parseFloat(formData.startingPrice || formData.price) || 0,
      location: formData.location,
      isSoldOut: formData.isSoldOut,
      category: formData.category,
      description: formData.description,
      developer: formData.developer,
    };
    onSave(newProperty);
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title.trim() !== "" &&
          formData.category !== "" &&
          formData.developer !== "" &&
          images.length > 0
        );
      case 2:
        return true; // Additional info step validation
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <>
      {/* Step Progress Bar - Based on Inspiration */}
      <div className="mb-6 w-full flex flex-col items-center md:items-center">
        <div className="relative w-full max-w-full flex justify-between items-center">
          {/* Progress line (background) */}
          <div className="absolute top-1/2 left-3 right-3 h-[2px] bg-gray-200 -translate-y-1/2 z-0">
            {/* Filled progress */}
            <div
              className="h-[2px] bg-[#6500AC] transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep - 1;
            const isActive = idx === currentStep - 1;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center z-10 bg-white"
              >
                {/* Circle */}
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-medium transition-all ${
                    isCompleted || isActive
                      ? "bg-[#6500AC]"
                      : "bg-white border border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : step.number}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] leading-[15px] font-medium text-center mt-1 ${
                    isActive || isCompleted ? "text-[#6500AC]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-6 mb-6">
        {/* Step Progress Tracker - Dark Header Style */}

        {/* Form Content */}
        <div className="mb-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Property Image Section */}
              <div>
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Image
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add property image and videos here, Atleast 1 image must be
                    added
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* File Upload Area */}
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-[#5E17EB] bg-[#F0E6F7]"
                        : "border-[#E5E7EB] bg-gray-50"
                    }`}
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Drag and drop your file here. - or -
                      </p>
                      <div className="flex justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#5E17EB] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors"
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500">
                        file type PNG, JPG, JPEG, MP4 or MKV format
                      </p>
                    </div>
                  </div>

                  {/* Image/Video Placeholders Grid */}
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, index) => {
                        const image = images[index];
                        return (
                          <div
                            key={index}
                            className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100"
                          >
                            {image ? (
                              <>
                                {image.file.type.startsWith("image/") ? (
                                  <img
                                    src={image.preview}
                                    alt={`Property ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <svg
                                      className="w-8 h-8 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleRemoveImage(image.id)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                                <div className="absolute top-1 left-1">
                                  <button
                                    onClick={() => handleSetThumbnail(image.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      image.isThumbnail
                                        ? "bg-[#5E17EB] border-[#5E17EB]"
                                        : "bg-white border-gray-300"
                                    }`}
                                    title="Mark as thumbnail"
                                  >
                                    {image.isThumbnail && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the information of this property here
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Category and Developer - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="Land">Land</option>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Mixed-Use">Mixed-Use</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Developer
                      </label>
                      <select
                        name="developer"
                        value={formData.developer}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                      >
                        <option value="Select developer">
                          Select developer
                        </option>
                        <option value="Add developer">
                          + Add new developer
                        </option>
                        <option value="Musa Aliyu">Musa Aliyu</option>
                        <option value="Chijioke Orji">Chijioke Orji</option>
                        <option value="Monye idamiebi">Monye idamiebi</option>
                        <option value="Gionbo Ekisagha">Gionbo Ekisagha</option>
                      </select>
                    </div>
                  </div>

                  {/* Property Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property name
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="What is the name of this property"
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add more description about this property"
                      rows={4}
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Additional information section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Additional information
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Other informations come here
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Starting price (N)
                      </label>
                      <input
                        type="text"
                        name="startingPrice"
                        value={formData.startingPrice}
                        onChange={handleInputChange}
                        placeholder="What is the starting price for this property"
                        className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission (%)
                      </label>
                      <input
                        type="text"
                        name="commission"
                        value={formData.commission}
                        onChange={handleInputChange}
                        placeholder="Percentage of commison"
                        className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter the full location of the property"
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document on property
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.documentOnProperty.map((doc) => (
                        <span
                          key={doc}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          {doc}
                          <button
                            type="button"
                            onClick={() => handleDocumentRemove(doc)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleDocumentAdd(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    >
                      <option value="">
                        What are the document available for this property
                      </option>
                      <option value="Certificate of Occupancy">
                        Certificate of Occupancy
                      </option>
                      <option value="Right of Occupancy">
                        Right of Occupancy
                      </option>
                      <option value="Governor's consent">
                        Governor's consent
                      </option>
                      <option value="Excision">Excision</option>
                      <option value="Gezette">Gezette</option>
                      <option value="letter of allocation">
                        letter of allocation
                      </option>
                      <option value="deed of assignment">
                        deed of assignment
                      </option>
                      <option value="deed of sublease">deed of sublease</option>
                      <option value="deed of gift">deed of gift</option>
                      <option value="power of attorney">
                        power of attorney
                      </option>
                      <option value="survey plan">survey plan</option>
                      <option value="purchase receipt">purchase receipt</option>
                      <option value="building plan approval">
                        building plan approval
                      </option>
                      <option value="tax clearance">tax clearance</option>
                      <option value="family land receipts">
                        family land receipts
                      </option>
                      <option value="community head letter">
                        community head letter
                      </option>
                      <option value="court judgement">court judgement</option>
                      <option value="vesting order">vesting order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload your forms
                    </label>
                    <div className="border-2 border-dashed border-[#F0F1F2] rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        PDF, JPG format • Max. 5MB
                      </p>
                      <button
                        type="button"
                        onClick={() => formFileInputRef.current?.click()}
                        className="bg-[#5E17EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors"
                      >
                        Upload
                      </button>
                      <input
                        ref={formFileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={handleFormFileUpload}
                        className="hidden"
                      />
                    </div>
                    {uploadedForms.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedForms.map((form, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                className="w-5 h-5 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {form.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {form.date} • {form.size}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveForm(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Features
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  This are the features of the property
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Land size (sqm)
                    </label>
                    <input
                      type="text"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security
                    </label>
                    <select
                      name="security"
                      value={formData.security}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    >
                      <option value="">Select security status</option>
                      <option value="very secured">Very secured</option>
                      <option value="secured">Secured</option>
                      <option value="moderate">Moderate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accessibility
                    </label>
                    <select
                      name="accessibility"
                      value={formData.accessibility}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    >
                      <option value="">is this road easily accessible</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topography
                    </label>
                    <select
                      name="topography"
                      value={formData.topography}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    >
                      <option value="">
                        What is the topography of this property
                      </option>
                      <option value="Wetland">Wetland</option>
                      <option value="Dryland">Dryland</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative">
                        <img
                          src={
                            images.find((img) => img.isThumbnail)?.preview ||
                            images[0].preview
                          }
                          alt="Property"
                          className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
                        />
                        {formData.commission && (
                          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-md">
                            {formData.commission}% commission
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Images */}
                      <div className="grid grid-cols-4 gap-2">
                        {images.slice(0, 4).map((img, index) => (
                          <div
                            key={index}
                            className={`relative aspect-square rounded-lg overflow-hidden ${
                              index === 0 ? "ring-2 ring-[#5E17EB]" : ""
                            }`}
                          >
                            <img
                              src={img.preview}
                              alt={`Property view ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 3 && images.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  View all Images
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Title and Price */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {formData.title || "Land for Sale"}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-[#6D00C2]">
                          ₦
                          {parseFloat(
                            formData.startingPrice || formData.price || "0"
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {formData.developer && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Developer:
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.developer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* About Section */}
                  {formData.description && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        About this Property
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  {/* Documents Section */}
                  {formData.documentOnProperty.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Documents for this Property
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        {formData.documentOnProperty.map((doc) => (
                          <div key={doc} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-700">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features Grid */}
                  {(formData.landSize ||
                    formData.security ||
                    formData.accessibility ||
                    formData.topography) && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Features
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {formData.landSize && (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                <IslandIcon color={"#808080"} />
                              </span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {formData.landSize}sqms
                                </p>
                                <p className="text-sm text-gray-600">
                                  Land size
                                </p>
                              </div>
                            </div>
                          )}
                          {formData.security && (
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
                                  {formData.security === "very secured"
                                    ? "Secured"
                                    : formData.security}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Security
                                </p>
                              </div>
                            </div>
                          )}
                          {formData.accessibility && (
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
                                      d="M10.4954 1.5H6.92349C5.54536 1.5 4.34067 2.44219 4.01255 3.77812L0.0656742 19.7109C-0.285888 21.1266 0.787549 22.5 2.25005 22.5H10.4954V19.5C10.4954 18.6703 11.1657 18 11.9954 18C12.825 18 13.4954 18.6703 13.4954 19.5V22.5H21.75C23.2125 22.5 24.286 21.1266 23.9344 19.7109L19.9922 3.77812C19.6594 2.44219 18.4594 1.5 17.0766 1.5H13.4954V4.5C13.4954 5.32969 12.825 6 11.9954 6C11.1657 6 10.4954 5.32969 10.4954 4.5V1.5Z"
                                      fill="#9CA1AA"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_19497_27245">
                                      <rect
                                        width="24"
                                        height="24"
                                        fill="white"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {formData.accessibility}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Accessible
                                </p>
                              </div>
                            </div>
                          )}
                          {formData.topography && (
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
                                  {formData.topography}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Topography
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Forms and Location */}
                <div className="space-y-6">
                  {/* Uploaded Forms */}
                  {uploadedForms.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Uploaded forms
                      </h3>
                      <div className="space-y-2">
                        {uploadedForms.map((form, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg overflow-auto no-scrollbar"
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
                            <button
                              type="button"
                              onClick={() => handleRemoveForm(index)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Map Placeholder */}
                  {formData.location && (
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
                          {formData.location}
                        </h3>
                      </div>
                      <div className="w-full h-64 relative">
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
                          locationName={formData.location}
                          defaultCenter={locationCoordinates}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentStep === 3 ? (
          <div className="pt-6">
            <button
              onClick={handleSave}
              disabled={!isStepValid()}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isStepValid()
                  ? "bg-[#5E17EB] text-white hover:bg-[#4D14C7]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Publish property
            </button>
          </div>
        ) : (
          <div className="flex justify-between gap-4 pt-4 border-t border-[#F0F1F2]">
            <button
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="px-6 py-2 border border-[#D5D7DA] rounded-lg font-medium text-[#414651] hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "Previous"}
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isStepValid()
                  ? "bg-[#5E17EB] text-white hover:bg-[#4D14C7]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {currentStep === 2 ? "Save and preview" : "Next"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AddPropertyForm;
