import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function AssetAssignmentsForm({ initialData, onClose, onSave }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    
    // Include id from initialData for updates
    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AssetAssignments Editor</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Select 
            label="Asset Id" 
            name="asset_id" 
            relation="assets"
            placeholder="Select Asset Id"
            defaultValue={initialData?.["asset_id"]}
          />
          <Input label="Assigned At" name="assigned_at" type="date" defaultValue={initialData?.["assigned_at"]?.split('T')[0]} />
          <Input label="Assigned By" name="assigned_by" defaultValue={initialData?.["assigned_by"]} />
          <Input label="Assignment Type" name="assignment_type" defaultValue={initialData?.["assignment_type"]} />
          <Input label="Notes" name="notes" defaultValue={initialData?.["notes"]} />
          <Input label="Unassigned At" name="unassigned_at" type="date" defaultValue={initialData?.["unassigned_at"]?.split('T')[0]} />
          
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default AssetAssignmentsForm;