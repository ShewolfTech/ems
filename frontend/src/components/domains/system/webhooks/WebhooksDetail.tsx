import React from "react";
import { X } from "lucide-react";

interface WebhooksDetailProps {
  item: any;
  onClose: () => void;
}

export function WebhooksDetail({ item, onClose }: WebhooksDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Webhooks Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Event</span>
          <span className="text-lg font-bold text-slate-900">{String(item.event ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Triggered</span>
          <span className="text-lg font-bold text-slate-900">{String(item.last_triggered ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Secret</span>
          <span className="text-lg font-bold text-slate-900">{String(item.secret ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Url</span>
          <span className="text-lg font-bold text-slate-900">{String(item.url ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default WebhooksDetail;