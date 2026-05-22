import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function AuditrouteReportForm({ initialData, onClose, onSave }: any) {
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
        <h3 className="font-black text-2xl text-slate-900">AuditrouteReport Editor</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Input label="Action" name="action" defaultValue={initialData?.["action"]} />
          <Input label="Audit Id" name="audit_id" defaultValue={initialData?.["audit_id"]} />
          <Input label="Diff" name="diff" defaultValue={initialData?.["diff"]} />
          <Input label="Method" name="method" defaultValue={initialData?.["method"]} />
          <Input label="Permission Resource" name="permission_resource" defaultValue={initialData?.["permission_resource"]} />
          <Input label="Resource Id" name="resource_id" defaultValue={initialData?.["resource_id"]} />
          <Input label="Resource Type" name="resource_type" defaultValue={initialData?.["resource_type"]} />
          <Select 
            label="Role Id" 
            name="role_id" 
            relation="roles"
            placeholder="Select Role Id"
            defaultValue={initialData?.["role_id"]}
          />
          <Input label="Route" name="route" defaultValue={initialData?.["route"]} />
          
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default AuditrouteReportForm;