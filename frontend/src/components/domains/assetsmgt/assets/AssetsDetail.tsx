import React from "react";
import { X } from "lucide-react";

interface AssetsDetailProps {
  item: any;
  onClose: () => void;
}

export function AssetsDetail({ item, onClose }: AssetsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Assets Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Code</span>
          <span className="text-lg font-bold text-slate-900">{String(item.asset_code ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Type Id</span>
          <span className="text-lg font-bold text-slate-900">{String(item.asset_type_id ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</span>
          <span className="text-lg font-bold text-slate-900">{String(item.description ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Is Active</span>
          <span className="text-lg font-bold text-slate-900">{String(item.is_active ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</span>
          <span className="text-lg font-bold text-slate-900">{String(item.location ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</span>
          <span className="text-lg font-bold text-slate-900">{String(item.name ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nfc Tag</span>
          <span className="text-lg font-bold text-slate-900">{String(item.nfc_tag ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Purchase Date</span>
          <span className="text-lg font-bold text-slate-900">{String(item.purchase_date ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qr Code</span>
          <span className="text-lg font-bold text-slate-900">{String(item.qr_code ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Serial Number</span>
          <span className="text-lg font-bold text-slate-900">{String(item.serial_number ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</span>
          <span className="text-lg font-bold text-slate-900">{String(item.status ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor</span>
          <span className="text-lg font-bold text-slate-900">{String(item.vendor ?? "—")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Warranty Expiry</span>
          <span className="text-lg font-bold text-slate-900">{String(item.warranty_expiry ?? "—")}</span>
        </div>
      </div>
    </div>
  );
}
export default AssetsDetail;