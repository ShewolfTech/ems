import React from "react";

export function LeavesDetail({ item }: { item: any }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Leaves Details</h3>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          
        </dl>
      </div>
    </div>
  );
}


export default LeavesDetail;
