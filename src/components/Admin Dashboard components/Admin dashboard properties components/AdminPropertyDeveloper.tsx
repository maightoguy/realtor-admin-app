import AdminPagination from "../../AdminPagination.tsx";
import type { Developer } from "./adminDashboardPropertiesData";

interface AdminPropertyDeveloperProps {
  developers: Developer[];
  onAddDeveloper?: () => void;
  onViewDetails?: (developerId: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

const AdminPropertyDeveloper = ({
  developers,
  onAddDeveloper,
  onViewDetails,
  currentPage,
  onPageChange,
  itemsPerPage,
}: AdminPropertyDeveloperProps) => {
  // Calculate pagination
  const totalItems = developers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDevelopers = developers.slice(startIndex, endIndex);

  // Format date to "Month Day, Year" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Empty state
  if (developers.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex flex-row justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-600">Developers</h2>
        </div>
        <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-6">
            {/* Receipt/Cash Register Illustration */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <rect
                x="20"
                y="30"
                width="80"
                height="70"
                rx="4"
                fill="#F0F1F2"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              <rect x="30" y="40" width="60" height="8" rx="2" fill="#D1D5DB" />
              <rect x="30" y="55" width="40" height="8" rx="2" fill="#D1D5DB" />
              <rect x="30" y="70" width="50" height="8" rx="2" fill="#D1D5DB" />
              <circle cx="75" cy="75" r="8" fill="#9CA1AA" />
              <rect
                x="20"
                y="85"
                width="80"
                height="15"
                rx="2"
                fill="#E5E7EB"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-center mb-6 text-lg">
            You haven't added any developers yet!
          </p>
          <button
            onClick={onAddDeveloper}
            className="bg-[#5E17EB] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors"
          >
            Add developer
          </button>
        </div>
      </div>
    );
  }

  // Table view with data
  return (
    <div className="mb-6">
      <div className="flex flex-row justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-600">Developers</h2>
        <button
          onClick={onAddDeveloper}
          className="bg-[#5E17EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4D14C7] transition-colors whitespace-nowrap"
        >
          Add new developer
        </button>
      </div>

      {/* Developers Table */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-[#F0F1F2]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Total properties
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Phone number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date Added
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  {/* Empty header for View details column */}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F2]">
              {currentDevelopers.map((developer) => (
                <tr
                  key={developer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {developer.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {developer.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {developer.totalProperties}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{developer.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {formatDate(developer.dateAdded)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          developer.status === "Active"
                            ? "bg-[#22C55E]"
                            : "bg-[#EF4444]"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        {developer.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewDetails?.(developer.id)}
                      className="text-[#5E17EB] font-semibold text-sm hover:underline"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <AdminPagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default AdminPropertyDeveloper;
