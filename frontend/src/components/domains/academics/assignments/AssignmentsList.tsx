import React, { useState, useMemo } from "react";
import { ChevronRight, Database, Loader2, Eye, Edit, Trash2, Clock, CheckCircle } from "lucide-react";

interface AssignmentsListProps {
  data?: any[];
  loading?: boolean;
  onSelect?: (item: any) => void;
  onDelete?: (id: string) => Promise<void>;
  onView?: (item: any) => void;
  pageSize?: number;
}

const PAGE_SIZE = 100;

export function AssignmentsList({ data, loading, onSelect, onDelete, onView, pageSize = PAGE_SIZE }: AssignmentsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate: string, isActive: boolean) => {
    if (!dueDate || !isActive) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 bg-white border border-slate-200 rounded-xl">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-600" />
      <p className="text-sm font-semibold text-slate-500">Loading assignments...</p>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <Database className="w-16 h-16 mb-4 text-slate-300" />
      <p className="text-lg font-semibold text-slate-600 mb-2">No Assignments Found</p>
      <p className="text-sm text-slate-500">Create your first assignment to get started</p>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 sticky top-0 z-20 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">#</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap sticky left-[3rem] bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[250px]">Title</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Class</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Subject</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Term</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Due Date</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Max Score</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Submissions</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item: any, idx: number) => {
              const overdue = isOverdue(item.due_date, item.is_active);
              const submissionRate = item.total_students > 0 ? (item.submissions_count / item.total_students) * 100 : 0;

              return (
                <tr key={item.id} className="hover:bg-teal-50/50 transition-all cursor-pointer group">
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{((currentPage - 1) * pageSize) + idx + 1}</td>
                  <td className="px-6 py-4 sticky left-[3rem] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[250px]">
                    <div className="font-semibold text-slate-900">{item.title || "—"}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{item.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.class_name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.subject_name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.term_name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className={overdue ? "text-red-600 font-semibold" : ""}>
                      {formatDate(item.due_date)}
                    </div>
                    {overdue && (
                      <div className="text-[10px] text-red-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-center font-semibold">{item.max_score || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    {item.total_students > 0 ? (
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {item.submissions_count || 0}/{item.total_students}
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 max-w-[80px] mx-auto">
                          <div
                            className={`h-1.5 rounded-full ${
                              submissionRate >= 70 ? 'bg-green-500' :
                              submissionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${submissionRate}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{submissionRate.toFixed(0)}%</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No students</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(item);
                          }}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                      {onSelect && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(item);
                          }}
                          className="p-1.5 hover:bg-teal-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-teal-600" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600 font-medium">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.length)} of {data.length} assignments
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => goToPage(1)} 
              disabled={currentPage === 1} 
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="px-3 py-1 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              ← Prev
            </button>
            <span className="text-sm font-semibold text-slate-600">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className="px-3 py-1 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next →
            </button>
            <button 
              onClick={() => goToPage(totalPages)} 
              disabled={currentPage === totalPages} 
              className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsList;