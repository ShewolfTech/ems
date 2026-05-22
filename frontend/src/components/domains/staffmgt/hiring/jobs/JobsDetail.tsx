import React from "react";
import { X } from "lucide-react";

interface JobsDetailProps {
  item: any;
  onClose: () => void;
}

export function JobsDetail({ item, onClose }: JobsDetailProps) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-8 bg-slate-900 text-white">
        <h2 className="text-2xl font-black tracking-tight">{item.title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Department</p>
            <p className="text-slate-900 font-bold">{item.department_id || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Employment Type</p>
            <p className="text-slate-900 font-bold capitalize">{item.employment_type || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
            <p className="text-slate-900 font-bold capitalize">{item.status || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
            <p className="text-slate-900 font-bold">{item.location || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range</p>
            <p className="text-slate-900 font-bold">{item.salary_min && item.salary_max ? `${item.salary_currency} ${item.salary_min} - ${item.salary_max}` : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Closing Date</p>
            <p className="text-slate-900 font-bold">{item.closing_date ? new Date(item.closing_date).toLocaleDateString() : "—"}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
          <p className="text-slate-700 font-medium">{item.description || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Requirements</p>
          <p className="text-slate-700 font-medium">{item.requirements || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Responsibilities</p>
          <p className="text-slate-700 font-medium">{item.responsibilities || "—"}</p>
        </div>
      </div>
    </div>
  );
}
export default JobsDetail;