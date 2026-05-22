import React from "react";
import { X } from "lucide-react";

interface StudentsDetailProps {
  item: any;
  onClose: () => void;
}

export function StudentsDetail({ item, onClose }: StudentsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Students Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admission Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.admission_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admission No</span>
          <span className="text-lg font-bold text-slate-900">{String(item.admission_no ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admission Status Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.admission_status_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Application Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.application_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Of Birth</span>
          <span className="text-lg font-bold text-slate-900">{String(item.date_of_birth ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.first_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</span>
          <span className="text-lg font-bold text-slate-900">{String(item.gender ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Guardian Contact</span>
          <span className="text-lg font-bold text-slate-900">{String(item.guardian_contact ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Guardian Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.guardian_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.last_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Previous School</span>
          <span className="text-lg font-bold text-slate-900">{String(item.previous_school ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default StudentsDetail;