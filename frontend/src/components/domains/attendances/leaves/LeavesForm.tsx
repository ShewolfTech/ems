import React from "react";
import { useForm } from "react-hook-form";
import { FormField, Button } from "@/components/domains/aacommon/index.js";

export function LeavesForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useForm();
  
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Manage Leaves</h3>
        <p className="text-xs text-slate-400 font-medium italic">Fill in the fields to update the record.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        
        <div className="pt-4">
          <Button type="submit" className="w-full bg-slate-900 text-white h-12 rounded-xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-slate-200">Save Configuration</Button>
        </div>
      </form>
    </div>
  );
}


export default LeavesForm;
