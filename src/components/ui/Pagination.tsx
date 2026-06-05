import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-beige-400 text-text-400 hover:bg-beige-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            w-8 h-8 flex items-center justify-center rounded-lg
            text-sm font-medium transition-colors
            ${currentPage === page
              ? "bg-primary-700 text-cream-500"
              : "border border-beige-400 text-text-400 hover:bg-beige-200"
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-beige-400 text-text-400 hover:bg-beige-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>

    </div>
  );
}

export default Pagination;