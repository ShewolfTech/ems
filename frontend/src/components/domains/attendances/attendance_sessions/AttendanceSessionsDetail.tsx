import React from "react";
import { X } from "lucide-react";

interface AttendanceSessionsDetailProps {
  item: any;
  onClose: () => void;
}

export function AttendanceSessionsDetail({ item, onClose }: AttendanceSessionsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AttendanceSessions Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.class_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Time</span>
          <span className="text-lg font-bold text-slate-900">{String(item.end_time ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meeting Agenda</span>
          <span className="text-lg font-bold text-slate-900">{String(item.meeting_agenda ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meeting Title</span>
          <span className="text-lg font-bold text-slate-900">{String(item.meeting_title ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meeting Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.meeting_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.room_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Session Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.session_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Time</span>
          <span className="text-lg font-bold text-slate-900">{String(item.start_time ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</span>
          <span className="text-lg font-bold text-slate-900">{String(item.status ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.subject_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.teacher_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Term Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.term_id ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AttendanceSessionsDetail;