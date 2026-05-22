import React, { useState, useMemo } from "react";
import { ChevronRight, Database, Loader2 } from "lucide-react";

interface RolePermissionsListProps {
  data?: any[];
  loading?: boolean;
  onSelect: (item: any) => void;
  pageSize?: number;
}

const PAGE_SIZE = 100;

export function RolePermissionsList({ data, loading, onSelect, pageSize = PAGE_SIZE }: RolePermissionsListProps) {
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
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Is Active</th><th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Permission Key</th><th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Role Id</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.map((item: any) => (
              <tr key={item.id} onClick={() => onSelect(item)} className="hover:bg-slate-50/80 cursor-pointer transition-all group">
                <td className="px-8 py-5 text-sm text-slate-700 font-bold">{String(item.is_active ?? "—")}</td><td className="px-8 py-5 text-sm text-slate-700 font-bold">{String(item.permission_key ?? "—")}</td><td className="px-8 py-5 text-sm text-slate-700 font-bold">{String(item.role_id ?? "—")}</td>
                <td className="px-8 py-5 text-right"><ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors inline" /></td>
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
export default RolePermissionsList;