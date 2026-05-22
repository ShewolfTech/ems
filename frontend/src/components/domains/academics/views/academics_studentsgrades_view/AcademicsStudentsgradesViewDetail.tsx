import React from "react";
import { X } from "lucide-react";

interface AcademicsStudentsgradesViewDetailProps {
  item: any;
  onClose: () => void;
}

export function AcademicsStudentsgradesViewDetail({ item, onClose }: AcademicsStudentsgradesViewDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AcademicsStudentsgradesView Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</span>
          <span className="text-lg font-bold text-slate-900">{String(item.academic_year ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assessment_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assessment_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Status</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assessment_status ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Title</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assessment_title ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.assessment_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.class_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Letter</span>
          <span className="text-lg font-bold text-slate-900">{String(item.grade_letter ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Level</span>
          <span className="text-lg font-bold text-slate-900">{String(item.grade_level ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Point</span>
          <span className="text-lg font-bold text-slate-900">{String(item.grade_point ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Score</span>
          <span className="text-lg font-bold text-slate-900">{String(item.max_score ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</span>
          <span className="text-lg font-bold text-slate-900">{String(item.remarks ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Score</span>
          <span className="text-lg font-bold text-slate-900">{String(item.score ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.student_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.student_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.subject_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Comment</span>
          <span className="text-lg font-bold text-slate-900">{String(item.teacher_comment ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.teacher_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Term Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.term_name ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AcademicsStudentsgradesViewDetail;