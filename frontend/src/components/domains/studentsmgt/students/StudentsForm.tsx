import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function StudentsForm({ initialData, onClose, onSave }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.is_active = formData.get("is_active") === "on";
    
    // Include id from initialData for updates
    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">Students Editor</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Input label="Admission Date" name="admission_date" type="date" defaultValue={initialData?.["admission_date"]?.split('T')[0]} />
          <Input label="Admission No" name="admission_no" defaultValue={initialData?.["admission_no"]} />
          <Input label="Admission Status Id" name="admission_status_id" defaultValue={initialData?.["admission_status_id"]} />
          <Input label="Application Date" name="application_date" type="date" defaultValue={initialData?.["application_date"]?.split('T')[0]} />
          <Input label="Date Of Birth" name="date_of_birth" type="date" defaultValue={initialData?.["date_of_birth"]?.split('T')[0]} />
          <Input label="First Name" name="first_name" defaultValue={initialData?.["first_name"]} />
          <Input label="Gender" name="gender" defaultValue={initialData?.["gender"]} />
          <Input label="Guardian Contact" name="guardian_contact" defaultValue={initialData?.["guardian_contact"]} />
          <Input label="Guardian Name" name="guardian_name" defaultValue={initialData?.["guardian_name"]} />
          <Input label="Last Name" name="last_name" defaultValue={initialData?.["last_name"]} />
          <Input label="Previous School" name="previous_school" defaultValue={initialData?.["previous_school"]} />
          
          <div className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50/30">
            <input type="checkbox" name="is_active" defaultChecked={!!initialData?.["is_active"]} className="w-5 h-5 accent-slate-900" />
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Is Active (Yes/No)</label>
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

export default StudentsForm;