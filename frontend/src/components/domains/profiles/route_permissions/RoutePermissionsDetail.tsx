import React from "react";
import { X } from "lucide-react";

interface RoutePermissionsDetailProps {
  item: any;
  onClose: () => void;
}

export function RoutePermissionsDetail({ item, onClose }: RoutePermissionsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">RoutePermissions Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Action</span>
          <span className="text-lg font-bold text-slate-900">{String(item.action ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.display_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Order</span>
          <span className="text-lg font-bold text-slate-900">{String(item.display_order ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Icon</span>
          <span className="text-lg font-bold text-slate-900">{String(item.icon ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Global</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_global ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Menu Item</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_menu_item ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Method</span>
          <span className="text-lg font-bold text-slate-900">{String(item.method ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Module</span>
          <span className="text-lg font-bold text-slate-900">{String(item.module ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Permission Key</span>
          <span className="text-lg font-bold text-slate-900">{String(item.permission_key ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resource</span>
          <span className="text-lg font-bold text-slate-900">{String(item.resource ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Route</span>
          <span className="text-lg font-bold text-slate-900">{String(item.route ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Route Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.route_type ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default RoutePermissionsDetail;