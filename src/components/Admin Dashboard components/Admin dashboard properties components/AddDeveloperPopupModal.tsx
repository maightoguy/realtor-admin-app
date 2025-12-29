import { X } from "lucide-react";
import { useEffect, useState } from "react";
import RealtorsIcon from "../../icons/RealtorsIcon";

interface AddDeveloperPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  initialData?: {
    name: string;
    email: string;
    phone: string;
  };
  onSubmitDeveloper: (developerData: {
    name: string;
    email: string;
    phone: string;
  }) => void;
}

const AddDeveloperPopupModal = ({
  isOpen,
  onClose,
  title,
  description,
  submitLabel,
  initialData,
  onSubmitDeveloper,
}: AddDeveloperPopupModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "" });
    setErrors({ name: "", email: "", phone: "" });
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
    });
    setErrors({ name: "", email: "", phone: "" });
  }, [initialData?.email, initialData?.name, initialData?.phone, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Developer's name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmitDeveloper(formData);
      handleClose();
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}

          <div className="flex flex-col items-start justify-between">
            <button
              onClick={handleClose}
              className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center justify-between p-6 border-b border-[#F0F1F2]">
              <div className="flex flex-col items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <RealtorsIcon color="#000000" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {title ?? "Add developer"}
                </h2>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              {description ?? "Kindly enter developer's details below"}
            </p>

            <div className="space-y-5">
              {/* Developer's name field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Developer's name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full-name here"
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-[#D5D7DA]"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-[#D5D7DA]"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone number field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent ${
                    errors.phone ? "border-red-500" : "border-[#D5D7DA]"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-[#D5D7DA] bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#6500AC] text-white rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors"
              >
                {submitLabel ?? "Add details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDeveloperPopupModal;
