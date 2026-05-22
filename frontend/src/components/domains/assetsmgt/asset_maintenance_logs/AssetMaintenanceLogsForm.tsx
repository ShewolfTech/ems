import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function AssetMaintenanceLogsForm({ initialData, onClose, onSave }: any) {
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
        <h3 className="font-black text-2xl text-slate-900">AssetMaintenanceLogs Editor</h3>
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
          <Input label="Details" name="details" defaultValue={initialData?.["details"]} />
          <Input label="Logged At" name="logged_at" type="date" defaultValue={initialData?.["logged_at"]?.split('T')[0]} />
          <Input label="Log Type" name="log_type" defaultValue={initialData?.["log_type"]} />
          <Input label="Resolution Notes" name="resolution_notes" defaultValue={initialData?.["resolution_notes"]} />
          <Input label="Resolved At" name="resolved_at" type="date" defaultValue={initialData?.["resolved_at"]?.split('T')[0]} />
          <Input label="Technician Id" name="technician_id" defaultValue={initialData?.["technician_id"]} />
          
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default AssetMaintenanceLogsForm;