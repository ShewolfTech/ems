import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/domains/aacommon/index.js";

interface JobsFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "intern"];
const STATUSES = ["draft", "open", "closed", "cancelled"];

export function JobsForm({ initialData, onSave, onClose }: JobsFormProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(formData); } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-8 bg-slate-900 text-white">
        <h2 className="text-2xl font-black tracking-tight">{initialData?.id ? "Edit Job" : "New Job"}</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Title *</label>
            <input name="title" value={formData.title || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" placeholder="Job Title" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Employment Type</label>
            <select name="employment_type" value={formData.employment_type || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold">
              <option value="">Select Type</option>
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Department ID</label>
            <input name="department_id" value={formData.department_id || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
            <input name="location" value={formData.location || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Salary Min</label>
            <input name="salary_min" type="number" value={formData.salary_min || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Salary Max</label>
            <input name="salary_max" type="number" value={formData.salary_max || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Currency</label>
            <input name="salary_currency" value={formData.salary_currency || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" placeholder="USD" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
            <select name="status" value={formData.status || "draft"} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Closing Date</label>
            <input name="closing_date" type="date" value={formData.closing_date || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
          <textarea name="description" value={formData.description || ""} onChange={handleChange} rows={4} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Requirements</label>
          <textarea name="requirements" value={formData.requirements || ""} onChange={handleChange} rows={3} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Responsibilities</label>
          <textarea name="responsibilities" value={formData.responsibilities || ""} onChange={handleChange} rows={3} className="w-full px-4 py-3 border-2 rounded-xl font-bold" />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
export default JobsForm;