import React from "react";
import { X, FileText, Mail, Phone } from "lucide-react";

interface ApplicationsDetailProps {
  item: any;
  onClose: () => void;
}

export function ApplicationsDetail({ item, onClose }: ApplicationsDetailProps) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-8 bg-slate-900 text-white">
        <h2 className="text-2xl font-black tracking-tight">{item.first_name} {item.last_name}</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</p>
            <p className="text-slate-900 font-bold flex items-center gap-2"><Mail className="w-4 h-4" />{item.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone</p>
            <p className="text-slate-900 font-bold flex items-center gap-2"><Phone className="w-4 h-4" />{item.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
            <p className="text-slate-900 font-bold capitalize">{item.status || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Applied Date</p>
            <p className="text-slate-900 font-bold">{item.applied_at ? new Date(item.applied_at).toLocaleDateString() : "—"}</p>
          </div>
        </div>
        {item.resume_url && (
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resume</p>
            <a href={item.resume_url} target="_blank" rel="noopener" className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
              <FileText className="w-4 h-4" /> View Resume
            </a>
          </div>
        )}
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cover Letter</p>
          <p className="text-slate-700 font-medium">{item.cover_letter || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notes</p>
          <p className="text-slate-700 font-medium">{item.notes || "—"}</p>
        </div>
      </div>
    </div>
  );
}
export default ApplicationsDetail;