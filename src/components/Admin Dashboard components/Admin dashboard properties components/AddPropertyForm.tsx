import { useState, useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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
      <div className="mb-6 w-full flex flex-col items-center md:items-start">
        <div className="relative w-full max-w-2xl flex justify-between items-center">
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
                        <option value="">Select developer</option>
                        <option value="Developer 1">Developer 1</option>
                        <option value="Developer 2">Developer 2</option>
                        <option value="Developer 3">Developer 3</option>
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
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#F0F1F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent"
                    >
                      <option value="">
                        Select the location of the propeety
                      </option>
                      <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                      <option value="Abuja, Nigeria">Abuja, Nigeria</option>
                      <option value="Port Harcourt, Nigeria">
                        Port Harcourt, Nigeria
                      </option>
                    </select>
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
                      <option value="Title of government">
                        Title of government
                      </option>
                      <option value="Another document">Another document</option>
                      <option value="Governor's consent">
                        Governor's consent
                      </option>
                      <option value="Title of Property">
                        Title of Property
                      </option>
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
                      <option value="very secured">very secured</option>
                      <option value="secured">secured</option>
                      <option value="moderate">moderate</option>
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
                        what is the topography of this property
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Property Title and Price */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {formData.title || "Land for Sale"}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#5E17EB]">
                        ₦
                        {parseFloat(
                          formData.startingPrice || formData.price || "0"
                        ).toLocaleString()}
                      </span>
                      {formData.commission && (
                        <span className="px-3 py-1 bg-[#5E17EB] text-white text-sm font-medium rounded-lg">
                          {formData.commission}% commission
                        </span>
                      )}
                    </div>
                    {formData.developer && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium">{formData.developer}</p>
                      </div>
                    )}
                  </div>

                  {/* About Section */}
                  {formData.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        About this Property
                      </h3>
                      <p className="text-gray-600">{formData.description}</p>
                    </div>
                  )}

                  {/* Documents Section */}
                  {formData.documentOnProperty.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Documents for this Property
                      </h3>
                      <div className="space-y-2">
                        {formData.documentOnProperty.map((doc) => (
                          <div
                            key={doc}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
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
                            <span>{doc}</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Features
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.landSize && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-[#F0E6F7] rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-[#5E17EB]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.251a1 1 0 01.356-.294l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Land size</p>
                              <p className="font-medium text-gray-900">
                                {formData.landSize}sqms
                              </p>
                            </div>
                          </div>
                        )}
                        {formData.security && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-[#F0E6F7] rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-[#5E17EB]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Security</p>
                              <p className="font-medium text-gray-900">
                                {formData.security === "very secured"
                                  ? "Secured"
                                  : formData.security}
                              </p>
                            </div>
                          </div>
                        )}
                        {formData.accessibility && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-[#F0E6F7] rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-[#5E17EB]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Accessible
                              </p>
                              <p className="font-medium text-gray-900">
                                {formData.accessibility}
                              </p>
                            </div>
                          </div>
                        )}
                        {formData.topography && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-[#F0E6F7] rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-[#5E17EB]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.251a1 1 0 01.356-.294l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Topography
                              </p>
                              <p className="font-medium text-gray-900">
                                {formData.topography}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Images and Forms */}
                <div className="space-y-6">
                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div>
                      <div className="relative mb-3">
                        <img
                          src={
                            images.find((img) => img.isThumbnail)?.preview ||
                            images[0].preview
                          }
                          alt="Property"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {formData.commission && (
                          <div className="absolute bottom-2 left-2 px-3 py-1 bg-[#5E17EB] text-white text-sm font-medium rounded-lg">
                            {formData.commission}% commission
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img.preview}
                              alt={`Property ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            {idx === 3 && images.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  View all Images
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    </div>
                  )}

                  {/* Location Map Placeholder */}
                  {formData.location && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        {formData.location}
                      </h3>
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Map View</p>
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
