import React from "react";
import { X } from "lucide-react";

interface ReportCardsDetailProps {
  item: any;
  onClose: () => void;
}

export function ReportCardsDetail({ item, onClose }: ReportCardsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">ReportCards Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attendance Percentage</span>
          <span className="text-lg font-bold text-slate-900">{String(item.attendance_percentage ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Teacher Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.class_teacher_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gpa</span>
          <span className="text-lg font-bold text-slate-900">{String(item.gpa ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Letter</span>
          <span className="text-lg font-bold text-slate-900">{String(item.grade_letter ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Percentage</span>
          <span className="text-lg font-bold text-slate-900">{String(item.percentage ?? "—")}</span>
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
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Term Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.term_id ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default ReportCardsDetail;