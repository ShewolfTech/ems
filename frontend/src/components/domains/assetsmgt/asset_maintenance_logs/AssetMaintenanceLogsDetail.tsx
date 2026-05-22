import React from "react";
import { X } from "lucide-react";

interface AssetMaintenanceLogsDetailProps {
  item: any;
  onClose: () => void;
}

export function AssetMaintenanceLogsDetail({ item, onClose }: AssetMaintenanceLogsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AssetMaintenanceLogs Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.asset_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Details</span>
          <span className="text-lg font-bold text-slate-900">{String(item.details ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logged At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.logged_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Log Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.log_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resolution Notes</span>
          <span className="text-lg font-bold text-slate-900">{String(item.resolution_notes ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resolved At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.resolved_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technician Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.technician_id ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AssetMaintenanceLogsDetail;