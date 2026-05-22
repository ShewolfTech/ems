import React from "react";
import { X } from "lucide-react";

interface SystemRolerouteAccessViewDetailProps {
  item: any;
  onClose: () => void;
}

export function SystemRolerouteAccessViewDetail({ item, onClose }: SystemRolerouteAccessViewDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">SystemRolerouteAccessView Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.display_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Method</span>
          <span className="text-lg font-bold text-slate-900">{String(item.method ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Permission Key</span>
          <span className="text-lg font-bold text-slate-900">{String(item.permission_key ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.role_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.role_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Route</span>
          <span className="text-lg font-bold text-slate-900">{String(item.route ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default SystemRolerouteAccessViewDetail;