import React from "react";
import { X } from "lucide-react";

interface FilesDetailProps {
  item: any;
  onClose: () => void;
}

export function FilesDetail({ item, onClose }: FilesDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Files Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</span>
          <span className="text-lg font-bold text-slate-900">{String(item.description ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">File Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.file_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Public</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_public ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mime Type</span>
          <span className="text-lg font-bold text-slate-900">{String(item.mime_type ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Owner Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.owner_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Size</span>
          <span className="text-lg font-bold text-slate-900">{String(item.size ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Storage Url</span>
          <span className="text-lg font-bold text-slate-900">{String(item.storage_url ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Uploaded At</span>
          <span className="text-lg font-bold text-slate-900">{String(item.uploaded_at ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default FilesDetail;