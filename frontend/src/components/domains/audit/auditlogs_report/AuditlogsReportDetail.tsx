import React from "react";
import { X } from "lucide-react";

interface AuditlogsReportDetailProps {
  item: any;
  onClose: () => void;
}

export function AuditlogsReportDetail({ item, onClose }: AuditlogsReportDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AuditlogsReport Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Action</span>
          <span className="text-lg font-bold text-slate-900">{String(item.action ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Value</span>
          <span className="text-lg font-bold text-slate-900">{String(item.new_value ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Old Value</span>
          <span className="text-lg font-bold text-slate-900">{String(item.old_value ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resource Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.resource_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resource Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.resource_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">School Scope</span>
          <span className="text-lg font-bold text-slate-900">{String(item.school_scope ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AuditlogsReportDetail;