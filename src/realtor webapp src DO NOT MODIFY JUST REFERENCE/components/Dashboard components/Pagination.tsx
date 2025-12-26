import { useState } from "react";

interface PaginationProps {
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const Pagination = ({
  totalItems = 40,
  itemsPerPage = 8,
  onPageChange,
}: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-center border border-[#F0F1F2] rounded-[10px] px-4 py-3 mt-8 shadow-sm bg-white w-full max-w-[1104px] mx-auto">
      {/* Page details */}
      <p className="text-sm text-[#344054] font-inter mb-3 sm:mb-0">
        Page <span className="font-semibold">{currentPage}</span> of{" "}
        {totalPages}
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`flex items-center justify-center px-4 py-2 text-[#344054] text-sm font-medium font-montserrat border border-[#D0D5DD] bg-white rounded-lg shadow-sm transition 
            ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center px-4 py-2 text-[#344054] text-sm font-medium font-montserrat border border-[#D0D5DD] bg-white rounded-lg shadow-sm transition 
            ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
