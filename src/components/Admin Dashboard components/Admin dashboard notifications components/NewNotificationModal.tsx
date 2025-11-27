import { useEffect, useState, useMemo, useRef } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import NotificationBellIcon from "../../icons/NotificationBellIcon";
import { mockRealtors } from "../Admin dashboard realtors components/AdminRealtorsData";
import { sampleDevelopers } from "../Admin dashboard properties components/adminDashboardPropertiesData";

interface NewNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    title: string;
    userType: string;
    selectedUsers: string[];
    body: string;
  }) => void;
}

const NewNotificationModal = ({
  isOpen,
  onClose,
  onSubmit,
}: NewNotificationModalProps) => {
  const [title, setTitle] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userTypes = [
    "All Users",
    "Realtors",
    "Developers",
    "Clients",
    "Admins",
  ];

  // Get users based on selected user type
  const availableUsers = useMemo(() => {
    if (!selectedUserType) return [];

    switch (selectedUserType) {
      case "Realtors":
        return mockRealtors.map((r) => r.name);
      case "Developers":
        return sampleDevelopers.map((d) => d.name);
      case "Clients":
        // Mock client names
        return [
          "Musa Aliyu",
          "Chijioke Orji",
          "Monye Idamiebi",
          "Goinbo Ekisagha",
          "Adebayo Salami",
          "Simisola Okunade",
          "Binaebi Oyintare",
          "Safiya Usman",
        ];
      case "Admins":
        return ["Olivia Rhye", "Admin User 1", "Admin User 2"];
      default:
        return [];
    }
  }, [selectedUserType]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return availableUsers;
    const query = userSearchQuery.toLowerCase();
    return availableUsers.filter((name) => name.toLowerCase().includes(query));
  }, [availableUsers, userSearchQuery]);

  // Get display text for selected users
  const getDisplayText = () => {
    if (!selectedUserType) return "Select user type";
    if (selectedUsers.length === 0) {
      return selectedUserType === "All Users"
        ? "All Users"
        : `All ${selectedUserType.toLowerCase()}`;
    }
    if (selectedUsers.length === 1) return selectedUsers[0];
    if (selectedUsers.length <= 3) return selectedUsers.join(", ");
    return `${selectedUsers.length} users selected`;
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setSelectedUserType("");
      setSelectedUsers([]);
      setBody("");
      setShowUserDropdown(false);
      setUserSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedUserType || !body.trim()) {
      return; // Don't submit if required fields are empty
    }
    onSubmit?.({ title, userType: selectedUserType, selectedUsers, body });
    onClose();
  };

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setSelectedUsers([]); // Reset selected users when changing type
    setUserSearchQuery(""); // Reset search
    if (type === "All Users") {
      setShowUserDropdown(false);
    }
  };

  const handleUserSelect = (userName: string) => {
    if (userName.startsWith("All ")) {
      // Select/deselect all
      if (selectedUsers.length === availableUsers.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers([...availableUsers]);
      }
    } else {
      // Toggle individual user
      if (selectedUsers.includes(userName)) {
        setSelectedUsers(selectedUsers.filter((u) => u !== userName));
      } else {
        setSelectedUsers([...selectedUsers, userName]);
      }
    }
  };

  const isAllSelected = () => {
    return (
      selectedUserType &&
      selectedUserType !== "All Users" &&
      selectedUsers.length === availableUsers.length &&
      availableUsers.length > 0
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-[#F0F1F2]">
            <div className="flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <NotificationBellIcon color="#000000" className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  New notification
                </h2>
                <p className="text-sm text-gray-600">
                  Kindly enter notification details below
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of this notification"
                className="w-full px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
                required
              />
            </div>

            {/* User Type Field */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-full px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
                >
                  <span
                    className={
                      selectedUserType || selectedUsers.length > 0
                        ? "text-gray-900"
                        : "text-gray-400"
                    }
                  >
                    {getDisplayText()}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      showUserDropdown ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-[#F0F1F2] rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                    {/* User Type Selection (if no type selected) */}
                    {!selectedUserType && (
                      <div className="overflow-y-auto">
                        {userTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleUserTypeSelect(type)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors text-gray-900"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* User Selection (if type is selected and not "All Users") */}
                    {selectedUserType && selectedUserType !== "All Users" && (
                      <>
                        {/* User Type Header with Change Option */}
                        <div className="px-4 py-2 border-b border-[#F0F1F2] bg-gray-50 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">
                            {selectedUserType}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserType("");
                              setSelectedUsers([]);
                              setUserSearchQuery("");
                            }}
                            className="text-xs text-[#6500AC] hover:underline"
                          >
                            Change
                          </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-3 border-b border-[#F0F1F2]">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={userSearchQuery}
                              onChange={(e) =>
                                setUserSearchQuery(e.target.value)
                              }
                              placeholder="Search by name"
                              className="w-full pl-10 pr-4 py-2 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* User List */}
                        <div className="overflow-y-auto max-h-60">
                          {/* "All [Type]" Option */}
                          <button
                            type="button"
                            onClick={() =>
                              handleUserSelect(
                                `All ${selectedUserType.toLowerCase()}`
                              )
                            }
                            className={`w-full px-4 py-3 text-left text-sm transition-colors border-b border-[#F0F1F2] ${
                              isAllSelected()
                                ? "bg-[#F0E6F7] text-[#6500AC] font-medium"
                                : "hover:bg-gray-50 text-gray-900"
                            }`}
                          >
                            + All {selectedUserType.toLowerCase()}
                          </button>

                          {/* Individual Users */}
                          {filteredUsers.map((userName) => (
                            <button
                              key={userName}
                              type="button"
                              onClick={() => handleUserSelect(userName)}
                              className={`w-full px-4 py-3 text-left text-sm transition-colors border-b border-[#F0F1F2] last:border-b-0 ${
                                selectedUsers.includes(userName)
                                  ? "bg-[#F0E6F7] text-[#6500AC] font-medium"
                                  : "hover:bg-gray-50 text-gray-900"
                              }`}
                            >
                              {userName}
                            </button>
                          ))}

                          {filteredUsers.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No users found
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Body Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type here..."
                rows={6}
                className="w-full px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[#F0F1F2] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#6500AC] text-white rounded-lg text-sm font-medium hover:bg-[#4A14C7] transition-colors"
              >
                Send notification
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewNotificationModal;
