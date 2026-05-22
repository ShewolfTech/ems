import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/domains/aacommon/index.js";

interface ApplicationsFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

const STATUSES = ["submitted", "screening", "interview", "offer", "rejected", "withdrawn"];

export function ApplicationsForm({ initialData, onSave, onClose }: ApplicationsFormProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => { setSaving(true); try { await onSave(formData); } finally { setSaving(false); } };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-8 bg-slate-900 text-white">
        <h2 className="text-2xl font-black tracking-tight">{initialData?.id ? "Edit Application" : "New Application"}</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">First Name *</label><input name="first_name" value={formData.first_name || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
          <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Last Name *</label><input name="last_name" value={formData.last_name || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
          <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email *</label><input name="email" type="email" value={formData.email || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
          <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label><input name="phone" value={formData.phone || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
          <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Job ID</label><input name="job_id" type="number" value={formData.job_id || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
          <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label><select name="status" value={formData.status || "submitted"} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resume URL</label><input name="resume_url" value={formData.resume_url || ""} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
        <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cover Letter</label><textarea name="cover_letter" value={formData.cover_letter || ""} onChange={handleChange} rows={4} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
        <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notes</label><textarea name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} className="w-full px-4 py-3 border-2 rounded-xl font-bold" /></div>
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
export default ApplicationsForm;