import React from "react";
import { X } from "lucide-react";

interface MessagesDetailProps {
  item: any;
  onClose: () => void;
}

export function MessagesDetail({ item, onClose }: MessagesDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Messages Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Body</span>
          <span className="text-lg font-bold text-slate-900">{String(item.body ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Channel</span>
          <span className="text-lg font-bold text-slate-900">{String(item.channel ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Group Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.group_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Read At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.read_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.recipient_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sender Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.sender_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sent At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.sent_at ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</span>
          <span className="text-lg font-bold text-slate-900">{String(item.status ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</span>
          <span className="text-lg font-bold text-slate-900">{String(item.subject ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default MessagesDetail;