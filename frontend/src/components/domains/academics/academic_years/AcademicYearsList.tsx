import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface AcademicYearsListProps {
  data?: any[];
  loading?: boolean;
  onSelect: (item: any) => void;
  pageSize?: number;
}

const PAGE_SIZE = 100;

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

export function AcademicYearsList({ data, loading, onSelect, pageSize = PAGE_SIZE }: AcademicYearsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  if (loading) return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
      <p className="text-sm text-gray-500">Loading academic years...</p>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
      No academic years found
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(item)}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{item.name || "—"}</div>
                {item.code && <div className="text-xs text-gray-500 font-mono">{item.code}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(item.start_date)} → {formatDate(item.end_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {(() => {
                  if (!item.start_date || !item.end_date) return "—";
                  const days = Math.round((new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24));
                  return `${days} days`;
                })()}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {item.is_current && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Current</span>
                  )}
                  {item.is_active ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">Inactive</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <ChevronRight className="w-4 h-4 text-gray-400 inline" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, data.length)}</span> of{' '}
              <span className="font-medium">{data.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicYearsList;
