import { useState } from "react";
import { Users, Building2, FileText, DollarSign, TrendingUp, ChevronRight } from "lucide-react";
import AdminPagination from "../../AdminPagination.tsx";
import ProfilePic1 from "../../../assets/Profile 1.jpg";
import ProfilePic2 from "../../../assets/Profile 2.jpg";
import ProfilePic3 from "../../../assets/Profile 3.jpg";
import ProfilePic4 from "../../../assets/Profile 4.jpg";
import ProfilePic5 from "../../../assets/Profile 5.jpg";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  isEmpty?: boolean;
}

const MetricCard = ({ title, value, icon, iconBgColor, isEmpty }: MetricCardProps) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {isEmpty ? "-" : value}
        </p>
      </div>
      <div className={`${iconBgColor} rounded-full p-3 flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

interface TopRealtorItemProps {
  name: string;
  value: string;
  avatar: string;
  isEmpty?: boolean;
}

const TopRealtorItem = ({ name, value, avatar, isEmpty }: TopRealtorItemProps) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <span className="text-sm font-medium text-gray-700">
        {isEmpty ? "---" : name}
      </span>
    </div>
    <span className="text-sm font-semibold text-gray-900">
      {isEmpty ? "N0" : value}
    </span>
  </div>
);

interface ReceiptRowProps {
  receiptId: string;
  property: string;
  realtorName: string;
  realtorAvatar: string;
  clientName: string;
  dateUploaded: string;
  status: "Pending" | "Approved" | "Rejected";
}

const ReceiptRow = ({
  receiptId,
  property,
  realtorName,
  realtorAvatar,
  clientName,
  dateUploaded,
  status,
}: ReceiptRowProps) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 text-sm font-medium text-gray-900">{receiptId}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{property}</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <img src={realtorAvatar} alt={realtorName} className="w-full h-full object-cover" />
        </div>
        <span className="text-sm text-gray-700">{realtorName}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-sm text-gray-700">{clientName}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{dateUploaded}</td>
    <td className="px-4 py-3">
      <span className="flex items-center gap-1 text-sm text-gray-600">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        {status}
      </span>
    </td>
    <td className="px-4 py-3">
      <button className="text-sm text-[#5E17EB] font-medium hover:underline">
        View details
      </button>
    </td>
  </tr>
);

const AdminDashboardOverview = () => {
  const [chartView, setChartView] = useState<"Commission" | "Realtors">("Commission");
  const [currentPage, setCurrentPage] = useState(1);

  // Empty state - no data available
  const hasData = false;

  // Sample data for when hasData is true (for demonstration)
  const metricsData = {
    totalRealtors: "1,000,000",
    totalProperties: "100,000",
    pendingReceipts: "50",
    commissionPaid: "₦500M",
    totalSale: "₦500M",
  };

  const topRealtorsData = [
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: ProfilePic1 },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: ProfilePic2 },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: ProfilePic3 },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: ProfilePic4 },
    { name: "Kemi Durojaiye", value: "₦ 1,850,350", avatar: ProfilePic5 },
  ];

  const commissionData = [3, 5, 4, 6, 5, 7, 6, 8, 5, 4, 6, 5]; // Sample monthly data
  const realtorsData = [2, 3, 4, 5, 4, 6, 5, 7, 4, 3, 5, 4]; // Sample monthly data

  const recentReceiptsData = [
    {
      receiptId: "#12345",
      property: "Parkview estate",
      realtorName: "Iretiola Okunade",
      realtorAvatar: ProfilePic1,
      clientName: "Simisola Okunade",
      dateUploaded: "May 13th, 2025",
      status: "Pending" as const,
    },
    {
      receiptId: "#12345",
      property: "City of David Estate",
      realtorName: "Izuokumo Aganaba",
      realtorAvatar: ProfilePic2,
      clientName: "Binaebi Oyintare",
      dateUploaded: "May 13th, 2025",
      status: "Pending" as const,
    },
    {
      receiptId: "#12345",
      property: "Oluwole Estate",
      realtorName: "Seyi Olabode",
      realtorAvatar: ProfilePic3,
      clientName: "Safiya Usman",
      dateUploaded: "May 13th, 2025",
      status: "Pending" as const,
    },
    {
      receiptId: "#12345",
      property: "Lagos Estate",
      realtorName: "Kuroebi Timipre",
      realtorAvatar: ProfilePic4,
      clientName: "Chinyere Nwankwo",
      dateUploaded: "May 13th, 2025",
      status: "Pending" as const,
    },
    {
      receiptId: "#12345",
      property: "Iyana iba Estate",
      realtorName: "Tonbara Ziworitin",
      realtorAvatar: ProfilePic5,
      clientName: "Rahma Ahmad",
      dateUploaded: "May 13th, 2025",
      status: "Pending" as const,
    },
  ];

  const chartData = chartView === "Commission" ? commissionData : realtorsData;
  const maxValue = Math.max(...chartData, 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="p-6 bg-[#FCFCFC]">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Total Realtors"
          value={hasData ? metricsData.totalRealtors : "-"}
          icon={<Users className="w-5 h-5 text-white" />}
          iconBgColor="bg-[#5E17EB]"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Total Properties"
          value={hasData ? metricsData.totalProperties : "-"}
          icon={<Building2 className="w-5 h-5 text-white" />}
          iconBgColor="bg-green-500"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Pending Receipts"
          value={hasData ? metricsData.pendingReceipts : "-"}
          icon={<FileText className="w-5 h-5 text-white" />}
          iconBgColor="bg-red-500"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Commission paid"
          value={hasData ? metricsData.commissionPaid : "-"}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          iconBgColor="bg-gray-500"
          isEmpty={!hasData}
        />
        <MetricCard
          title="Total sale"
          value={hasData ? metricsData.totalSale : "-"}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          iconBgColor="bg-orange-500"
          isEmpty={!hasData}
        />
      </div>

      {/* Charts and Top Realtors Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Commission Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Commission Statistics</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView("Commission")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartView === "Commission"
                    ? "bg-[#5E17EB] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Commission
              </button>
              <button
                onClick={() => setChartView("Realtors")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartView === "Realtors"
                    ? "bg-[#5E17EB] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Realtors
              </button>
            </div>
          </div>

          {hasData ? (
            <div className="h-64">
              <div className="flex items-end justify-between h-full gap-2">
                {chartData.map((value, index) => {
                  const height = (value / maxValue) * 100;
                  const isCurrentMonth = months[index] === "Aug";
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-48">
                        <div
                          className={`w-full rounded-t transition-all ${
                            isCurrentMonth ? "bg-green-500" : "bg-[#5E17EB]"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{months[index]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>₦0</span>
                <span>₦1M</span>
                <span>₦5M</span>
                <span>₦10M</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-sm">No commission data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Realtors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Realtors</h3>
          {hasData ? (
            <div>
              {topRealtorsData.map((realtor, index) => (
                <TopRealtorItem
                  key={index}
                  name={realtor.name}
                  value={realtor.value}
                  avatar={realtor.avatar}
                  isEmpty={false}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <TopRealtorItem
                  key={i}
                  name="---"
                  value="N0"
                  avatar={ProfilePic1}
                  isEmpty={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Receipts Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Receipt</h3>
          <button className="text-sm text-[#5E17EB] font-medium hover:underline flex items-center gap-1">
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {hasData ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Receipt ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Realtor name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Uploaded
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceiptsData.map((receipt, index) => (
                    <ReceiptRow key={index} {...receipt} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200">
              <AdminPagination
                totalItems={100}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No recent receipts available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;

