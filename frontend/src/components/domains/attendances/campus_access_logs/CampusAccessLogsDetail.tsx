import React from "react";
import { X } from "lucide-react";

interface CampusAccessLogsDetailProps {
  item: any;
  onClose: () => void;
}

export function CampusAccessLogsDetail({ item, onClose }: CampusAccessLogsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">CampusAccessLogs Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.asset_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biometric Match Confidence</span>
          <span className="text-lg font-bold text-slate-900">{String(item.biometric_match_confidence ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biometric Scan Quality</span>
          <span className="text-lg font-bold text-slate-900">{String(item.biometric_scan_quality ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biometric Template Hash</span>
          <span className="text-lg font-bold text-slate-900">{String(item.biometric_template_hash ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Device Code</span>
          <span className="text-lg font-bold text-slate-900">{String(item.device_code ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Event At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.event_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Event Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.event_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Verified</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_verified ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location Lat</span>
          <span className="text-lg font-bold text-slate-900">{String(item.location_lat ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location Lng</span>
          <span className="text-lg font-bold text-slate-900">{String(item.location_lng ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.location_name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Method</span>
          <span className="text-lg font-bold text-slate-900">{String(item.method ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recorded At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.recorded_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.verified_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified By</span>
          <span className="text-lg font-bold text-slate-900">{String(item.verified_by ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default CampusAccessLogsDetail;