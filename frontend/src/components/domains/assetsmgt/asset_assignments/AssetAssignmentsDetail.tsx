import React from "react";
import { X } from "lucide-react";

interface AssetAssignmentsDetailProps {
  item: any;
  onClose: () => void;
}

export function AssetAssignmentsDetail({ item, onClose }: AssetAssignmentsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AssetAssignments Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.asset_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assigned_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned By</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assigned_by ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignment Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assignment_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</span>
          <span className="text-lg font-bold text-slate-900">{String(item.notes ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unassigned At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.unassigned_at ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AssetAssignmentsDetail;