import React from "react";
import { X } from "lucide-react";

interface DepartmentsDetailProps {
  item: any;
  onClose: () => void;
}

export function DepartmentsDetail({ item, onClose }: DepartmentsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Departments Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Code</span>
          <span className="text-lg font-bold text-slate-900">{String(item.code ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</span>
          <span className="text-lg font-bold text-slate-900">{String(item.description ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.name ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default DepartmentsDetail;