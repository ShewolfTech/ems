import React from "react";

export function LeavesList({ data = [] }: { data?: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Leaves Index</h3>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{data.length} items</span>
      </div>
      <div className="p-10 text-center text-slate-400 text-xs italic font-medium">No Leaves records available for display.</div>
    </div>
  );
}


export default LeavesList;
