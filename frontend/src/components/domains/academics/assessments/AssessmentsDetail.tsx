import React from "react";
import { X } from "lucide-react";

interface AssessmentsDetailProps {
  item: any;
  onClose: () => void;
}

export function AssessmentsDetail({ item, onClose }: AssessmentsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Assessments Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.academic_year_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Type Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assessment_type_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.class_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.date ?? "—")}</span>
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Score</span>
          <span className="text-lg font-bold text-slate-900">{String(item.max_score ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.status_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.subject_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Comments</span>
          <span className="text-lg font-bold text-slate-900">{String(item.teacher_comments ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.teacher_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Term Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.term_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</span>
          <span className="text-lg font-bold text-slate-900">{String(item.title ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weight</span>
          <span className="text-lg font-bold text-slate-900">{String(item.weight ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AssessmentsDetail;