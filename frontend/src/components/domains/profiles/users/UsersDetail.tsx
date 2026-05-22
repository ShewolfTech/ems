import React from "react";
import { X } from "lucide-react";

interface UsersDetailProps {
  item: any;
  onClose: () => void;
}

export function UsersDetail({ item, onClose }: UsersDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Users Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Auth Uid</span>
          <span className="text-lg font-bold text-slate-900">{String(item.auth_uid ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Of Birth</span>
          <span className="text-lg font-bold text-slate-900">{String(item.date_of_birth ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</span>
          <span className="text-lg font-bold text-slate-900">{String(item.email ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.first_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Login</span>
          <span className="text-lg font-bold text-slate-900">{String(item.last_login ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.last_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nationality</span>
          <span className="text-lg font-bold text-slate-900">{String(item.nationality ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</span>
          <span className="text-lg font-bold text-slate-900">{String(item.password ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</span>
          <span className="text-lg font-bold text-slate-900">{String(item.phone ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.role_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</span>
          <span className="text-lg font-bold text-slate-900">{String(item.username ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default UsersDetail;