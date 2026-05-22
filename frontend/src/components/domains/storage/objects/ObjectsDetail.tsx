import React from "react";
import { X } from "lucide-react";

interface ObjectsDetailProps {
  item: any;
  onClose: () => void;
}

export function ObjectsDetail({ item, onClose }: ObjectsDetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Objects Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        
      </div>
    </div>
  );
}
export default ObjectsDetail;