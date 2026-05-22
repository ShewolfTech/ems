import React from "react";
import { X } from "lucide-react";

interface StaffmgtPromotionHistoryViewDetailProps {
  item: any;
  onClose: () => void;
}

export function StaffmgtPromotionHistoryViewDetail({ item, onClose }: StaffmgtPromotionHistoryViewDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">StaffmgtPromotionHistoryView Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee No</span>
          <span className="text-lg font-bold text-slate-900">{String(item.employee_no ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hire Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.hire_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Department Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.new_department_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Department Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.new_department_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Role Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.new_role_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Role Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.new_role_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Old Department Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.old_department_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Old Department Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.old_department_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Old Role Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.old_role_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Old Role Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.old_role_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Promotion Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.promotion_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Promotion Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.promotion_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</span>
          <span className="text-lg font-bold text-slate-900">{String(item.remarks ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Staffmgt Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.staffmgt_id ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default StaffmgtPromotionHistoryViewDetail;