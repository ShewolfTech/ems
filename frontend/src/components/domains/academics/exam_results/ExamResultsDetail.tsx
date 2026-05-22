import React from "react";
import { X } from "lucide-react";

interface ExamResultsDetailProps {
  item: any;
  onClose: () => void;
}

export function ExamResultsDetail({ item, onClose }: ExamResultsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">ExamResults Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.exam_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Graded By</span>
          <span className="text-lg font-bold text-slate-900">{String(item.graded_by ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Letter</span>
          <span className="text-lg font-bold text-slate-900">{String(item.grade_letter ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Point</span>
          <span className="text-lg font-bold text-slate-900">{String(item.grade_point ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Final</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_final ?? "—")}</span>
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.status_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.student_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Comments</span>
          <span className="text-lg font-bold text-slate-900">{String(item.teacher_comments ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default ExamResultsDetail;