import React, { useState, useEffect } from "react";
import api from "@/utils/api.js";

export function TimetablesForm({ initialData, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    class_id: initialData?.class_id || "",
    term_id: initialData?.term_id || "",
    description: initialData?.description || "",
    is_active: initialData?.is_active ?? true,
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/academics/classes").then(r => r.data?.data || []),
      api.get("/academics/terms").then(r => r.data?.data || []),
    ]).then(([cls, trms]) => {
      setClasses(cls);
      setTerms(trms);
    }).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = {
      ...form,
      class_id: Number(form.class_id),
      term_id: Number(form.term_id),
      is_active: !!form.is_active,
    };
    if (initialData?.id) payload.id = initialData.id;
    onSave(payload);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">{initialData?.name ? "Edit Timetable" : "New Timetable"}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Term 1 Timetable"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={form.class_id}
              onChange={e => setForm({ ...form, class_id: e.target.value })}
            >
              <option value="">Select class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={form.term_id}
              onChange={e => setForm({ ...form, term_id: e.target.value })}
            >
              <option value="">Select term...</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academic_year_name || t.code || ""})</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes..."
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50">
            {loading ? "Saving..." : initialData?.id ? "Update Timetable" : "Create Timetable"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TimetablesForm;
