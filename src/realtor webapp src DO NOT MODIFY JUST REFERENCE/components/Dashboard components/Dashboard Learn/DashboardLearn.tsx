import { useState, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";
import { mockLearnArticles } from "./LearnData";
import Pagination from "../Pagination";

const LearnCard = ({ article }: { article: (typeof mockLearnArticles)[0] }) => (
  <div className="bg-white rounded-lg shadow-sm border border-[#EAECF0] overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer group">
    {/* Image */}
    <div className="relative h-32 md:h-48 overflow-hidden">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          // Fallback for broken images
          const target = e.target as HTMLImageElement;
          target.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3EImage placeholder%3C/text%3E%3C/svg%3E";
        }}
      />

      {/* External link icon */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
          <ExternalLink className="w-4 h-4 text-[#6500AC]" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="p-2.5 md:p-4">
      {/* Date */}
      <p className="text-[#6500AC] text-[10px] md:text-sm font-medium mb-1 md:mb-2">
        {article.date}
      </p>

      {/* Title */}
      <h3 className="text-[#0A1B39] font-semibold text-sm md:text-lg mb-1 md:mb-2 line-clamp-2 group-hover:text-[#6500AC] transition-colors">
        {article.title}
      </h3>

      {/* Description */}
      <p className="text-[#667085] text-[10px] md:text-sm mb-2 md:mb-3 line-clamp-3">
        {article.description}
      </p>

      {/* Read time */}
      <div className="flex items-center justify-between">
        <span className="text-[#9CA1AA] text-[10px] md:text-xs">
          {article.readTime}
        </span>
        <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-[#9CA1AA] group-hover:text-[#6500AC] transition-colors" />
      </div>
    </div>
  </div>
);

const DashboardLearn = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter articles based on search query
  const filteredArticles = mockLearnArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredArticles.length;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="px-3 py-3 md:px-6 md:py-6 space-y-3 md:space-y-6">
      {/* Header */}
      <div className="space-y-3 md:space-y-4">
        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA1AA] w-3.5 h-3.5 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 md:pl-10 md:pr-4 md:py-3 text-xs md:text-sm border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {paginatedArticles.map((article) => (
          <LearnCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex justify-center pt-6">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F0E6F7] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Search className="w-6 h-6 md:w-8 md:h-8 text-[#6500AC]" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-[#0A1B39] mb-1 md:mb-2">
            No articles found
          </h3>
          <p className="text-xs md:text-base text-[#667085] mb-3 md:mb-4">
            Try adjusting your search terms or browse all articles.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-base bg-[#6500AC] text-white rounded-lg hover:bg-[#5C009D] transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLearn;
