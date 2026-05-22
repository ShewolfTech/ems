import React from "react";
import { X } from "lucide-react";

interface UserPermissionsDetailProps {
  item: any;
  onClose: () => void;
}

export function UserPermissionsDetail({ item, onClose }: UserPermissionsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">UserPermissions Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Action</span>
          <span className="text-lg font-bold text-slate-900">{String(item.action ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Allowed</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_allowed ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Module</span>
          <span className="text-lg font-bold text-slate-900">{String(item.module ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Permission Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.permission_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resource</span>
          <span className="text-lg font-bold text-slate-900">{String(item.resource ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Revoked At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.revoked_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Revoked By</span>
          <span className="text-lg font-bold text-slate-900">{String(item.revoked_by ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default UserPermissionsDetail;