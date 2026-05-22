import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function UserPermissionsForm({ initialData, onClose, onSave }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.is_active = formData.get("is_active") === "on";
    data.is_allowed = formData.get("is_allowed") === "on";
    
    // Include id from initialData for updates
    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">UserPermissions Editor</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Input label="Action" name="action" defaultValue={initialData?.["action"]} />
          <Input label="Module" name="module" defaultValue={initialData?.["module"]} />
          <Select 
            label="Permission Id" 
            name="permission_id" 
            relation="permissions"
            placeholder="Select Permission Id"
            defaultValue={initialData?.["permission_id"]}
          />
          <Input label="Resource" name="resource" defaultValue={initialData?.["resource"]} />
          <Input label="Revoked At" name="revoked_at" type="date" defaultValue={initialData?.["revoked_at"]?.split('T')[0]} />
          <Input label="Revoked By" name="revoked_by" defaultValue={initialData?.["revoked_by"]} />
          
          <div className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50/30">
            <input type="checkbox" name="is_active" defaultChecked={!!initialData?.["is_active"]} className="w-5 h-5 accent-slate-900" />
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Is Active (Yes/No)</label>
          </div>
          
          <div className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50/30">
            <input type="checkbox" name="is_allowed" defaultChecked={!!initialData?.["is_allowed"]} className="w-5 h-5 accent-slate-900" />
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Is Allowed (Yes/No)</label>
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default UserPermissionsForm;