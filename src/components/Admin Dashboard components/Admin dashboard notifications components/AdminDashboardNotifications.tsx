import { useState, useMemo, useEffect } from "react";
import AdminSearchBar from "../../AdminSearchBar";
import AdminPagination from "../../AdminPagination";
import type { Notification } from "./AdminNotificationsData";
import NewNotificationModal from "./NewNotificationModal";
import NotificationDetailsModal from "./NotificationDetailsModal";
import { notificationService } from "../../../services/apiService";
import AdminSearchFilterModal from "../../AdminSearchFilterModal";

// Status badge component
const StatusBadge = ({ status }: { status: Notification["status"] }) => {
  const statusConfig = {
    Sent: { color: "#22C55E", bgColor: "#D1FAE5", label: "Sent" },
    Failed: { color: "#EF4444", bgColor: "#FEE2E2", label: "Failed" },
  };

  const config = statusConfig[status] || statusConfig.Sent;

  return (
    <span
      className="flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-md"
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      ></span>
      {config.label}
    </span>
  );
};

const AdminDashboardNotifications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] =
    useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const itemsPerPage = 8;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    const day = d.getDate();
    const suffix =
      day % 10 === 1 && day % 100 !== 11
        ? "st"
        : day % 10 === 2 && day % 100 !== 12
        ? "nd"
        : day % 10 === 3 && day % 100 !== 13
        ? "rd"
        : "th";
    const monthName = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear();
    return `${monthName} ${day}${suffix}, ${year}`;
  };

  const refreshLogs = async () => {
    setLoadError(null);
    try {
      const logs = await notificationService.getAdminLogs({ limit: 200 });
      setNotifications(
        logs.map((l) => ({
          id: l.id,
          title: l.title,
          message: l.message,
          date: formatDate(l.created_at),
          status: l.status,
          userType: l.userType,
          selectedUsers: l.selectedUsers,
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Load failed.";
      setLoadError(message);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  // Filter notifications based on search query
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply modal filters
    const status = activeFilters["Status"] as string | undefined;
    if (status) {
      filtered = filtered.filter((n) => n.status === status);
    }

    const userType = activeFilters["User Type"] as string | undefined;
    if (userType) {
      filtered = filtered.filter((n) => n.userType === userType);
    }

    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.date.toLowerCase().includes(query)
    );
  }, [searchQuery, notifications, activeFilters]);

  // Pagination
  const totalItems = filteredNotifications.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filteredNotifications.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = (filters: Record<string, unknown>) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      setSelectedNotification(notification);
      setIsDetailsModalOpen(true);
    }
  };

  const handleResendNotification = (notificationId: string) => {
    const n = notifications.find((x) => x.id === notificationId);
    if (!n) return;

    const roleForUserType = (type?: string) => {
      if (!type) return null;
      if (type === "Realtors") return "realtor";
      if (type === "Admins") return "admin";
      if (type === "Developers") return "developer";
      if (type === "Clients") return "client";
      return null;
    };

    const target =
      n.userType === "All Users"
        ? ({ kind: "all" } as const)
        : n.userType === "Selected users"
        ? ({
            kind: "userIds",
            userIds: (n.selectedUsers ?? []) as string[],
          } as const)
        : roleForUserType(n.userType)
        ? ({ kind: "role", role: roleForUserType(n.userType) ?? "" } as const)
        : ({ kind: "userIds", userIds: [] as string[] } as const);

    setIsLoading(true);
    notificationService
      .sendBroadcast({
        title: n.title,
        message: n.message,
        target,
        metadata: { resend_of: n.id },
      })
      .then(() => refreshLogs())
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Resend failed.";
        setLoadError(message);
        setIsLoading(false);
      });
  };

  const handleNotificationSubmit = () => {
    setIsLoading(true);
    refreshLogs();
  };

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Notifications
        </h1>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">All notifications</p>
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <AdminSearchBar
              onSearch={handleSearch}
              onFilterClick={handleFilterClick}
              className="flex-1 sm:flex-initial"
              placeholder="Search"
            />
          </div>
          <button
            onClick={() => setIsNewNotificationModalOpen(true)}
            className="bg-[#3D0066] text-white px-4 py-2 min-h-[44px] rounded-lg flex items-center justify-center gap-2 hover:bg-[#3D0066]/90 transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            <span className="text-xl">+</span>
            New Notification
          </button>
        </div>
      </div>

      <AdminSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        initialFilters={activeFilters}
        config={{
          title: "Filter Notifications",
          description: "Filter notifications by status and user type",
          showPrice: false,
          showPropertyType: false,
          showLocation: false,
          showStatus: true,
          statusOptions: ["Sent", "Failed"],
          showUserType: true,
          userTypeOptions: [
            "All Users",
            "Realtors",
            "Admins",
          ],
        }}
      />

      {/* Notifications Table */}
      <div className="bg-white border border-[#F0F1F2] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="hidden md:block overflow-x-auto admin-table-scroll">
          <table className="admin-table">
            <thead className="bg-gray-50 border-b border-[#F0F1F2]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F2]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {loadError}
                  </td>
                </tr>
              ) : currentNotifications.length > 0 ? (
                currentNotifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {notification.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md ">
                      <p className="line-clamp-1">{notification.message}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {notification.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={notification.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(notification.id)}
                        className="text-sm text-[#6500AC] font-semibold hover:underline whitespace-nowrap"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No notifications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden px-3 pb-3 space-y-3">
          {isLoading ? (
            <div className="px-2 py-6 text-center text-xs text-gray-500">
              Loading...
            </div>
          ) : loadError ? (
            <div className="px-2 py-6 text-center text-xs text-gray-500">
              {loadError}
            </div>
          ) : currentNotifications.length > 0 ? (
            currentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="border border-[#E9EAEB] rounded-lg p-3 bg-white shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0A1B39] truncate">
                      {notification.title}
                    </p>
                    <p className="text-[10px] text-[#667085] line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={notification.status} />
                  </div>
                </div>
                <p className="text-[10px] text-[#667085]">{notification.date}</p>
                <button
                  onClick={() => handleViewDetails(notification.id)}
                  className="w-full mt-2 py-2 min-h-[44px] border border-[#EAECF0] rounded-lg text-[10px] font-medium text-[#344054] hover:bg-gray-50 transition-colors"
                >
                  View details
                </button>
              </div>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-xs text-gray-500">
              No notifications found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <AdminPagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* New Notification Modal */}
      <NewNotificationModal
        isOpen={isNewNotificationModalOpen}
        onClose={() => setIsNewNotificationModalOpen(false)}
        onSubmit={handleNotificationSubmit}
      />

      {/* Notification Details Modal */}
      <NotificationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onResend={handleResendNotification}
      />
    </div>
  );
};

export default AdminDashboardNotifications;
