import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Database, Loader2, BarChart3, Edit, Trash2, Users } from "lucide-react";

interface AssessmentsListProps {
  data?: any[];
  loading?: boolean;
  onSelect?: (item: any) => void;
  onDelete?: (id: string) => Promise<void>;
  pageSize?: number;
}

const PAGE_SIZE = 100;

export function AssessmentsList({ data, loading, onSelect, onDelete, pageSize = PAGE_SIZE }: AssessmentsListProps) {
  const navigate = useNavigate();
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 bg-white border border-slate-200 rounded-[2.5rem]">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-900" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Loading...</p>
    </div>
  );
  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 text-slate-400">
      <Database className="w-12 h-12 mb-4 opacity-10" />
      <p className="font-bold uppercase tracking-tight text-center">No assessments found</p>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Term</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conductors</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Max</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.map((item: any) => {
              const avgScore = item.average_score ? Number(item.average_score).toFixed(1) : '—';
              const totalResults = item.total_results || 0;
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{item.title || "—"}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {totalResults} graded
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.class_name || item.class_code || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.subject_name || item.subject_code || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.term_name || "—"}</td>
                  <td className="px-6 py-4 text-sm">
                    {item.conductors && item.conductors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.conductors.map((c: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-700">
                            {c.name || '—'}
                            {c.role && c.role !== 'invigilator' && (
                              <span className="text-teal-500">({c.role})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">None assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.max_score || "—"}</td>
                  <td className="px-6 py-4 text-sm">
                    {avgScore !== '—' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        Number(avgScore) >= 70 ? 'bg-green-100 text-green-700' :
                        Number(avgScore) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {avgScore}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/academics/assessment-results?assessmentId=${item.id}`)}
                        className="p-1.5 bg-teal-100 hover:bg-teal-200 rounded text-teal-700"
                        title="Record Grades"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelect?.(item)}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete?.(item.id)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-500 font-medium">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.length)} of {data.length} records
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 hover:bg-white rounded-xl disabled:opacity-30"><ChevronRight className="w-5 h-5 rotate-180" /></button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 hover:bg-white rounded-xl disabled:opacity-30">←</button>
            <span className="text-sm font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 hover:bg-white rounded-xl disabled:opacity-30">→</button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 hover:bg-white rounded-xl disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentsList;
