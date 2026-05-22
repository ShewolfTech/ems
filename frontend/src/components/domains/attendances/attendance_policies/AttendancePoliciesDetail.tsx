import React from "react";
import { X } from "lucide-react";

interface AttendancePoliciesDetailProps {
  item: any;
  onClose: () => void;
}

export function AttendancePoliciesDetail({ item, onClose }: AttendancePoliciesDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AttendancePolicies Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Absent After Late Threshold</span>
          <span className="text-lg font-bold text-slate-900">{String(item.absent_after_late_threshold ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Auto Excuse Rules</span>
          <span className="text-lg font-bold text-slate-900">{String(item.auto_excuse_rules ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Consecutive Absence Alert</span>
          <span className="text-lg font-bold text-slate-900">{String(item.consecutive_absence_alert ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Late Threshold Minutes</span>
          <span className="text-lg font-bold text-slate-900">{String(item.late_threshold_minutes ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Sessions Per Day</span>
          <span className="text-lg font-bold text-slate-900">{String(item.min_sessions_per_day ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Moes Min Attendance Percent</span>
          <span className="text-lg font-bold text-slate-900">{String(item.moes_min_attendance_percent ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sms Provider</span>
          <span className="text-lg font-bold text-slate-900">{String(item.sms_provider ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Truant Definition</span>
          <span className="text-lg font-bold text-slate-900">{String(item.truant_definition ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AttendancePoliciesDetail;