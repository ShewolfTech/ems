import React, { useState, useMemo } from "react";
import { ChevronRight, Database, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface LessonDeliveriesListProps {
  data?: any[];
  loading?: boolean;
  onSelect?: (item: any) => void;
  onDelete?: (id: string) => Promise<void>;
  onQuickMark?: (item: any, action: 'delivered' | 'cancelled' | 'postponed') => void;
  pageSize?: number;
}

const PAGE_SIZE = 100;

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    planned: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-3 h-3" />, label: 'Planned' },
    delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' },
    postponed: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-3 h-3" />, label: 'Postponed' },
  };

  const { color, icon, label } = config[status] || config.planned;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

export function LessonDeliveriesList({ data, loading, onSelect, onDelete, onQuickMark, pageSize = PAGE_SIZE }: LessonDeliveriesListProps) {
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
      <p className="font-bold uppercase tracking-tight text-center">No records found</p>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Class</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Subject</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Teacher</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Time</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Attendance</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Rescheduled</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Actions</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-5 text-sm text-slate-700 font-medium">
                  {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-8 py-5 text-sm text-slate-700 font-bold">{item.class_name || item.class_code || "—"}</td>
                <td className="px-8 py-5 text-sm text-slate-700 font-bold">{item.subject_name || item.subject_code || "—"}</td>
                <td className="px-8 py-5 text-sm text-slate-700 font-medium">
                  {item.teacher_name || `${item.teacher_first_name || ''} ${item.teacher_last_name || ''}` || "—"}
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">
                  {item.lesson_start_time && item.lesson_end_time 
                    ? `${item.lesson_start_time.substring(0, 5)} - ${item.lesson_end_time.substring(0, 5)}` 
                    : (item.start_time && item.end_time 
                      ? `${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}`
                      : "—")}
                </td>
                <td className="px-8 py-5 text-sm text-slate-700 font-medium">
                  {item.attendance_count !== null && item.attendance_count !== undefined && item.total_students !== null && item.total_students !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.attendance_count}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500">{item.total_students}</span>
                      {item.attendance_count > 0 && item.total_students > 0 && (
                        <span className="text-xs text-gray-400">({Math.round((item.attendance_count / item.total_students) * 100)}%)</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-8 py-5 text-sm">
                  {item.rescheduled_to_date ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      ↗ {new Date(item.rescheduled_to_date).toLocaleDateString()}
                    </span>
                  ) : item.rescheduled_from_id ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      ↩ From {item.original_scheduled_date ? new Date(item.original_scheduled_date).toLocaleDateString() : '—'}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  {item.status === 'planned' && onQuickMark && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onQuickMark(item, 'delivered'); }}
                        className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-green-700"
                        title="Mark as Delivered"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onQuickMark(item, 'cancelled'); }}
                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700"
                        title="Mark as Cancelled"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onQuickMark(item, 'postponed'); }}
                        className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700"
                        title="Mark as Postponed"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  <ChevronRight 
                    onClick={() => onSelect?.(item)}
                    className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors inline cursor-pointer" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
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

export default LessonDeliveriesList;
