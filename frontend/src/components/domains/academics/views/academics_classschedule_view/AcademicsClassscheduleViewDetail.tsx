import React from "react";
import { X } from "lucide-react";

interface AcademicsClassscheduleViewDetailProps {
  item: any;
  onClose: () => void;
}

export function AcademicsClassscheduleViewDetail({ item, onClose }: AcademicsClassscheduleViewDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AcademicsClassscheduleView Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.class_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.class_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Time</span>
          <span className="text-lg font-bold text-slate-900">{String(item.end_time ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.lesson_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Status</span>
          <span className="text-lg font-bold text-slate-900">{String(item.lesson_status ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Title</span>
          <span className="text-lg font-bold text-slate-900">{String(item.lesson_title ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scheduled Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.scheduled_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Time</span>
          <span className="text-lg font-bold text-slate-900">{String(item.start_time ?? "—")}</span>
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Term Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.term_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Term Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.term_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Timetable Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.timetable_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Timetable Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.timetable_name ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AcademicsClassscheduleViewDetail;