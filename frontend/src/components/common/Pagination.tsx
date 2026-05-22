import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, startRecord, endRecord, totalRecords, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between mt-4 px-2 py-3 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium">{startRecord}</span>-<span className="font-medium">{endRecord}</span> of <span className="font-medium">{totalRecords}</span> records
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
